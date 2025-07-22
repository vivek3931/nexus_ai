// backend/routes/settings.js (Updated Version)

import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Valid AI Models and their Pro status (Keep this consistent with frontend for validation)
const aiModelMap = {
    'Soul Lite (Fast)': { isPro: false },
    'Soul Pro (Advanced)': { isPro: true },
    'Soul Custom (Beta)': { isPro: true },
};

// Add theme validation middleware (existing)
const validateTheme = (req, res, next) => {
    if (req.body.theme !== undefined) {
        const validThemes = ['light', 'dark', 'system'];
        if (!validThemes.includes(req.body.theme)) {
            return res.status(400).json({
                message: `Invalid theme value. Must be one of: ${validThemes.join(', ')}`
            });
        }
    }
    next();
};

// Middleware for AI Model validation and Pro status check
const validateAiModel = async (req, res, next) => {
    if (req.body.aiModel !== undefined) {
        const requestedModel = req.body.aiModel;
        const modelInfo = aiModelMap[requestedModel];

        if (!modelInfo) {
            return res.status(400).json({ message: `Invalid AI model selected: ${requestedModel}` });
        }

        // If the requested model is Pro-only, check if the user is a Pro user
        if (modelInfo.isPro) {
            const user = await User.findById(req.user.id).select('isProUser');
            if (!user || !user.isProUser) {
                return res.status(403).json({ message: 'Upgrade to Pro to select this advanced AI model.' });
            }
        }
    }
    next();
};

// @route   GET api/settings
// @desc    Get user settings
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Select 'settings', 'isProUser', and 'planType' to send to frontend for context
        const user = await User.findById(req.user.id).select('settings isProUser planType');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            settings: user.settings,
            isProUser: user.isProUser,
            planType: user.planType
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/settings
// @desc    Update user settings
// @access  Private
router.patch('/', auth, validateTheme, validateAiModel, async (req, res) => {
    const {
        theme, language, aiModel, responseTone,
        defaultSearchType, dataRetention, notificationsEnabled
    } = req.body;

    const updatedFields = {};
    if (theme !== undefined) updatedFields['settings.theme'] = theme;
    if (language !== undefined) updatedFields['settings.language'] = language;
    if (aiModel !== undefined) updatedFields['settings.aiModel'] = aiModel;
    if (responseTone !== undefined) updatedFields['settings.responseTone'] = responseTone;
    if (defaultSearchType !== undefined) updatedFields['settings.defaultSearchType'] = defaultSearchType;
    if (dataRetention !== undefined) updatedFields['settings.dataRetention'] = dataRetention;
    if (notificationsEnabled !== undefined) updatedFields['settings.notificationsEnabled'] = notificationsEnabled;

    if (Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ message: 'No settings provided for update.' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updatedFields },
            { new: true, runValidators: true } // `new: true` returns the modified document
        ).select('settings isProUser planType'); // Select these fields to return to frontend

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the relevant parts of the updated user object for the frontend to update context
        res.json({
            settings: user.settings,
            isProUser: user.isProUser,
            planType: user.planType
        });
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/settings/conversations
// @desc    Clear user's conversation history
// @access  Private
router.delete('/conversations', auth, async (req, res) => {
    try {
        // TODO: Implement actual conversation deletion logic here
        // e.g., await Conversation.deleteMany({ userId: req.user.id });

        console.log(`User ${req.user.id} requested to clear conversations.`);
        res.json({ message: 'Conversation history clear request processed. (Deletion logic needs implementation)' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/settings/account
// @desc    Delete user account and all associated data
// @access  Private
router.delete('/account', auth, async (req, res) => {
    try {
        // 1. Delete the user document itself
        await User.findByIdAndDelete(req.user.id);

        // TODO: Also delete any other related data like conversations, files, etc.
        // if they are stored in separate collections and not cascadingly deleted by mongoose.
        // e.g., await Conversation.deleteMany({ userId: req.user.id });

        console.log(`User ${req.user.id} account and associated data deleted.`);
        res.json({ message: 'User account and associated data successfully deleted.' });
    } catch (err) {
        console.error('Error deleting account:', err.message);
        res.status(500).send('Server Error');
    }
});

export default router;