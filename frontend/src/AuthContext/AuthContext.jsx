// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

// Initialize createContext with a default structure, including isAuthenticated
export const AuthContext = createContext({
    user: null,
    token: null,
    isAuthenticated: false, // <-- Add this default
    loading: true,
    login: async () => {},
    logout: () => {},
    updatePassword: async () => {},
    deleteAccount: async () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Derive isAuthenticated directly from the user or token state
    // This will be true if user is not null, or if token exists.
    // It's more reliable to base it on 'user' once 'user' is successfully loaded.
    const isAuthenticated = !!user; // <-- Derive isAuthenticated here

    // Get the backend base URL from environment variables
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    // Function to load user from token (called on app load or after login/register)
    const loadUser = async () => {
        if (token) {
            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/protected`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token, // Manually attach the token
                    },
                });

                if (response.ok) {
                    const resData = await response.json();
                    setUser(resData.user_data);
                } else {
                    const errorData = await response.json();
                    console.error('Error loading user:', errorData.message || response.statusText);
                    logout(); // If token is invalid, log out
                }
            } catch (err) {
                console.error('Network error loading user:', err.message);
                logout(); // Log out on network errors too
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false); // No token, so loading is complete and user is not authenticated
        }
    };

    // Login function
    const login = async (usernameOrEmail, password) => {
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usernameOrEmail, password }),
            });

            if (response.ok) {
                const resData = await response.json();
                localStorage.setItem('token', resData.token);
                setToken(resData.token);
                setUser(resData.user); // Set the user data here
                return true; // Indicate success
            } else {
                const errorData = await response.json();
                console.error('Login error:', errorData.message || response.statusText);
                throw errorData.message || 'Login failed';
            }
        } catch (err) {
            console.error('Network error during login:', err.message);
            throw err.message || 'Login failed due to network error';
        }finally{
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null); // Clear user on logout
        // Redirect to login page - assuming you have a router setup
        window.location.href = '/login';
    };

    // Update Password function
    const updatePassword = async (currentPassword, newPassword) => {
        if (!token) throw new Error('Not authenticated.');
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/update-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token, // Manually attach the token
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (response.ok) {
                const resData = await response.json();
                return resData.message;
            } else {
                const errorData = await response.json();
                console.error('Password update error:', errorData.message || response.statusText);
                throw errorData.message || 'Failed to update password';
            }
        } catch (err) {
            console.error('Network error during password update:', err.message);
            throw err.message || 'Failed to update password due to network error';
        }
    };

    // Delete Account function (this will also log out the user)
    const deleteAccount = async () => {
        if (!token) throw new Error('Not authenticated.');
        try {
            const response = await fetch(`${BACKEND_URL}/api/settings/account`, { // Use your settings endpoint
                method: 'DELETE',
                headers: {
                    'x-auth-token': token, // Manually attach the token
                },
            });

            if (response.ok) {
                const resData = await response.json();
                logout(); // Log out after successful deletion
                return resData.message;
            } else {
                const errorData = await response.json();
                console.error('Delete account error:', errorData.message || response.statusText);
                throw errorData.message || 'Failed to delete account';
            }
        } catch (err) {
            console.error('Network error during account deletion:', err.message);
            throw err.message || 'Failed to delete account due to network error';
        }
    };

    useEffect(() => {
        loadUser();
    }, [token]); // Reload user if token changes

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, updatePassword, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};