import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // For the show/hide password icons
import '../../auth-form.css'
// Assuming your logo is accessible at this path. Adjust if needed.
import logo from '../../assets/soul_logo.svg';

const RegisterForm = ({ onSwitchForm }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        setMessageType('');
        setIsLoading(true); // Start loading

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setMessageType('error');
            setIsLoading(false); // Stop loading on error
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.msg);
                setMessageType('success');
                console.log('Registration successful! User:', data.user);
                // Optionally, automatically log in the user or redirect to login
                setTimeout(() => {
                    onSwitchForm('login'); // Switch back to login form
                }, 2000);
            } else {
                setMessage(data.msg || 'Registration failed. Please try again.');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setMessage('Network error. Could not connect to the server.');
            setMessageType('error');
        } finally {
            setIsLoading(false); // Ensure loading stops regardless of success/failure
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
                <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-[#8a2be2] to-[#b886f8] bg-clip-text text-transparent tracking-tight">Register for Nexus AI</h2>
                <p className="text-base text-white/70 -mt-2">Create your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6"> {/* Using space-y for form-group margin */}
                <div className="relative"> {/* form-group equivalent */}
                    <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-2 transition-colors duration-300 focus-within:text-[#b886f8]">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        required
                        className="w-full px-5 py-4 rounded-xl bg-[#1e1e1e] border border-white/10 text-white text-base transition-all duration-300 shadow-inner placeholder:text-white/50 focus:outline-none focus:border-[#8a2be2] focus:shadow-[0_0_0_3px_rgba(138,43,226,0.2),inset_0_1px_2px_rgba(0,0,0,0.2)] focus:bg-[#1e1e1e]"
                    />
                </div>

                <div className="relative"> {/* form-group equivalent */}
                    <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2 transition-colors duration-300 focus-within:text-[#b886f8]">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
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
                            placeholder="Create a password"
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
                </div>

                <div className="relative"> {/* form-group equivalent */}
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="relative flex items-center"> {/* password-input-wrapper equivalent */}
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                            className="w-full px-5 py-4 rounded-xl bg-[#1e1e1e] border border-white/10 text-white text-base transition-all duration-300 shadow-inner placeholder:text-white/50 focus:outline-none focus:border-[#8a2be2] focus:shadow-[0_0_0_3px_rgba(138,43,226,0.2),inset_0_1px_2px_rgba(0,0,0,0.2)] focus:bg-[#1e1e1e]"
                        />
                        <span
                            className="absolute right-4 cursor-pointer text-white/70 transition-colors duration-200 hover:text-[#b886f8] z-10" /* password-toggle-icon equivalent */
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    className={`w-full py-4 rounded-xl bg-gradient-to-r from-[#8a2be2] to-[#3f077b] text-white text-lg font-semibold border-none cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(138,43,226,0.4),0_0_0_1px_rgba(255,255,255,0.05)] relative overflow-hidden group mt-6 ${isLoading ? 'loading' : ''}`} /* auth-button equivalent */
                    disabled={isLoading}
                >
                    {isLoading ? '' : 'Register'}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                </button>
            </form>

            {message && (
                <div className={`text-center mt-6 p-3 rounded-lg text-sm font-medium animate-fadeIn ${messageType === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}> {/* message equivalent */}
                    {message}
                </div>
            )}

            <div className="text-center mt-8 text-sm text-white/50"> {/* auth-link-section equivalent */}
                <p>Already have an account? <a href="#" onClick={() => onSwitchForm('login')} className="text-[#b886f8] font-semibold transition-all duration-300 relative px-2 py-1 rounded hover:text-white hover:bg-[rgba(138,43,226,0.1)] group">
                    Login here
                    <span className="absolute bottom-0 left-2 w-[calc(100%-1rem)] h-px bg-current origin-right scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left"></span>
                </a></p>
            </div>
        </div>
    );
};

export default RegisterForm;
