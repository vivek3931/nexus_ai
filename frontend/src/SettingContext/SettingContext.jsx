// src/context/SettingsContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Create the context
export const SettingsContext = createContext(null);

// Create the provider component
export const SettingsProvider = ({ children }) => {
    // Initial states for all settings
    // Try to load from localStorage, otherwise use defaults
    const [theme, setThemeState] = useState(() => localStorage.getItem('appTheme') || 'dark');
    const [language, setLanguageState] = useState(() => localStorage.getItem('appLanguage') || 'en');
    const [aiModel, setAiModelState] = useState(() => localStorage.getItem('aiModel') || 'soul-pro-v1');
    const [responseTone, setResponseToneState] = useState(() => localStorage.getItem('responseTone') || 'neutral');
    const [defaultSearchType, setDefaultSearchTypeState] = useState(() => localStorage.getItem('defaultSearchType') || 'text');
    const [dataRetention, setDataRetentionState] = useState(() => {
        const stored = localStorage.getItem('dataRetention');
        return stored === null ? true : JSON.parse(stored); // Default to true if not set
    });
    const [notificationsEnabled, setNotificationsEnabledState] = useState(() => {
        const stored = localStorage.getItem('notificationsEnabled');
        return stored === null ? true : JSON.parse(stored); // Default to true if not set
    });

    // --- Functions to update and persist settings ---

    const updateSetting = useCallback((key, value, setStateFn) => {
        setStateFn(value);
        localStorage.setItem(key, typeof value === 'boolean' ? JSON.stringify(value) : value);
        // --- Backend Integration (Conceptual) ---
        // If you need to save settings to a user's profile on your backend:
        // You would make an API call here.
        // For example:
        /*
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/user/settings', {
                method: 'PATCH', // Or PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ [key]: value })
            })
            .then(response => {
                if (!response.ok) {
                    console.error('Failed to save setting to backend:', response.statusText);
                }
            })
            .catch(error => console.error('Error saving setting:', error));
        }
        */
    }, []);

    // Create specific setters that use updateSetting
    const setTheme = (val) => updateSetting('appTheme', val, setThemeState);
    const setLanguage = (val) => updateSetting('appLanguage', val, setLanguageState);
    const setAiModel = (val) => updateSetting('aiModel', val, setAiModelState);
    const setResponseTone = (val) => updateSetting('responseTone', val, setResponseToneState);
    const setDefaultSearchType = (val) => updateSetting('defaultSearchType', val, setDefaultSearchTypeState);
    const setDataRetention = (val) => updateSetting('dataRetention', val, setDataRetentionState);
    const setNotificationsEnabled = (val) => updateSetting('notificationsEnabled', val, setNotificationsEnabledState);

    // --- Effect to apply theme class to body (example) ---
    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
        // You might also toggle specific CSS variables here if needed
    }, [theme]);

    // --- Clear Conversation History (Conceptual) ---
    const clearAllConversations = useCallback(async () => {
        // Implement global clear logic here. This might involve:
        // 1. Clearing state in Root component (if conversations are there)
        // 2. Making an API call to clear history on the backend
        // 3. Clearing relevant localStorage items

        // Example: If conversations are managed in Root, you'd pass a prop to this provider
        // or have Root listen to a global event/state change.
        console.log("Clearing all conversations globally...");
        // You'll need to dispatch an event or call a prop function that triggers the clearing in main.jsx
        // For now, let's just clear a dummy local storage item
        localStorage.removeItem('conversations'); // Example: if main.jsx stores them
        alert("Conversation history cleared!"); // Or show a toast notification
    }, []);

    // --- Delete Account (Conceptual) ---
    const deleteUserAccount = useCallback(async () => {
        // Implement account deletion logic. This MUST involve:
        // 1. An API call to your backend to delete the user's data.
        // 2. Logging the user out (clearing token, setting isAuthenticated to false).
        // 3. Redirecting to the login/home page.
        console.log("Deleting user account globally...");
        // Example:
        /*
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/user/delete-account', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    localStorage.clear(); // Clear all user-related local storage
                    // You would then need to update `isAuthenticated` in your Root component
                    // For example, by calling a logout function passed from Root
                    // window.location.href = '/login'; // Force redirect if no prop available
                    alert("Account successfully deleted!");
                } else {
                    const errorData = await response.json();
                    alert(`Failed to delete account: ${errorData.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error("Error deleting account:", error);
                alert("Error deleting account.");
            }
        }
        */
        alert("Account deletion initiated (check console for actual backend call).");
        // After successful backend deletion, force logout/redirect
        localStorage.clear(); // Clear all local storage
        window.location.href = '/login'; // Redirect to login page
    }, []);


    // Value provided by the context
    const contextValue = {
        theme, setTheme,
        language, setLanguage,
        aiModel, setAiModel,
        responseTone, setResponseTone,
        defaultSearchType, setDefaultSearchType,
        dataRetention, setDataRetention,
        notificationsEnabled, setNotificationsEnabled,
        clearAllConversations,
        deleteUserAccount,
    };

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};