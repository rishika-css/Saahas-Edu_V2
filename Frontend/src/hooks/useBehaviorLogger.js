import { useCallback } from 'react';
import { behaviorAPI } from '../services/api';

export function useBehaviorLogger(studentId, sessionId) {
    const logEvent = useCallback(async (event, details = {}) => {
        try {
            const data = await behaviorAPI.log({
                studentId,
                sessionId,
                event,
                timestamp: Date.now(),
                details,
            });
            return data;
        } catch (err) {
            console.warn('Behavior log failed:', err.message);
            return null;
        }
    }, [studentId, sessionId]);

    return { logEvent };
}
