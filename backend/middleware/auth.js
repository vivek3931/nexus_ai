// middleware/auth.js
import jwt from 'jsonwebtoken';

import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET; // Access your JWT secret from environment variables

function auth(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Common practice for JWTs

    // Check if not token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach the user information (e.g., user ID) to the request object
        // This makes req.user.id available in your route handlers
        req.user = decoded.user;
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        // If token is not valid (e.g., expired, malformed, tampered)
        res.status(401).json({ message: 'Token is not valid' });
    }
}

// Export the middleware function as a default export
export default auth;