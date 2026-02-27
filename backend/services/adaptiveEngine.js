/**
 * Adaptive Engine – analyzes behavior signals and adjusts test timer.
 *
 * Called by behaviorController after every logged event to decide whether
 * the student needs extra time (e.g. if they appear distracted or stressed).
 */

const STRESS_THRESHOLD = 5;   // combined bad-signal count before we extend time
const EXTRA_TIME_SECONDS = 15; // seconds added per adjustment
const MAX_ADJUSTMENTS = 3;     // cap so time can't grow unbounded

export function analyzeAndAdjust(behaviorSummary, timeRemaining) {
    if (!behaviorSummary) {
        return { adjusted: false, reason: "no behavior data", newTime: timeRemaining };
    }

    // Already hit the adjustment cap
    if ((behaviorSummary.timerAdjustments || 0) >= MAX_ADJUSTMENTS) {
        return { adjusted: false, reason: "max adjustments reached", newTime: timeRemaining };
    }

    const stressSignals =
        (behaviorSummary.idleCount || 0) +
        (behaviorSummary.gazeAwayCount || 0) +
        (behaviorSummary.faceNotDetectedCount || 0) +
        (behaviorSummary.tabSwitchCount || 0);

    if (stressSignals >= STRESS_THRESHOLD) {
        const newTime = timeRemaining + EXTRA_TIME_SECONDS;
        return {
            adjusted: true,
            reason: `stress signals (${stressSignals}) exceeded threshold`,
            newTime,
            addedSeconds: EXTRA_TIME_SECONDS,
        };
    }

    return { adjusted: false, reason: "within normal range", newTime: timeRemaining };
}
