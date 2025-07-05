import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // For the show/hide password icons
import '../../auth-form.css'
// Assuming your logo is accessible at this path. Adjust if needed.
import logo from '../../assets/soul_logo.svg';

const LoginForm = ({ onSwitchForm, onLoginSuccess }) => { // Added onLoginSuccess prop
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setMessageType('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username_or_email: usernameOrEmail, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.msg);
                setMessageType('success');
                localStorage.setItem('token', data.token);
                console.log('Login successful! Token:', data.token);
                setTimeout(() => {
                    if (onLoginSuccess) {
                        onLoginSuccess(); // Call the success callback to switch to dashboard
                    } else {
                        window.location.href = '/'; // Fallback redirect
                    }
                }, 1500);
            } else {
                setMessage(data.msg || 'Login failed. Please try again.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setMessage('Network error. Could not connect to the server.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // auth-container styles converted to Tailwind classes
        <div className="relative bg-[#121212] rounded-xl p-10 shadow-2xl w-full max-w-md border border-[rgba(138,43,226,0.3)] overflow-hidden animate-fadeInScale md:p-8 sm:p-6">
            {/* Inner gradient pseudo-element wrapper */}
            {/* This div applies the rotating gradient background via CSS in auth-forms.css */}
            <div className="absolute inset-0 rounded-xl -z-10 bg-gradient-radial from-[rgba(138,43,226,0.1)] to-transparent opacity-30 animate-rotateGradient"></div>

            {/* auth-header styles converted to Tailwind classes */}
            <div className="flex flex-col items-center gap-5 mb-10 text-center">
                {/* Conditional rendering for logo in case it's not found */}
                {logo ? (
                    <img src={logo} alt="Nexus AI Logo" className="h-16 w-16 object-contain drop-shadow-[0_0_10px_rgba(138,43,226,0.4)]" />
                ) : (
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-infinity text-white">
                        <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
                    </svg>
                )}
                {/* h2 styles converted to Tailwind classes and inline gradient */}
                <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-[#8a2be2] to-[#b886f8] bg-clip-text text-transparent tracking-tight">Welcome to Nexus AI</h2>
                <p className="text-base text-white/70 -mt-2">Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6"> {/* Using space-y for form-group margin */}
                <div className="relative"> {/* form-group equivalent */}
                    <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-white/70 mb-2 transition-colors duration-300 focus-within:text-[#b886f8]">Email or Username</label>
                    <input
                        type="text"
                        id="usernameOrEmail"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="Enter your email or username"
                        required
                        className="w-full px-5 py-4 rounded-xl bg-[#1e1e1e] border border-white/10 text-white text-base transition-all duration-300 shadow-inner placeholder:text-white/50 focus:outline-none focus:border-[#8a2be2] focus:shadow-[0_0_0_3px_rgba(138,43,226,0.2),inset_0_1px_2px_rgba(0,0,0,0.2)] focus:bg-[#1e1e1e]"
                    />
                </div>

                <div className="relative"> {/* form-group equivalent */}
                    <label htmlFor="password">Password</label>
                    <div className="relative flex items-center"> {/* password-input-wrapper equivalent */}
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full px-5 py-4 rounded-xl bg-[#1e1e1e] border border-white/10 text-white text-base transition-all duration-300 shadow-inner placeholder:text-white/50 focus:outline-none focus:border-[#8a2be2] focus:shadow-[0_0_0_3px_rgba(138,43,226,0.2),inset_0_1px_2px_rgba(0,0,0,0.2)] focus:bg-[#1e1e1e]"
                        />
                        <span
                            className="absolute right-4 cursor-pointer text-white/70 transition-colors duration-200 hover:text-[#b886f8] z-10" /* password-toggle-icon equivalent */
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>
                    <div className="text-right mt-2 text-sm"> {/* forgot-password equivalent */}
                        <a href="/forgot-password" className="text-white/70 hover:text-[#b886f8] font-medium transition-colors duration-300">Forgot password?</a>
                    </div>
                </div>

                <button
                    type="submit"
                    className={`w-full py-4 rounded-xl bg-gradient-to-r from-[#8a2be2] to-[#3f077b] text-white text-lg font-semibold border-none cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(138,43,226,0.4),0_0_0_1px_rgba(255,255,255,0.05)] relative overflow-hidden group mt-6 ${isLoading ? 'loading' : ''}`} /* auth-button equivalent */
                    disabled={isLoading}
                >
                    {isLoading ? '' : 'Login'}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                </button>
            </form>

            {message && (
                <div className={`text-center mt-6 p-3 rounded-lg text-sm font-medium animate-fadeIn ${messageType === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}> {/* message equivalent */}
                    {message}
                </div>
            )}

            <div className="text-center mt-8 text-sm text-white/50"> {/* auth-link-section equivalent */}
                <p>Don't have an account? <a href="#" onClick={() => onSwitchForm('register')} className="text-[#b886f8] font-semibold transition-all duration-300 relative px-2 py-1 rounded hover:text-white hover:bg-[rgba(138,43,226,0.1)] group">
                    Register here
                    <span className="absolute bottom-0 left-2 w-[calc(100%-1rem)] h-px bg-current origin-right scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left"></span>
                </a></p>
            </div>
        </div>
    );
};

export default LoginForm;
