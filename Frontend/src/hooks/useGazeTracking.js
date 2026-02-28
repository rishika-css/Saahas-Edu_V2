import { useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

/**
 * Lightweight gaze tracking using BlazeFace (tiny, <200KB model).
 *
 * Detects the user's face via webcam and estimates gaze direction from
 * face position and eye/nose landmark positions. Also detects when
 * no face is visible (user left the screen).
 *
 * BlazeFace loads in <1 second vs FaceMesh's 5-10 seconds.
 *
 * @param {Function} onGazeAway - Called when user's gaze drifts away
 * @param {Function} onFaceNotDetected - Called when no face is found
 * @param {React.RefObject} videoRef - Ref to the <video> element
 * @param {Function} onReady - Called once the model is loaded
 */
export function useGazeTracking(onGazeAway, onFaceNotDetected, videoRef, onReady) {
    const streamRef = useRef(null);
    const modelRef = useRef(null);
    const animFrameRef = useRef(null);
    const readyFired = useRef(false);
    const gazeAwayFrames = useRef(0);
    const noFaceFrames = useRef(0);
    const lastGazeAlert = useRef(0);
    const lastFaceAlert = useRef(0);

    // Thresholds
    const GAZE_AWAY_FRAME_THRESHOLD = 18;   // ~0.6s of looking away
    const NO_FACE_FRAME_THRESHOLD = 30;     // ~1s of no face
    const ALERT_COOLDOWN_MS = 8000;

    // Analyze face landmarks from BlazeFace to estimate gaze direction
    const isGazingAway = useCallback((prediction) => {
        try {
            // BlazeFace provides:
            // - topLeft, bottomRight: face bounding box
            // - landmarks: [rightEye, leftEye, nose, mouth, rightEar, leftEar]
            const landmarks = prediction.landmarks;
            if (!landmarks || landmarks.length < 6) return false;

            const rightEye = landmarks[0];
            const leftEye = landmarks[1];
            const nose = landmarks[2];
            const rightEar = landmarks[4];
            const leftEar = landmarks[5];

            // Face width from ear to ear
            const faceWidth = Math.abs(rightEar[0] - leftEar[0]);
            if (faceWidth < 20) return false;

            // Eye center
            const eyeCenterX = (rightEye[0] + leftEye[0]) / 2;

            // Nose position relative to eye center — indicates head turn
            const noseOffsetX = nose[0] - eyeCenterX;
            const turnRatio = noseOffsetX / faceWidth;

            // If nose is too far left or right of eye center, face is turned away
            // Threshold: |turnRatio| > 0.25 means significant head turn
            if (Math.abs(turnRatio) > 0.25) return true;

            // Check if face is too far from center of frame (looking at something else)
            const videoWidth = videoRef.current?.videoWidth || 320;
            const faceCenterX = (prediction.topLeft[0] + prediction.bottomRight[0]) / 2;
            const frameCenterX = videoWidth / 2;
            const offsetFromCenter = Math.abs(faceCenterX - frameCenterX) / videoWidth;

            // Face too far from frame center means they're looking sideways
            if (offsetFromCenter > 0.35) return true;

            // Vertical check: looking up/down
            const eyeCenterY = (rightEye[1] + leftEye[1]) / 2;
            const noseOffsetY = nose[1] - eyeCenterY;
            const faceHeight = Math.abs(prediction.bottomRight[1] - prediction.topLeft[1]);
            if (faceHeight > 20) {
                const vertRatio = noseOffsetY / faceHeight;
                // Very small or very large ratio means extreme head tilt
                if (vertRatio < 0.05 || vertRatio > 0.45) return true;
            }

            return false;
        } catch {
            return false;
        }
    }, [videoRef]);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                // 1. Set up TensorFlow.js backend
                await tf.setBackend('webgl');
                await tf.ready();

                // 2. Get camera stream
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 320, height: 240 },
                });

                if (cancelled) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await new Promise(resolve => {
                        videoRef.current.onloadeddata = resolve;
                    });
                }

                // 3. Load BlazeFace model (tiny, ~200KB, loads in <1s)
                const model = await blazeface.load();

                if (cancelled) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                modelRef.current = model;

                // Signal ready
                if (!readyFired.current) {
                    readyFired.current = true;
                    onReady?.();
                }

                // 4. Detection loop (~30fps)
                const detectLoop = async () => {
                    if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
                        animFrameRef.current = requestAnimationFrame(detectLoop);
                        return;
                    }

                    try {
                        const predictions = await model.estimateFaces(videoRef.current, false);
                        const now = Date.now();

                        if (!predictions || predictions.length === 0) {
                            noFaceFrames.current += 1;
                            gazeAwayFrames.current = 0;

                            if (
                                noFaceFrames.current >= NO_FACE_FRAME_THRESHOLD &&
                                now - lastFaceAlert.current > ALERT_COOLDOWN_MS
                            ) {
                                lastFaceAlert.current = now;
                                noFaceFrames.current = 0;
                                onFaceNotDetected?.();
                            }
                        } else {
                            noFaceFrames.current = 0;
                            const face = predictions[0];

                            if (isGazingAway(face)) {
                                gazeAwayFrames.current += 1;

                                if (
                                    gazeAwayFrames.current >= GAZE_AWAY_FRAME_THRESHOLD &&
                                    now - lastGazeAlert.current > ALERT_COOLDOWN_MS
                                ) {
                                    lastGazeAlert.current = now;
                                    gazeAwayFrames.current = 0;
                                    onGazeAway?.();
                                }
                            } else {
                                gazeAwayFrames.current = 0;
                            }
                        }
                    } catch {
                        // Detection error — skip frame
                    }

                    animFrameRef.current = requestAnimationFrame(detectLoop);
                };

                detectLoop();

            } catch (err) {
                console.warn('Gaze tracking init failed:', err.message);
                // Still signal ready so the test isn't blocked
                if (!readyFired.current) {
                    readyFired.current = true;
                    onReady?.();
                }
            }
        }

        init();

        return () => {
            cancelled = true;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []); // run once on mount
}
