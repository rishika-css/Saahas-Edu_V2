import BehaviorLog from "../models/BehaviorLog.js";
import TestSession from "../models/TestSession.js";
import { analyzeAndAdjust } from "../services/adaptiveEngine.js";

export const logBehavior = async (req, res) => {
  try {
    const { studentId, sessionId, event, timestamp, details } = req.body;

    // Save the behavior log
    await BehaviorLog.create({
      studentId,
      sessionId,
      event,
      timestamp,
      details,
    });

    // Update behavior summary on the session
    const fieldMap = {
      idle: "behaviorSummary.idleCount",
      rapid_skip: "behaviorSummary.rapidSkipCount",
      gaze_away: "behaviorSummary.gazeAwayCount",
      face_not_detected: "behaviorSummary.faceNotDetectedCount",
      tab_switch: "behaviorSummary.tabSwitchCount",
    };

    if (fieldMap[event]) {
      await TestSession.findByIdAndUpdate(sessionId, {
        $inc: { [fieldMap[event]]: 1 },
      });
    }

    // Run adaptive engine and get timer adjustment
    const session = await TestSession.findById(sessionId);
    const adjustment = analyzeAndAdjust(
      session.behaviorSummary,
      session.timeRemaining
    );

    if (adjustment.adjusted) {
      await TestSession.findByIdAndUpdate(sessionId, {
        timeRemaining: adjustment.newTime,
        $inc: { "behaviorSummary.timerAdjustments": 1 },
      });
    }

    res.json({ success: true, timerAdjustment: adjustment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
