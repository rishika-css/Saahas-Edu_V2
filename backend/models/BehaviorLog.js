import mongoose from "mongoose";

const behaviorSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "TestSession", required: true },
  event: {
    type: String,
    enum: ["idle", "rapid_skip", "gaze_away", "face_not_detected", "time_on_question", "tab_switch"],
    required: true
  },
  timestamp: { type: Number, required: true },
  details: { type: Object, default: {} }
});

export default mongoose.model("BehaviorLog", behaviorSchema);