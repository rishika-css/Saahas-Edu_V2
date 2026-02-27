import jwt from 'jsonwebtoken';

export default function (req, res, next) {
    // 1. Get token from header
    const token = req.header('x-auth-token');

    // 2. Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. Verify token
    try {
        // Ensure JWT_SECRET exists to prevent crashing the server
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in .env");
            return res.status(500).json({ msg: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the user object to req.user (standard MERN pattern)
        // Note: If your token payload was { id: user._id }, use decoded.id
        req.user = decoded; 
        
        // CRITICAL: Call next() to move to the next middleware/controller
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
}