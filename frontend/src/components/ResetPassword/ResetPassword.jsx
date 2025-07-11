// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false); // To prevent form display before token check

  // Replace with your actual backend URL
  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Get the token from the URL query parameters
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      // In a real application, you might make an API call here to verify the token
      // before showing the form. For this example, we'll assume it's valid
      // until a backend error during submission proves otherwise.
      setIsTokenValid(true);
    } else {
      setError('No reset token found in the URL. Please request a new one.');
      setIsTokenValid(false);
    }
    setInitialCheckDone(true);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Missing reset token. Please request a new one.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Your password has been reset successfully. Redirecting to login...');
        setError(''); // Clear any previous errors
        setTimeout(() => navigate('/login'), 3000); // Redirect to login after success
      } else {
        setError(data.message || 'Failed to reset password. The link might be invalid or expired. Please request a new one.');
        setMessage(''); // Clear any previous messages
      }
    } catch (err) {
      console.error('Network error during password reset request:', err);
      setError('Network error. Please try again later. You may need to request a new link.');
      setMessage(''); // Clear any previous messages
    } finally {
      setLoading(false);
    }
  };

  if (!initialCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-dark)] px-4 font-inter">
        <div className="w-full max-w-md bg-[var(--background-secondary)] rounded-lg shadow-xl p-8 text-center text-[var(--text-light)]">
          Checking token...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background-dark)] px-4 font-inter">
      <div className="w-full max-w-md bg-[var(--background-secondary)] rounded-lg shadow-xl p-8 space-y-6 text-[var(--text-light)]">
        <h2 className="text-3xl font-bold text-center text-[var(--text-accent)]">Reset Password</h2>
        <p className="text-center text-[var(--text-muted)]">
          {isTokenValid ? "Enter your new password below." : "The password reset link is invalid or has expired."}
        </p>

        {error && (
          <p className="text-[var(--error-color)] text-sm text-center">{error}</p>
        )}
        {message && (
          <p className="text-[var(--success-color)] text-sm text-center">{message}</p>
        )}

        {/* Show form if token is valid and no success message */}
        {isTokenValid && !message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--text-light)]">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="mt-1 block w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-color)] rounded-md text-[var(--text-light)] placeholder-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-light)]">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="mt-1 block w-full px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-color)] rounded-md text-[var(--text-light)] placeholder-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--primary-accent)] hover:bg-[var(--secondary-accent)] text-[var(--text-accent)] font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)] focus:ring-opacity-75 transition duration-200"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Option to request a new link if token is invalid or an error occurred */}
        {(error || !isTokenValid) && (
          <div className="text-center text-sm text-[var(--text-muted)] mt-4">
            If you need a new link, please{" "}
            <Link to="/forgot-password" className="text-[var(--primary-accent)] hover:underline">
              request a new one here
            </Link>
            .
          </div>
        )}

        <div className="text-center text-sm text-[var(--text-muted)]">
          Back to <Link to="/login" className="text-[var(--primary-accent)] hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
