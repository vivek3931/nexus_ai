import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import 'dotenv/config'; // ES Module way to load dotenv, if not already loaded in server.js

const JWT_SECRET = process.env.JWT_SECRET;

// --- Middleware to verify JWT ---
function auth(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Common header for JWT

    // Check if no token
    if (!token) {
        // 401 Unauthorized: User needs to authenticate
        return res.status(401).json({ message: 'No token, authorization denied' }); // Changed msg to message
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        // If token is not valid (e.g., expired, tampered)
        res.status(401).json({ message: 'Token is not valid' }); // Changed msg to message
    }
}

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' }); // Changed msg to message
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' }); // Changed msg to message
    }

    try {
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User with that email or username already exists' }); // Changed msg to message
        }

        user = new User({
            username,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
                username: user.username
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '30m' },
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err.message);
                    throw err;
                }
                res.status(201).json({
                    message: 'User registered successfully!', // Changed msg to message
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                });
            }
        );

    } catch (err) {
        console.error('Error in register route:', err.message);
        res.status(500).send('Server error');
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    // --- CRITICAL FIX: Changed username_or_email to usernameOrEmail to match frontend ---
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Please enter all fields' }); // Changed msg to message
    }

    try {
        let user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Changed msg to message
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Changed msg to message
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '30m' },
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err.message);
                    throw err;
                }
                res.json({
                    message: 'Login successful!', // Changed msg to message
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                });
            }
        );

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
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Changed msg to message
        }
        res.json({
            message: `Welcome, ${user.username}! You successfully accessed a protected route.`, // Changed msg to message
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

export default router;