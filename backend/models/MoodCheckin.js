import mongoose from "mongoose";

const moodCheckinSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mood: { type: Number, required: true, min: 1, max: 5 },
    label: { type: String, enum: ["Great", "Good", "Okay", "Low", "Bad"], required: true },
}, { timestamps: true });

// One check-in per user per calendar day
moodCheckinSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("MoodCheckin", moodCheckinSchema);
