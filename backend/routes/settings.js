import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Add theme validation middleware
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

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('settings');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add validateTheme middleware to PATCH route
router.patch('/', auth, validateTheme, async (req, res) => {
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
            { new: true, runValidators: true }
        ).select('settings');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.settings);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).send('Server Error');
    }
});


        router.delete('/conversations', auth, async (req, res) => {
            try {
                

                console.log(`User ${req.user.id} requested to clear conversations.`);
                res.json({ message: 'Conversation history clear request processed. (Deletion logic needs implementation)' });
            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
            }
        });

        // @route   DELETE api/settings/account
        // @desc    Delete user account and all associated data
        // @access  Private (requires authentication)
        router.delete('/account', auth, async (req, res) => {
            try {
                // Delete the user document
                await User.findByIdAndDelete(req.user.id);

            

                console.log(`User ${req.user.id} account deleted.`);
                res.json({ message: 'User account and associated data successfully deleted.' });
            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
            }
        });

        export default router;

        router.delete('/account', auth, async (req, res) => {
            try {
                // 1. Delete the user document itself
                await User.findByIdAndDelete(req.user.id);

            

                console.log(`User ${req.user.id} account and associated data deleted.`);
                res.json({ message: 'User account and associated data successfully deleted.' });
            } catch (err) {
                console.error('Error deleting account:', err.message);
                res.status(500).send('Server Error');
            }
        });