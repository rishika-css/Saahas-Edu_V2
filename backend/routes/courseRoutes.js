import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/courses
// @desc    Get all courses (Simplified list)
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().select('-modules'); // Just titles/desc for the list
        res.json(courses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/courses/:id
// @desc    Adaptive Content Fetch (The "Smart" logic)
router.get('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        const user = await User.findById(req.user); // Fetch profile from the Auth Token

        if (!course) return res.status(404).json({ msg: 'Course not found' });

        // Adaptive Learning Engine: Filter content based on Profile 
        const adaptiveModules = course.modules.map(mod => {
            let finalContent = mod.content;

            // Cognitive Support: Swap for simplified text if preference is set 
            if (user.accessibilityProfile.preferences.simplifiedText && mod.simplifiedContent) {
                finalContent = mod.simplifiedContent;
            }

            return {
                title: mod.title,
                content: finalContent,
                videoUrl: mod.videoUrl,
                // Sensory Support: Alert frontend if Sign Overlays should be active 
                activeSignOverlay: user.accessibilityProfile.preferences.signLanguageOverlays && mod.hasSignLanguageOverlay
            };
        });

        res.json({
            title: course.title,
            instructor: course.instructor,
            modules: adaptiveModules
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/courses
// @desc    Admin/Educator route to add inclusive content
router.post('/', auth, async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        const course = await newCourse.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

export default router;