// routes/auth.js (Updated with deep debugging for reset-password save)
import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming your User model is here
import 'dotenv/config'; // Loads environment variables from .env file
import auth from '../middleware/auth.js'; // Your authentication middleware
import nodemailer from 'nodemailer'; // Import Nodemailer

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; // Your frontend URL
const EMAIL_USER = process.env.EMAIL_USER; // Your sending email address (e.g., from Gmail, SendGrid)
const EMAIL_PASS = process.env.EMAIL_PASS; // Your email password or app-specific password

// --- Nodemailer Transporter Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Example: 'gmail', or 'smtp.sendgrid.net' for SendGrid
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    // For self-signed certificates or development, you might need this:
    // tls: {
    //     rejectUnauthorized: false
    // }
});

// --- Existing Routes (No changes here from previous debug version) ---

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) { return res.status(400).json({ message: 'Please enter all fields' }); }
    if (password.length < 6) { return res.status(400).json({ message: 'Password must be at least 6 characters long' }); }
    try {
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) { return res.status(400).json({ message: 'User with that email or username already exists' }); }
        user = new User({ username, email, password });
        await user.save(); // Password hashed by pre-save hook
        const payload = { user: { id: user.id, username: user.username } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' }, (err, token) => {
            if (err) { console.error('Error signing JWT:', err.message); throw err; }
            res.status(201).json({ message: 'User registered successfully!', token, user: { id: user.id, username: user.username, email: user.email } });
        });
    } catch (err) { console.error('Error in register route:', err.message); res.status(500).send('Server error'); }
});

router.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) { return res.status(400).json({ message: 'Please enter all fields' }); }
    try {
        let user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
        if (!user) { console.log(`Login attempt for ${usernameOrEmail}: User not found.`); return res.status(400).json({ message: 'Invalid credentials' }); }
        console.log(`Login attempt for user: ${user.username}`);
        console.log(`Provided password (raw): ${password}`);
        console.log(`Stored hashed password: ${user.password}`);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`bcrypt.compare result: ${isMatch}`);
        if (!isMatch) { return res.status(400).json({ message: 'Invalid credentials' }); }
        const payload = { user: { id: user.id, username: user.username } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' }, (err, token) => {
            if (err) { console.error('Error signing JWT:', err.message); throw err; }
            res.json({ message: 'Login successful!', token, user: { id: user.id, username: user.username, email: user.email } });
        });
        user.lastLogin = Date.now();
        await user.save();
    } catch (err) { console.error('Error in login route:', err.message); res.status(500).send('Server error'); }
});

router.get('/protected', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) { return res.status(404).json({ message: 'User not found' }); }
        res.json({ message: `Welcome, ${user.username}! You successfully accessed a protected route.`, user_data: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (err) { console.error('Error in protected route:', err.message); res.status(500).send('Server error'); }
});

router.patch('/update-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) { return res.status(400).json({ message: 'Please provide both current and new passwords.' }); }
    if (newPassword.length < 6) { return res.status(400).json({ message: 'New password must be at least 6 characters long.' }); }
    try {
        const user = await User.findById(req.user.id);
        if (!user) { return res.status(404).json({ message: 'User not found.' }); }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) { return res.status(400).json({ message: 'Current password is incorrect.' }); }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        console.log(`Password update (authenticated): New hashed password for ${user.username}: ${user.password}`);
        await user.save();
        res.json({ message: 'Password updated successfully!' });
    } catch (err) { console.error('Error updating password:', err.message); res.status(500).send('Server error'); }
});


router.post('/forgot-password', async (req, res) => {
    const { emailOrUsername } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
        if (!user) { console.log(`Forgot password attempt for ${emailOrUsername}: User not found.`); return res.status(200).json({ message: 'If an account with that email or username exists, a password reset link has been sent.' }); }
        const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        console.log(`Forgot password: Token saved for ${user.username}. Token: ${resetToken}`);
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: EMAIL_USER, to: user.email, subject: 'Password Reset Request for Your News AI Account',
            html: `<p>Hello ${user.username || user.email},</p><p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the following link, or paste this into your browser to complete the process:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link will expire in <b>1 hour</b>.</p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p><p>Thank you,</p><p>The News AI Team</p>`,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Forgot password: Email sent to ${user.email}`);
        res.status(200).json({ message: 'If an account with that email or username exists, a password reset link has been sent. Please check your inbox (and spam folder).' });
    } catch (err) { console.error('Error in forgot-password route:', err.message); res.status(500).json({ message: 'Server error. Please try again later.' }); }
});


// --- New Reset Password Route (with additional debug logs) ---

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(`Reset password: Token decoded. User ID from token: ${decoded.id}`);

        let user = await User.findOne({
            _id: decoded.id,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Reset password: User not found or token invalid/expired in DB check.');
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }
        console.log(`Reset password: User found for token: ${user.username}`);
        console.log(`Reset password: New password (raw): ${newPassword}`);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        console.log(`Reset password: New hashed password (before save): ${user.password}`);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save(); // Attempt to save the user

        // --- DEEP DEBUGGING: Fetch user immediately after save to confirm persistence ---
        const savedUser = await User.findById(user._id);
        if (savedUser) {
            console.log(`Reset password: User fetched immediately after save.`);
            console.log(`Reset password: Saved user's password in DB: ${savedUser.password}`);
            console.log(`Reset password: Saved user's token in DB: ${savedUser.resetPasswordToken}`);
            console.log(`Reset password: Saved user's token expiry in DB: ${savedUser.resetPasswordExpires}`);

            // Perform a bcrypt.compare test right here to double-check
            const testMatch = await bcrypt.compare(newPassword, savedUser.password);
            console.log(`Reset password: bcrypt.compare test (raw newPassword vs saved hash): ${testMatch}`);
            if (!testMatch) {
                console.error("CRITICAL ERROR: New password hash mismatch immediately after save!");
            }
        } else {
            console.error("ERROR: User not found immediately after save operation in reset-password route.");
        }
        // --- END DEEP DEBUGGING ---

        res.status(200).json({ message: 'Your password has been reset successfully.' });

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('Reset password error: Token expired.');
            return res.status(400).json({ message: 'Password reset token has expired. Please request a new one.' });
        }
        if (err.name === 'JsonWebTokenError') {
            console.error('Reset password error: Invalid JWT token.');
            return res.status(400).json({ message: 'Invalid password reset token.' });
        }
        console.error('Error in reset-password route:', err.message);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});


export default router;
