    import React, { useState } from 'react';
    import { Eye, EyeOff } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import logo from '../../assets/soul_logo.svg';

    const RegisterForm = ({ onSwitchForm }) => {
        const [username, setUsername] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [message, setMessage] = useState('');
        const [messageType, setMessageType] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);

            const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000.api';


        const handleSubmit = async (e) => {
            e.preventDefault();
            setMessage('');
            setMessageType('');
            setIsLoading(true);

            if (password !== confirmPassword) {
                setMessage('Passwords do not match.');
                setMessageType('error');
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message || 'Registration successful!');
                    setMessageType('success');
                    setTimeout(() => {
                        onSwitchForm('/login');
                    }, 2000);
                } else {
                    setMessage(data.message || 'Registration failed. Please try again.');
                    setMessageType('error');
                }
            } catch (error) {
                setMessage('Network error. Could not connect to the server.');
                setMessageType('error');
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <div className="relative bg-[#121212] rounded-xl p-8 shadow-2xl w-full max-w-[400px]  border border-[rgba(138,43,226,0.3)] overflow-hidden animate-fadeInScale">
                <div className="absolute inset-0 rounded-xl -z-10 bg-gradient-radial from-[rgba(138,43,226,0.1)] to-transparent opacity-30 animate-rotateGradient"></div>

                <div className="flex flex-col items-center gap-3 mb-6 text-center">
                    {logo ? (
                        <img src={logo} alt="Nexus AI Logo" className="h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(138,43,226,0.4)]" />
                    ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-infinity text-white">
                            <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
                        </svg>
                    )}
                    <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-[#8a2be2] to-[#b886f8] bg-clip-text text-transparent tracking-tight">Join Nexus AI</h2>
                    <p className="text-sm text-white/70">Create your account in seconds</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="username" className="block text-xs font-medium text-white/70 uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] border border-white/10 text-white text-sm transition-all duration-200 placeholder:text-white/40 focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-xs font-medium text-white/70 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] border border-white/10 text-white text-sm transition-all duration-200 placeholder:text-white/40 focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-xs font-medium text-white/70 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] border border-white/10 text-white text-sm transition-all duration-200 placeholder:text-white/40 focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/50 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-[#b886f8] transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" className="block text-xs font-medium text-white/70 uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] border border-white/10 text-white text-sm transition-all duration-200 placeholder:text-white/40 focus:outline-none focus:border-[#8a2be2] focus:ring-2 focus:ring-[#8a2be2]/50 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-[#b886f8] transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#8a2be2] to-[#3f077b] text-white font-medium text-sm uppercase tracking-wider shadow-lg hover:shadow-[#8a2be2]/30 transition-all duration-200 mt-4 flex items-center justify-center ${
                            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-xs font-medium ${messageType === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                        {message}
                    </div>
                )}

                <div className="mt-6 text-center text-xs text-white/50">
                    <p>Already have an account?{' '}
                        <button 
                            onClick={() => onSwitchForm('/login')}
                            className="text-[#b886f8] font-medium hover:text-white transition-colors underline underline-offset-4 decoration-transparent hover:decoration-[#b886f8]"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        );
    };

    export default RegisterForm;