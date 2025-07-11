// src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailOrUsername }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Password reset link sent to your email. Please check your inbox.');
                // Optionally redirect after a short delay
                setTimeout(() => navigate('/login'), 5000);
            } else {
                setError(data.message || 'Failed to send password reset link. Please try again.');
            }
        } catch (err) {
            console.error('Network error during forgot password request:', err);
            setError('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--background-dark)] px-4 font-inter">
            <div className="w-full max-w-md bg-[var(--background-secondary)] rounded-lg shadow-xl p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-[var(--text-accent)]">Forgot Password?</h2>
                <p className="text-center text-[var(--text-muted)]">
                    Enter your email or username below and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-[var(--text-light)]">
                            Email or Username
                        </label>
                        <input
                            type="text"
                            id="emailOrUsername"
                            className="mt-1 block w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-color)] rounded-md text-[var(--text-light)] placeholder-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]"
                            placeholder="your@example.com or username"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {message && (
                        <p className="text-[var(--success-color)] text-sm text-center">{message}</p>
                    )}
                    {error && (
                        <p className="text-[var(--error-color)] text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[var(--primary-accent)] hover:bg-[var(--secondary-accent)] text-[var(--text-accent)] font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)] focus:ring-opacity-75 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="text-center text-sm text-[var(--text-muted)]">
                    Remember your password? <Link to="/login" className="text-[var(--primary-accent)] hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
