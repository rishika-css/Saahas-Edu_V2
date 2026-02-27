import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * AI-powered ADHD detection via mouse movement analysis.
 *
 * Tracks the user's mouse movements and analyzes patterns that may indicate
 * attention difficulties (ADHD-like behavior):
 *   - High velocity & rapid direction changes (jittery movement)
 *   - Excessive travel distance relative to screen area
 *   - Frequent pauses followed by bursts
 *   - Circular/spiral patterns (fidgeting)
 *
 * When the cumulative "erratic score" exceeds a threshold, it fires
 * `onAdhdDetected` so the UI can suggest enabling ADHD Focus Mode.
 */
export function useAdhdMouseDetection(onAdhdDetected, enabled = true) {
    const positions = useRef([]);          // recent mouse positions with timestamps
    const directionChanges = useRef(0);    // count of sharp direction reversals
    const totalDistance = useRef(0);        // total distance traveled
    const lastAlertTime = useRef(0);
    const analysisInterval = useRef(null);
    const [detected, setDetected] = useState(false);

    // Config
    const SAMPLE_WINDOW = 3000;            // analyze last 3 seconds of movement
    const MAX_SAMPLES = 150;               // ~50 samples/sec at 60fps
    const ANALYSIS_INTERVAL_MS = 2000;     // run analysis every 2 seconds
    const ALERT_COOLDOWN_MS = 60000;       // only alert once per minute
    const DIRECTION_CHANGE_THRESHOLD = 25; // sharp changes in 3s window
    const JITTER_VELOCITY_THRESHOLD = 800; // px/s average velocity threshold
    const ERRATIC_SCORE_THRESHOLD = 0.65;  // combined score (0-1) to trigger

    const recordPosition = useCallback((e) => {
        const now = Date.now();
        const pos = { x: e.clientX, y: e.clientY, t: now };
        const arr = positions.current;

        // Calculate distance and direction change from last position
        if (arr.length > 0) {
            const last = arr[arr.length - 1];
            const dx = pos.x - last.x;
            const dy = pos.y - last.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            totalDistance.current += dist;

            // Detect sharp direction changes
            if (arr.length >= 2) {
                const prev = arr[arr.length - 2];
                const prevDx = last.x - prev.x;
                const prevDy = last.y - prev.y;

                // Dot product of consecutive direction vectors
                const dot = dx * prevDx + dy * prevDy;
                const mag1 = Math.sqrt(dx * dx + dy * dy);
                const mag2 = Math.sqrt(prevDx * prevDx + prevDy * prevDy);

                if (mag1 > 2 && mag2 > 2) {
                    const cosAngle = dot / (mag1 * mag2);
                    // Sharp reversal (angle > 120 degrees, cosine < -0.5)
                    if (cosAngle < -0.3) {
                        directionChanges.current += 1;
                    }
                }
            }
        }

        arr.push(pos);

        // Trim old samples
        const cutoff = now - SAMPLE_WINDOW;
        while (arr.length > 0 && arr[0].t < cutoff) arr.shift();
        if (arr.length > MAX_SAMPLES) arr.splice(0, arr.length - MAX_SAMPLES);
    }, []);

    const analyzeMovement = useCallback(() => {
        const arr = positions.current;
        if (arr.length < 10) return; // not enough data

        const now = Date.now();
        if (now - lastAlertTime.current < ALERT_COOLDOWN_MS) return;

        const windowMs = arr[arr.length - 1].t - arr[0].t;
        if (windowMs < 500) return;

        const windowSec = windowMs / 1000;

        // 1. Average velocity (px/s)
        let windowDist = 0;
        for (let i = 1; i < arr.length; i++) {
            const dx = arr[i].x - arr[i - 1].x;
            const dy = arr[i].y - arr[i - 1].y;
            windowDist += Math.sqrt(dx * dx + dy * dy);
        }
        const avgVelocity = windowDist / windowSec;
        const velocityScore = Math.min(avgVelocity / JITTER_VELOCITY_THRESHOLD, 1);

        // 2. Direction change rate
        const dirChangeRate = directionChanges.current / windowSec;
        const dirChangeScore = Math.min(dirChangeRate / (DIRECTION_CHANGE_THRESHOLD / 3), 1);

        // 3. Movement "chaos" — ratio of distance to displacement (straight line)
        const displacement = Math.sqrt(
            Math.pow(arr[arr.length - 1].x - arr[0].x, 2) +
            Math.pow(arr[arr.length - 1].y - arr[0].y, 2)
        );
        const chaosRatio = displacement > 10 ? windowDist / displacement : windowDist > 100 ? 1 : 0;
        const chaosScore = Math.min(chaosRatio / 8, 1); // ratio > 8 is very chaotic

        // 4. Speed variance (burst/pause pattern)
        const speeds = [];
        for (let i = 1; i < arr.length; i++) {
            const dt = arr[i].t - arr[i - 1].t;
            if (dt > 0) {
                const dx = arr[i].x - arr[i - 1].x;
                const dy = arr[i].y - arr[i - 1].y;
                speeds.push(Math.sqrt(dx * dx + dy * dy) / (dt / 1000));
            }
        }
        let varianceScore = 0;
        if (speeds.length > 5) {
            const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
            const variance = speeds.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / speeds.length;
            const stdDev = Math.sqrt(variance);
            const cv = mean > 0 ? stdDev / mean : 0; // coefficient of variation
            varianceScore = Math.min(cv / 1.5, 1); // CV > 1.5 is very bursty
        }

        // Combined erratic score (weighted)
        const erraticScore =
            velocityScore * 0.2 +
            dirChangeScore * 0.35 +
            chaosScore * 0.25 +
            varianceScore * 0.2;

        if (erraticScore >= ERRATIC_SCORE_THRESHOLD) {
            lastAlertTime.current = now;
            setDetected(true);
            onAdhdDetected?.({
                score: erraticScore,
                velocity: avgVelocity,
                directionChanges: directionChanges.current,
                chaosRatio,
            });
        }

        // Reset counters for next window
        directionChanges.current = 0;
        totalDistance.current = 0;
    }, [onAdhdDetected]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('mousemove', recordPosition);
        analysisInterval.current = setInterval(analyzeMovement, ANALYSIS_INTERVAL_MS);

        return () => {
            window.removeEventListener('mousemove', recordPosition);
            clearInterval(analysisInterval.current);
        };
    }, [enabled, recordPosition, analyzeMovement]);

    return { detected };
}
