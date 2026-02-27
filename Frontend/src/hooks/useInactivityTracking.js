import { useEffect, useRef } from 'react';

export function useInactivityTracking(onIdle, timeoutMs = 10000) {
    const timerRef = useRef(null);

    useEffect(() => {
        const resetTimer = () => {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                onIdle();
            }, timeoutMs);
        };

        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        events.forEach((evt) => window.addEventListener(evt, resetTimer));

        // Start initial timer
        resetTimer();

        return () => {
            clearTimeout(timerRef.current);
            events.forEach((evt) => window.removeEventListener(evt, resetTimer));
        };
    }, [onIdle, timeoutMs]);
}
