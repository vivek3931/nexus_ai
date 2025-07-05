import express from 'express';
const router = express.Router(); // This line is fine
import bcrypt from 'bcryptjs';    // ES Module import
import jwt from 'jsonwebtoken';  // ES Module import
import User from '../models/User.js'; // ES Module import, explicitly .js extension
import 'dotenv/config';          // ES Module way to load dotenv, if not already loaded in server.js

const JWT_SECRET = process.env.JWT_SECRET;

// --- Middleware to verify JWT ---
// This function will be used to protect routes that require authentication.
function auth(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Common header for JWT

    // Check if no token
    if (!token) {
        // 401 Unauthorized: User needs to authenticate
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // jwt.verify() decodes the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user from payload to request object, so it's accessible in subsequent middleware/route handlers
        req.user = decoded.user;
        next(); // Call next middleware/route handler
    } catch (e) {
        // If token is not valid (e.g., expired, tampered)
        res.status(401).json({ msg: 'Token is not valid' });
    }
}

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    // Destructure data from request body
    const { username, email, password } = req.body;

    // Basic validation: Check if all required fields are present
    if (!username || !email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Basic password length validation
    if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if user with given email or username already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            // 400 Bad Request: User already exists
            return res.status(400).json({ msg: 'User with that email or username already exists' });
        }

        // Create a new User instance
        user = new User({
            username,
            email,
            password // Mongoose will store this, but we'll hash it before saving
        });

        // Hash password using bcrypt
        // genSalt generates a salt, a random string to add to the password before hashing
        const salt = await bcrypt.genSalt(10); // 10 rounds is a good default for security vs. performance
        user.password = await bcrypt.hash(password, salt); // Hash the password

        await user.save(); // Save the new user document to MongoDB

        // Create JWT payload (data to be stored in the token)
        const payload = {
            user: {
                id: user.id, // Mongoose provides an 'id' getter for '_id'
                username: user.username
            }
        };

        // Sign the JWT token
        jwt.sign(
            payload,
            JWT_SECRET, // Your secret key from .env
            { expiresIn: '30m' }, // Token expiration time (e.g., 30 minutes)
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err.message);
                    throw err; // Throw error if signing fails
                }
                // 201 Created: User successfully registered and token issued
                res.status(201).json({
                    msg: 'User registered successfully!',
                    token, // Send the token back to the client
                    user: { // Also send back some user details (excluding password)
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                });
            }
        );

    } catch (err) {
        console.error('Error in register route:', err.message);
        res.status(500).send('Server error'); // 500 Internal Server Error
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    // Destructure credentials from request body
    const { username_or_email, password } = req.body;

    // Basic validation: Check if fields are present
    if (!username_or_email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Find user by username or email
        let user = await User.findOne({
            $or: [{ username: username_or_email }, { email: username_or_email }]
        });

        // If user not found
        if (!user) {
            // 400 Bad Request: Invalid credentials (keep generic for security)
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare the provided plain-text password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        // If passwords don't match
        if (!isMatch) {
            // 400 Bad Request: Invalid credentials (keep generic for security)
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                username: user.username
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '30m' }, // Token expires in 30 minutes
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err.message);
                    throw err;
                }
                // 200 OK: Login successful, send token
                res.json({
                    msg: 'Login successful!',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                });
            }
        );

        // Update last login time (optional, but good for tracking)
        user.lastLogin = Date.now();
        await user.save();

    } catch (err) {
        console.error('Error in login route:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/protected
// @desc    Access protected route (requires valid JWT token)
// @access  Private
router.get('/protected', auth, async (req, res) => {
    try {
        // req.user is populated by the 'auth' middleware with user ID and username from the token
        // Fetch user details from DB, excluding the password hash
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            // 404 Not Found: User corresponding to token ID not found (shouldn't happen often if DB is consistent)
            return res.status(404).json({ msg: 'User not found' });
        }
        // 200 OK: Send protected data
        res.json({
            msg: `Welcome, ${user.username}! You successfully accessed a protected route.`,
            user_data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role // Include role if you have it in your User model
            }
        });
    } catch (err) {
        console.error('Error in protected route:', err.message);
        res.status(500).send('Server error');
    }
});

// Export the router as the default export for this module
export default router;