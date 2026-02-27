import express from "express";
import { logBehavior } from "../controllers/behaviorController.js";

const router = express.Router();

router.post("/log", logBehavior);

export default router;