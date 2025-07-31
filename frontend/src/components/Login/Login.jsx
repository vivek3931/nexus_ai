import React, { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff } from "lucide-react";
import logo from '../../assets/soul_logo.svg';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext/AuthContext.jsx";

const LoginForm = ({ onSwitchForm }) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state

    const navigate = useNavigate();
    
    // Fixed: Remove non-existent 'error' property
    const { login, user, loading: authLoading } = useContext(AuthContext);

    // Effect to redirect if already authenticated (only on initial load)
    useEffect(() => {
        // Only redirect if user was already logged in when component mounts
        // and we're not in the middle of a login process
        if (user && !authLoading && !isSubmitting) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate, isSubmitting]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");
        setIsSubmitting(true); // Set local loading state

        try {
            const success = await login(usernameOrEmail, password);

            if (success) {
                setMessage("Login successful!");
                setMessageType("success");
                
                // Small delay to show success message, then navigate
                setTimeout(() => {
                    navigate("/dashboard", { replace: true });
                }, 500);
            }
        } catch (error) {
            console.error('Login submission error:', error);
            setMessage(error || "Login failed due to an unexpected error.");
            setMessageType("error");
        } finally {
            setIsSubmitting(false); // Reset local loading state
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSubmit(e);
    };

    // Determine if we should show loading state
    const isLoading = authLoading || isSubmitting;

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
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] border border-[#333] text-white text-sm transition-all duration-200 focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/30 disabled:opacity-50"
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                            className="w-full px-4 py-3 pr-10 rounded-lg bg-[#1e1e1e] border border-[#333] text-white text-sm transition-all duration-200 focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/30 disabled:opacity-50"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#a0a0a0] hover:text-[#8a2be2] transition-colors disabled:opacity-50"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            disabled={isLoading}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg font-medium text-white bg-gradient-to-r from-[#8a2be2] to-[#5a1c9e] transition-all duration-300 ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 hover:shadow-[0_0_15px_rgba(138,43,226,0.4)]'
                    }`}
                >
                    {isLoading ? (
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
            {message && (
                <div className={`mt-5 p-3 rounded-lg text-sm text-center ${
                    messageType === "success"
                        ? 'bg-green-900/20 text-green-400 border border-green-800/30'
                        : 'bg-red-900/20 text-red-400 border border-red-800/30'
                }`}>
                    {message}
                </div>
            )}

            {/* Register Link */}
            <div className="text-center mt-6 text-sm text-[#a0a0a0]">
                Don't have an account?{' '}
                <button
                    onClick={() => onSwitchForm("/register")}
                    className="font-medium text-[#8a2be2] hover:text-[#9d4dff] transition-colors disabled:opacity-50"
                    disabled={isLoading}
                >
                    Sign up
                </button>
            </div>
        </div>
    );
};

export default LoginForm;