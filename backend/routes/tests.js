import express from "express";
import { startTest, nextQuestion, answerQuestion, submitTest } from "../controllers/testController.js";

const router = express.Router();

router.post("/start", startTest);
router.get("/next/:sessionId", nextQuestion);
router.post("/answer", answerQuestion);
router.post("/submit", submitTest);

export default router;