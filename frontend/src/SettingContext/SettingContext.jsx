// src/context/SettingsContext.jsx (Updated to use fetch)

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
// Create the context
export const SettingsContext = createContext(null);

// Create the provider component
export const SettingsProvider = ({ children }) => {
    // We'll manage all settings within a single state object
    // Initialize with defaults. These defaults should ideally match your User model defaults.
    const [settings, setSettings] = useState({
        theme: 'dark',
        language: 'en',
        aiModel: 'gemini-1.5-flash', // Make sure this matches your User model's default
        responseTone: 'neutral',
        defaultSearchType: 'text',
        dataRetention: true,
        notificationsEnabled: true,
    });
    const [loading, setLoading] = useState(true); // To indicate if settings are being loaded
    const [error, setError] = useState(null); // To handle potential errors

    const { user, loading: authLoading, token , logout} = useContext(AuthContext); // Get user, auth status, and token

    // Get the backend base URL from environment variables
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // --- Effect to fetch settings from backend on component mount or user change ---
    useEffect(() => {
        const fetchSettings = async () => {
            // Only fetch if a user is logged in and AuthContext has finished loading
            if (user && !authLoading && token) { // Ensure token is available
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(`${BACKEND_URL}/api/settings`, { // Your backend GET /api/settings endpoint
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token, // Manually attach the token
                        },
                    });

                    if (response.ok) {
                        const resData = await response.json();
                        setSettings(resData); // Update state with fetched settings
                    } else {
                        const errorData = await response.json();
                        console.error('Failed to fetch user settings from backend:', errorData.message || response.statusText);
                        setError(errorData.message || 'Failed to load settings.');
                    }
                } catch (err) {
                    console.error('Network error fetching settings:', err.message);
                    setError('Failed to load settings due to network error.');
                } finally {
                    setLoading(false);
                }
            } else if (!user && !authLoading) {
                // If no user is logged in, reset to default client-side settings
                setSettings({
                    theme: 'dark',
                    language: 'en',
                    aiModel: 'gemini-1.5-flash',
                    responseTone: 'neutral',
                    defaultSearchType: 'text',
                    dataRetention: true,
                    notificationsEnabled: true,
                });
                setLoading(false);
            }
        };

        fetchSettings();
    }, [user, authLoading, token]); // Re-run effect if user, authLoading, or token status changes

    // --- Effect to apply theme class to body ---
    useEffect(() => {
        document.body.className = settings.theme === 'dark' ? 'dark-theme' : 'light-theme';
    }, [settings.theme]);

    // --- Function to update and persist settings to backend ---
    const updateSetting = useCallback(async (key, value) => {
        if (!token) {
            console.error('Cannot update setting: User not authenticated.');
            setError('Not authenticated. Please log in.');
            return;
        }

        // Optimistic update: Update local state immediately
        const updatedSettings = { ...settings, [key]: value };
        setSettings(updatedSettings);

        try {
            const response = await fetch(`${BACKEND_URL}/api/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token, // Manually attach the token
                },
                body: JSON.stringify({ [key]: value }),
            });

            if (response.ok) {
                // Optional: If backend returns the updated settings, you could use:
                // const resData = await response.json();
                // setSettings(resData);
                return { success: true };
            } else {
                const errorData = await response.json();
                console.error(`Failed to save setting "${key}" to backend:`, errorData.message || response.statusText);
                setError(errorData.message || `Failed to update ${key}.`);
                setSettings(settings); // Revert local state on error
                throw errorData.message || `Failed to update ${key}`;
            }
        } catch (err) {
            console.error(`Network error saving setting "${key}":`, err.message);
            setError(`Failed to update ${key} due to network error.`);
            setSettings(settings); // Revert local state on network error
            throw err.message || `Failed to update ${key} due to network error`;
        }
    }, [settings, token]); // Depend on settings and token

    // --- Specific setters using the general updateSetting function ---
    const setTheme = (val) => updateSetting('theme', val);
    const setLanguage = (val) => updateSetting('language', val);
    const setAiModel = (val) => updateSetting('aiModel', val);
    const setResponseTone = (val) => updateSetting('responseTone', val);
    const setDefaultSearchType = (val) => updateSetting('defaultSearchType', val);
    const setDataRetention = (val) => updateSetting('dataRetention', val);
    const setNotificationsEnabled = (val) => updateSetting('notificationsEnabled', val);

    // --- Clear Conversation History (Integrate with backend) ---
    const clearAllConversations = useCallback(async () => {
        if (!token) {
            console.error('Cannot clear conversations: User not authenticated.');
            setError('Not authenticated. Please log in.');
            return;
        }
        try {
            const response = await fetch(`${BACKEND_URL}/api/settings/conversations`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token, // Manually attach the token
                },
            });

            if (response.ok) {
                const resData = await response.json();
                console.log(resData.message);
                return resData.message;
            } else {
                const errorData = await response.json();
                console.error("Error clearing conversations:", errorData.message || response.statusText);
                throw errorData.message || "Failed to clear conversations.";
            }
        } catch (err) {
            console.error("Network error clearing conversations:", err.message);
            throw err.message || "Failed to clear conversations due to network error.";
        }
    }, [token]);

    // --- Delete User Account (Integrate with backend) ---
    const deleteUserAccount = useCallback(async () => {
        if (!token) {
            console.error('Cannot delete account: User not authenticated.');
            setError('Not authenticated. Please log in.');
            return;
        }
        try {
            const response = await fetch(`${BACKEND_URL}/api/settings/account`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token, // Manually attach the token
                },
            });

            if (response.ok) {
                const resData = await response.json();
                console.log(resData.message);
                // Trigger logout from AuthContext after successful deletion
                // This will clear token, user state, and redirect.
                // It's important that AuthContext's logout also clears the token from localStorage.
                if (typeof logout === 'function') { // Ensure logout function is available
                    logout();
                } else {
                    // Fallback if AuthContext's logout isn't passed or implemented as expected
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return resData.message;
            } else {
                const errorData = await response.json();
                console.error("Error deleting account:", errorData.message || response.statusText);
                throw errorData.message || "Failed to delete account.";
            }
        } catch (err) {
            console.error("Network error deleting account:", err.message);
            throw err.message || "Failed to delete account due to network error.";
        }
    }, [token, logout]);


    // Value provided by the context
    const contextValue = {
        settings, // Provide the full settings object
        loading, // Provide loading state
        error, // Provide error state
        // Individual setters (these now call updateSetting internally)
        setTheme,
        setLanguage,
        setAiModel,
        setResponseTone,
        setDefaultSearchType,
        setDataRetention,
        setNotificationsEnabled,
        // Utility functions (for direct use in SettingsPage for actions)
        clearAllConversations,
        deleteUserAccount,
    };

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};