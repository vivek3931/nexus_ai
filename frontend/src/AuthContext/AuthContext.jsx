// src/context/AuthContext.jsx (Debug Version)

import React, { createContext, useState, useEffect, useContext } from 'react';

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
    loadUser: async () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log('🔄 AuthProvider render - loading:', loading, 'user:', !!user, 'token:', !!token);

    // Derive isAuthenticated directly from the user state
    const isAuthenticated = !!user;

    // Get the backend base URL from environment variables
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Initialize token from localStorage
    useEffect(() => {
        console.log('🚀 Initial token check useEffect');
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        console.log('📱 Stored token found:', !!storedToken);
        
        if (storedToken) {
            setToken(storedToken);
        } else {
            console.log('❌ No token found, setting loading to false');
            setLoading(false);
        }
    }, []); // Empty dependency array - runs only once

    // Function to load user from token
    const loadUser = async () => {
        console.log('👤 loadUser called with token:', !!token);
        
        if (!token) {
            console.log('❌ No token in loadUser, setting loading to false');
            setLoading(false);
            return;
        }

        try {
            console.log('🌐 Making API call to load user');
            const response = await fetch(`${BACKEND_URL}/auth/protected`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
            });

            if (response.ok) {
                const resData = await response.json();
                console.log('✅ User loaded successfully');
                setUser(resData.user_data);
            } else {
                console.log('❌ Token validation failed');
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
                setToken(null);
                setUser(null);
            }
        } catch (err) {
            console.error('🚨 Network error loading user:', err.message);
        } finally {
            console.log('🏁 loadUser complete, setting loading to false');
            setLoading(false);
        }
    };

    // Load user when token changes
    useEffect(() => {
        console.log('🔄 Token change useEffect triggered, token:', !!token);
        if (token) {
            loadUser();
        } else {
            console.log('❌ No token, setting loading to false');
            setLoading(false);
        }
    }, [token]); // Only depend on token

    // Login function
    const login = async (usernameOrEmail, password) => {
        console.log('🔐 Login attempt started');
        setLoading(true);
        
        try {
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usernameOrEmail, password }),
            });

            const resData = await response.json();

            if (response.ok) {
                console.log('✅ Login successful');
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', resData.token);
                }
                setToken(resData.token);
                setUser(resData.user);
                return true;
            } else {
                console.log('❌ Login failed:', resData.message);
                throw new Error(resData.message || 'Login failed');
            }
        } catch (err) {
            console.error('🚨 Login error:', err.message);
            if (err instanceof Error) {
                throw err;
            }
            throw new Error('Network error during login');
        } finally {
            console.log('🏁 Login complete, setting loading to false');
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        console.log('🚪 Logout called');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        setToken(null);
        setUser(null);
        setLoading(false);
    };

    // Update Password function
    const updatePassword = async (currentPassword, newPassword) => {
        if (!token) throw new Error('Not authenticated.');
        
        try {
            const response = await fetch(`${BACKEND_URL}/auth/update-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const resData = await response.json();

            if (response.ok) {
                return resData.message;
            } else {
                throw new Error(resData.message || 'Failed to update password');
            }
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error('Network error during password update');
        }
    };

    // Delete Account function
    const deleteAccount = async () => {
        if (!token) throw new Error('Not authenticated.');
        
        try {
            const response = await fetch(`${BACKEND_URL}/settings/account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
            });

            const resData = await response.json();

            if (response.ok) {
                logout();
                return resData.message;
            } else {
                throw new Error(resData.message || 'Failed to delete account');
            }
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error('Network error during account deletion');
        }
    };

    // Function to update user data in context
    const updateUser = (newUserData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...newUserData
        }));
    };

    const contextValue = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updatePassword,
        deleteAccount,
        updateUser,
        loadUser,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};