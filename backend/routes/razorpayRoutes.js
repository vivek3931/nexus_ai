// backend/routes/razorpay.js

import express from 'express';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto'; // Node.js built-in crypto module
import auth from '../middleware/auth.js'
import User from '../models/User.js'; // Assuming you have a User model

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/razorpay/order
// @desc    Create a Razorpay order
// @access  Private (requires authentication if `protect` middleware is used)
router.post('/order', auth, async (req, res) => {
        console.log("Backend received /razorpay/order request body:", req.body);

    
    const { amount, currency = 'INR', receipt, plan, isYearly } = req.body;

    // Basic validation
    if (!amount || typeof amount !== 'number' || amount <= 0 || !receipt || !plan) {
        return res.status(400).json({ error: 'Invalid or missing amount, receipt, or plan in request.' });
    }

    try {
        const options = {
            amount: amount, // Amount in the smallest currency unit (e.g., paise for INR)
            currency: currency,
            receipt: receipt,
            payment_capture: 1, // Auto capture payment
            notes: {
                userId: req.user ? req.user.id : 'guest', // User ID from auth token, or 'guest'
                planType: plan,
                billingPeriod: isYearly ? 'yearly' : 'monthly'
            }
        };
        console.log("Attempting to create Razorpay order with options:", options); // NEW LOG

        const order = await razorpay.orders.create(options);
                console.log("Razorpay order created successfully:", order); // NEW LOG


        res.json({
            order_id: order.id,
            currency: order.currency,
            amount: order.amount, // Return amount in paisa as Razorpay expects it
            key_id: process.env.RAZORPAY_KEY_ID // Send your Razorpay Key ID to the frontend
        });
    } catch (err) {
 console.error('Error creating Razorpay order:', err.message); // MODIFIED LOG
        console.error('Full Razorpay API Error Object:', err);        res.status(500).json({ error: 'Internal server error during order creation.' });
    }
});

// @route   POST /api/razorpay/verify
// @desc    Verify Razorpay payment signature and update user subscription
// @access  Private (requires authentication if `protect` middleware is used)
router.post('/verify', auth, async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan,
        isYearly
    } = req.body;

    // Basic validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
        return res.status(400).json({ message: 'Missing Razorpay verification parameters.' });
    }

    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    try {
        if (expectedSignature === razorpay_signature) {
            // Payment is successful! Now update your user's subscription in the database
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // Update user's plan and subscription status
            user.isProUser = true; // Or set to true if `plan` is 'pro' or 'enterprise'
            user.planType = plan; // e.g., 'pro', 'enterprise'
            user.razorpayPaymentId = razorpay_payment_id;
            user.razorpayOrderId = razorpay_order_id;
            user.lastPaymentDate = new Date();

            // Calculate subscription end date (example: 1 month or 1 year from now)
            const today = new Date();
            if (isYearly) {
                user.subscriptionEndDate = new Date(today.setFullYear(today.getFullYear() + 1));
            } else {
                user.subscriptionEndDate = new Date(today.setMonth(today.getMonth() + 1));
            }

            await user.save();

            // Return success response to frontend
            res.json({ success: true, message: 'Payment successfully verified and plan updated!' });

        } else {
            // Signature mismatch, payment verification failed
            res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
        }
    } catch (err) {
        console.error('Error verifying Razorpay payment:', err);
        res.status(500).json({ success: false, message: 'Internal server error during payment verification.' });
    }
});

export default router;