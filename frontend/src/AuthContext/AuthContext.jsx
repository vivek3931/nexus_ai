// src/context/AuthContext.jsx (Updated Version)

import React, { createContext, useState, useEffect, useContext } from 'react';

// Initialize createContext with a default structure, including isAuthenticated
export const AuthContext = createContext({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    login: async () => {},
    logout: () => {},
    updatePassword: async () => {},
    deleteAccount: async () => {},
    updateUser: (newUserData) => {},
    loadUser: async () => {}, // <--- MODIFIED: Added loadUser to the default context structure
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Derive isAuthenticated directly from the user state
    const isAuthenticated = !!user;

    // Get the backend base URL from environment variables
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Function to load user from token (called on app load or after login/register)
    const loadUser = async () => {
        if (token) {
            try {
                // IMPORTANT: Ensure your backend /auth/protected endpoint returns the full user object
                // including isProUser, planType, and settings.
                const response = await fetch(`${BACKEND_URL}/auth/protected`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token,
                    },
                });

                if (response.ok) {
                    const resData = await response.json();
                    // Assuming resData.user_data contains the full user object from backend
                    // (e.g., { _id, email, username, isProUser, planType, settings: {...} })
                    setUser(resData.user_data);
                } else {
                    const errorData = await response.json();
                    console.error('Error loading user:', errorData.message || response.statusText);
                    logout(); // If token is invalid or user not found, log out
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
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
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
                // IMPORTANT: Ensure your backend /auth/login endpoint returns the full user object
                // in resData.user, including isProUser, planType, and settings.
                setUser(resData.user); // Set the full user data here
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
            const response = await fetch(`${BACKEND_URL}/auth/update-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
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
            const response = await fetch(`${BACKEND_URL}/settings/account`, { // Use your settings endpoint
                method: 'DELETE',
                headers: {
                    'x-auth-token': token,
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

    // Function to update user data in context (useful for partial updates)
    const updateUser = (newUserData) => {
        setUser(newUserData);
    };

    useEffect(() => {
        loadUser();
    }, [token]); // Reload user if token changes

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            loading,
            login,
            logout,
            updatePassword,
            deleteAccount,
            updateUser,
            loadUser // <--- CRITICAL FIX: Make loadUser available to consumers
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// You can still keep this for convenience if you want to use it
export const useAuth = () => useContext(AuthContext);
