import mongoose from "mongoose";

const testSessionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selected: String,
        isCorrect: Boolean,
        timeSpent: { type: Number, default: 0 }
    }],
    timeAlloted: { type: Number, default: 60 },
    timeRemaining: { type: Number, default: 60 },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
    score: { type: Number, default: 0 },
    completedAt: { type: Date },
    behaviorSummary: {
        idleCount: { type: Number, default: 0 },
        rapidSkipCount: { type: Number, default: 0 },
        gazeAwayCount: { type: Number, default: 0 },
        faceNotDetectedCount: { type: Number, default: 0 },
        tabSwitchCount: { type: Number, default: 0 },
        timerAdjustments: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model("TestSession", testSessionSchema);
