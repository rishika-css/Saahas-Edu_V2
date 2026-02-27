import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/users/register
// @desc    Student Intake & Needs Assessment (Sign Up)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, accessibilityProfile } = req.body;

        // 1. Validation: Ensure all fields are present
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Student already registered' });

        user = new User({
            name,
            email,
            password, 
            accessibilityProfile
        });

        await user.save();

        // 2. Safety Check: Ensure JWT_SECRET is loaded
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is not defined in .env');
            return res.status(500).json({ msg: 'Server Configuration Error' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        // Return structured user data to avoid sending sensitive info back
        res.status(201).json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                accessibilityProfile: user.accessibilityProfile
            } 
        });

    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ msg: 'Server error during intake', error: err.message });
    }
});

// @route   POST /api/users/login
// @desc    Authenticate student & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Validation
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // 2. Compare the plain-text password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // 3. Safety Check: JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET is not defined in .env');
            return res.status(500).json({ msg: 'Server Configuration Error' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                accessibilityProfile: user.accessibilityProfile
            }
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/users/me
// @desc    Get current user profile (Testing Auth)
router.get('/me', auth, async (req, res) => {
    try {
        // req.user comes from your auth middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error("Auth Route Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;