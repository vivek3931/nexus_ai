import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from '../../assets/soul_logo.svg';
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onSwitchForm, onLoginSuccess }) => {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setMessageType("");
        setIsLoading(true);

        try {
            const response = await fetch(`${BASE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usernameOrEmail,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                setMessage("Login successful!");
                setMessageType("success");

                setTimeout(() => {
                    if (onLoginSuccess) onLoginSuccess();
                    navigate("/dashboard");
                }, 1000);
            } else {
                setMessage(data.message || "Login failed. Please check your credentials.");
                setMessageType("error");
            }
        } catch (error) {
            setMessage("Network error. Could not connect to the server.");
            setMessageType("error");
        } finally {
            setIsLoading(false);
        }
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
                    className="font-medium text-[#8a2be2] hover:text-[#9d4dff] transition-colors"
                >
                    Sign up
                </button>
            </div>
        </div>
    );
};

export default LoginForm;