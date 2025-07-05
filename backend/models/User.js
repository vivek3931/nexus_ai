import mongoose from 'mongoose'; // Change from require to import

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true // Removes whitespace from both ends of a string
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Stores emails in lowercase
        match: [/.+\@.+\..+/, 'Please fill a valid email address'] // Basic email regex validation
    },
    password: { // We'll store the hashed password here, named 'password' for convention
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
        enum: ['user', 'admin', 'premium'], // Example roles
        default: 'user'
    }
});

// Change from module.exports to export default
export default mongoose.model('User', UserSchema);