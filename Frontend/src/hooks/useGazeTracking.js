import { useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

/**
 * AI-powered gaze tracking using TensorFlow Face Landmarks Detection.
 *
 * Detects the user's face via webcam and analyzes eye landmark positions
 * to determine if the user is looking away from the screen. Also detects
 * when no face is visible at all.
 *
 * @param {Function} onGazeAway - Called when user's gaze drifts away from screen
 * @param {Function} onFaceNotDetected - Called when no face is found in the frame
 * @param {React.RefObject} videoRef - Ref to the <video> element used for rendering
 * @param {Function} onReady - Called once the model is loaded and tracking begins
 */
export function useGazeTracking(onGazeAway, onFaceNotDetected, videoRef, onReady) {
    const streamRef = useRef(null);
    const detectorRef = useRef(null);
    const animFrameRef = useRef(null);
    const readyFired = useRef(false);
    const gazeAwayFrames = useRef(0);
    const noFaceFrames = useRef(0);
    const lastGazeAlert = useRef(0);
    const lastFaceAlert = useRef(0);

    // Thresholds
    const GAZE_AWAY_FRAME_THRESHOLD = 15;   // ~0.5s of looking away before alert
    const NO_FACE_FRAME_THRESHOLD = 30;     // ~1s of no face before alert
    const ALERT_COOLDOWN_MS = 8000;          // minimum time between alerts

    // Analyze iris position relative to eye bounding box to determine gaze direction
    const isGazingAway = useCallback((face) => {
        try {
            const keypoints = face.keypoints;
            if (!keypoints || keypoints.length < 400) return false;

            // MediaPipe Face Mesh iris landmarks (right eye: 468-472, left eye: 473-477)
            // Eye corners for reference frame
            const leftEyeInner = keypoints.find(k => k.name === 'leftEyeIris') || keypoints[473];
            const rightEyeInner = keypoints.find(k => k.name === 'rightEyeIris') || keypoints[468];

            if (!leftEyeInner || !rightEyeInner) return false;

            // Get eye corner landmarks for bounding reference
            // Left eye corners: 362 (inner), 263 (outer)
            // Right eye corners: 133 (inner), 33 (outer)
            const leftInner = keypoints[362];
            const leftOuter = keypoints[263];
            const rightInner = keypoints[133];
            const rightOuter = keypoints[33];

            if (!leftInner || !leftOuter || !rightInner || !rightOuter) return false;

            // Calculate iris position ratio within eye (0 = inner corner, 1 = outer corner)
            const leftEyeWidth = Math.abs(leftOuter.x - leftInner.x);
            const rightEyeWidth = Math.abs(rightOuter.x - rightInner.x);

            if (leftEyeWidth < 5 || rightEyeWidth < 5) return false;

            const leftIrisRatio = (leftEyeInner.x - leftInner.x) / leftEyeWidth;
            const rightIrisRatio = (rightEyeInner.x - rightInner.x) / rightEyeWidth;

            const avgRatio = (leftIrisRatio + rightIrisRatio) / 2;

            // If iris is too far to either side, user is looking away
            // Center is ~0.4-0.6, looking away is < 0.2 or > 0.8
            if (avgRatio < 0.15 || avgRatio > 0.85) return true;

            // Also check vertical gaze (looking up/down)
            const leftEyeTop = keypoints[386];
            const leftEyeBottom = keypoints[374];
            if (leftEyeTop && leftEyeBottom) {
                const eyeHeight = Math.abs(leftEyeBottom.y - leftEyeTop.y);
                if (eyeHeight > 2) {
                    const irisVertRatio = (leftEyeInner.y - leftEyeTop.y) / eyeHeight;
                    if (irisVertRatio < 0.1 || irisVertRatio > 0.9) return true;
                }
            }

            return false;
        } catch {
            return false;
        }
    }, []);

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
                    // Wait for video to be ready
                    await new Promise(resolve => {
                        videoRef.current.onloadeddata = resolve;
                    });
                }

                // 3. Load Face Landmarks Detection model
                const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                const detector = await faceLandmarksDetection.createDetector(model, {
                    runtime: 'tfjs',
                    refineLandmarks: true,  // enables iris landmarks
                    maxFaces: 1,
                });

                if (cancelled) {
                    detector.dispose();
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                detectorRef.current = detector;

                // Signal ready
                if (!readyFired.current) {
                    readyFired.current = true;
                    onReady?.();
                }

                // 4. Start detection loop
                const detectLoop = async () => {
                    if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
                        animFrameRef.current = requestAnimationFrame(detectLoop);
                        return;
                    }

                    try {
                        const faces = await detector.estimateFaces(videoRef.current, {
                            flipHorizontal: false,
                        });

                        const now = Date.now();

                        if (!faces || faces.length === 0) {
                            // No face detected
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
                            const face = faces[0];

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
                    } catch (err) {
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
            if (detectorRef.current) {
                try { detectorRef.current.dispose(); } catch { }
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []); // run once on mount
}
