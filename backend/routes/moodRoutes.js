import express from "express";
import auth from "../middleware/auth.js";
import MoodCheckin from "../models/MoodCheckin.js";

const router = express.Router();

// POST /api/mood — log a mood check-in (one per day)
router.post("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { mood, label } = req.body;

        if (!mood || !label) {
            return res.status(400).json({ msg: "mood and label are required" });
        }

        // Prevent duplicate check-in for the same calendar day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existing = await MoodCheckin.findOne({
            userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });

        if (existing) {
            // Update today's check-in instead of creating duplicate
            existing.mood = mood;
            existing.label = label;
            await existing.save();
            return res.json({ msg: "Mood updated for today", checkin: existing });
        }

        const checkin = await MoodCheckin.create({ userId, mood, label });
        res.json({ msg: "Mood logged", checkin });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// GET /api/mood/history — last 30 days of mood data
router.get("/history", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const history = await MoodCheckin.find({
            userId,
            createdAt: { $gte: thirtyDaysAgo },
        }).sort({ createdAt: -1 });

        res.json(history);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

export default router;
