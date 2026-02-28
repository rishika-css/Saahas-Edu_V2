import express from "express";
import auth from "../middleware/auth.js";
import MoodCheckin from "../models/MoodCheckin.js";
import TestSession from "../models/TestSession.js";

const router = express.Router();

// GET /api/dashboard/stats — real-time dashboard statistics
router.get("/stats", auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // ── 1. Current Streak (consecutive days with mood check-ins) ──
        let streak = 0;
        const moodCheckins = await MoodCheckin.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        if (moodCheckins.length > 0) {
            // Build set of unique dates (YYYY-MM-DD)
            const checkinDates = new Set(
                moodCheckins.map((c) => {
                    const d = new Date(c.createdAt);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                })
            );

            // Walk backwards from today
            const today = new Date();
            for (let i = 0; i < 365; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
                if (checkinDates.has(key)) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        // ── 2. Quiz Average Score ──
        const completedTests = await TestSession.find({
            studentId: userId,
            status: "completed",
        }).lean();

        let quizAvg = 0;
        if (completedTests.length > 0) {
            const totalScore = completedTests.reduce((sum, t) => sum + (t.score || 0), 0);
            quizAvg = Math.round(totalScore / completedTests.length);
        }

        // ── 3. Hours Learned (from test sessions) ──
        let hoursLearned = 0;
        if (completedTests.length > 0) {
            const totalMinutes = completedTests.reduce((sum, t) => {
                const timeUsed = (t.timeAlloted || 0) - (t.timeRemaining || 0);
                return sum + Math.max(0, timeUsed);
            }, 0);
            // timeAlloted is in seconds, convert to hours
            hoursLearned = Math.round((totalMinutes / 3600) * 10) / 10; // 1 decimal
        }

        res.json({
            streak,
            quizAvg,
            hoursLearned,
            testsCompleted: completedTests.length,
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

export default router;
