import React, { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff } from "lucide-react";
import logo from '../../assets/soul_logo.svg';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext/AuthContext.jsx"; // Adjust path if necessary

const LoginForm = ({ onSwitchForm }) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    
    // Consume AuthContext to get the login function and loading/error states
    const { login, user, loading: authLoading, error: authError } = useContext(AuthContext);

    // Effect to redirect if already authenticated (e.g., user revisits /login while logged in)
    useEffect(() => {
        // If user object exists and authLoading is complete, redirect to dashboard
        if (user && !authLoading) {
            navigate('/dashboard', { replace: true }); // Use replace to prevent going back to login
        }
    }, [user, authLoading, navigate]); // Depend on user, authLoading, and navigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Clear previous messages
        setMessageType(""); // Clear previous message type

        try {
            // Call the login function from AuthContext
            const success = await login(usernameOrEmail, password);

            if (success) {
                setMessage("Login successful!");
                setMessageType("success");
                // --- CRUCIAL NAVIGATION CHANGE ---
                // Navigate immediately after successful login
                navigate("/dashboard", { replace: true }); // Use replace to prevent going back to login
                // ---------------------------------
            } else {
                // This 'else' block might not be reached if 'login' throws an error on failure
                // The error will be caught by the catch block below.
                setMessage("Login failed. Please check your credentials.");
                setMessageType("error");
            }
        } catch (error) {
            console.error('Login submission error:', error);
            // Display the error message from AuthContext (authError) or the thrown error
            setMessage(error.message || authError || "Login failed due to an unexpected error.");
            setMessageType("error");
        }
        // No finally block needed here for setLoading, as AuthContext manages its own loading state.
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSubmit(e);
    };

    return (
        <div className="relative w-full max-w-[400px] p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-[#121212] to-[#1a1a1a] border border-[rgba(138,43,226,0.2)]">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <img src={logo} alt="App Logo" className="h-14 w-14" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    Welcome Back
                </h1>
                <p className="text-sm text-[#a0a0a0]">
                    Sign in to your account
                </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email/Username Field */}
                <div className="space-y-2">
                    <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-[#a0a0a0]">
                        Email or Username
                    </label>
                    <input
                        type="text"
                        id="usernameOrEmail"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter your email or username"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] border border-[#333] text-white text-sm transition-all duration-200 focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/30"
                    />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="block text-sm font-medium text-[#a0a0a0]">
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={() => onSwitchForm("/forgot-password")}
                            className="text-xs text-[#8a2be2] hover:text-[#9d4dff] transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Enter your password"
                            required
                            className="w-full px-4 py-3 pr-10 rounded-lg bg-[#1e1e1e] border border-[#333] text-white text-sm transition-all duration-200 focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/30"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a0a0a0] hover:text-[#8a2be2] transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={authLoading} 
                    className={`w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-[#8a2be2] to-[#5a1c9e] transition-all duration-300 ${
                        authLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-[0_0_15px_rgba(138,43,226,0.4)]'
                    }`}
                >
                    {authLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Signing In...
                        </div>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            {/* Message */}
            {(message || authError) && ( // Display local message or AuthContext error
                <div className={`mt-5 p-3 rounded-lg text-sm text-center ${
                    messageType === "success"
                        ? 'bg-green-900/20 text-green-400 border border-green-800/30'
                        : 'bg-red-900/20 text-red-400 border border-red-800/30'
                }`}>
                    {message || authError}
                </div>
            )}

            {/* Register Link */}
            <div className="text-center mt-6 text-sm text-[#a0a0a0]">
                Don't have an account?{' '}
                <button
                    onClick={() => onSwitchForm("/register")}
                    className="font-medium text-[#8a2be2] hover:text-[#9d4dff] transition-colors"
                >
                    Sign up
                </button>
            </div>
        </div>
    );
};

export default LoginForm;
