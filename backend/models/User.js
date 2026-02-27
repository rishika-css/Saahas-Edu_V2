import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // This matches the "Needs Assessment" in your flowchart
  accessibilityProfile: {
    disabilityType: {
      type: String,
      enum: ["visual", "hearing", "motor", "cognitive", "speech", "none"],
      default: "none",
    },
    preferences: {
      screenReader: { type: Boolean, default: false }, // For Sensory Support
      signLanguageOverlays: { type: Boolean, default: false }, // From your Architecture
      hapticFeedback: { type: Boolean, default: false }, // For Assistive Tech
      simplifiedText: { type: Boolean, default: false }, // For Cognitive Support
    },
  },
});

// Hash password before saving (Mongoose 8+ async middleware — no `next` callback)
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  // Skip if already hashed (e.g. hashed in the route before save)
  if (this.password.startsWith("$2b$") || this.password.startsWith("$2a$")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", UserSchema);
