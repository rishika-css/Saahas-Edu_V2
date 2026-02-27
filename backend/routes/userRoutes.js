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

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Student already registered' });

        user = new User({
            name,
            email,
            password, // Password will be hashed automatically by the model pre-save hook
            accessibilityProfile
        });

        await user.save();

        // Return a token so they are logged in immediately after signing up
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during intake');
    }
});

// @route   POST /api/users/login
// @desc    Authenticate student & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // 2. Compare the plain-text password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // 3. Create a JWT (The "Key" your frontend needs to stay logged in)
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users/me
// @desc    Get current user profile (Testing Auth)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

export default router;