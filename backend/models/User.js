import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium'],
        default: 'user'
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    settings: {
        theme: {
            type: String,
            enum: ['dark', 'light'],
            default: 'dark',
        },
        language: {
            type: String,
            enum: ['en', 'es', 'fr', 'de'],
            default: 'en',
        },
        aiModel: {
            type: String,
            enum: ['gemini-1.5-flash', 'gemini-pro', 'gpt-3.5-turbo'],
            default: 'gemini-1.5-flash',
        },
        responseTone: {
            type: String,
            enum: ['neutral', 'friendly', 'professional', 'creative', 'sarcastic'],
            default: 'neutral',
        },
        defaultSearchType: {
            type: String,
            enum: ['text', 'image', 'web', 'code'],
            default: 'text',
        },
        dataRetention: {
            type: Boolean,
            default: true,
        },
        notificationsEnabled: {
            type: Boolean,
            default: true,
        },
    }
});

// Important: Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  

    // Only hash the password if it has been modified (or is new)
    // AND it doesn't already appear to be a bcrypt hash (starts with $2b$)
    if (this.isModified('password') && !this.password.startsWith('$2b$')) {
        console.log('Password modified AND not already hashed, proceeding with hashing in hook.');
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            console.log(`Password AFTER hashing in hook: ${this.password.substring(0, 20)}...`);
            console.log('--- End UserSchema pre-save hook ---');
            return next(); // Return next() after successful hashing
        } catch (err) {
            console.error('Error during password hashing in pre-save hook:', err.message);
            return next(err); // Pass the error to Mongoose
        }
    } else {
        console.log('Password not modified or already hashed, skipping hashing in hook.');
        console.log('--- End UserSchema pre-save hook ---');
        return next(); // Proceed without hashing
    }
});

export default mongoose.model('User', UserSchema);
