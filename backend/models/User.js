import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // This matches the "Needs Assessment" in your flowchart
    accessibilityProfile: {
        disabilityType: {
            type: String,
            enum: ['visual', 'hearing', 'motor', 'cognitive', 'speech', 'none'],
            default: 'none'
        },
        preferences: {
            screenReader: { type: Boolean, default: false }, // For Sensory Support
            signLanguageOverlays: { type: Boolean, default: false }, // From your Architecture
            hapticFeedback: { type: Boolean, default: false }, // For Assistive Tech
            simplifiedText: { type: Boolean, default: false } // For Cognitive Support
        }
    }
});

// This logic runs every time a user is saved
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.model('User', UserSchema);