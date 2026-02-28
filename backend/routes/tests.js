import express from "express";
import { startTest, nextQuestion, answerQuestion, submitTest } from "../controllers/testController.js";
import auth from "../middleware/auth.js";
import TestSession from "../models/TestSession.js";

const router = express.Router();

router.post("/start", startTest);
router.get("/next/:sessionId", nextQuestion);
router.post("/answer", answerQuestion);
router.post("/submit", submitTest);

// Frontend-only test: save result directly (no session needed)
router.post("/save-result", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { score, correct, total, timeAlloted, timeRemaining } = req.body;

        const session = await TestSession.create({
            studentId: userId,
            questions: [],
            answers: [],
            timeAlloted: timeAlloted || 60,
            timeRemaining: timeRemaining || 0,
            status: "completed",
            score: score || 0,
            completedAt: new Date(),
        });

        res.json({ msg: "Result saved", sessionId: session._id });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

export default router;