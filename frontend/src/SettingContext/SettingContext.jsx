// src/context/SettingsContext.jsx (Consolidated Theme Management)

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../AuthContext/AuthContext'; // Assuming AuthContext is in a sibling directory

// Create the Settings Context
export const SettingsContext = createContext(null);

// Settings Provider Component
export const SettingsProvider = ({ children }) => {
    // State to hold all user settings
    const [settings, setSettings] = useState({
        theme: 'system', // 'light', 'dark', or 'system'
        language: 'en',
        aiModel: 'gemini-1.5-flash',
        responseTone: 'neutral',
        defaultSearchType: 'text',
        dataRetention: true,
        notificationsEnabled: true,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [systemTheme, setSystemTheme] = useState('dark'); 

    const { user, loading: authLoading, token, logout } = useContext(AuthContext);
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // --- Effect Hook for System Theme Detection ---
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
        
        const handleSystemThemeChange = (e) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };
        
        mediaQuery.addEventListener('change', handleSystemThemeChange);
        
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    // --- Utility function to determine the effective theme ---
    const getEffectiveTheme = useCallback(() => {
        return settings.theme === 'system' ? systemTheme : settings.theme;
    }, [settings.theme, systemTheme]);

    // --- Effect Hook to Apply Theme to Document Element (Consolidated) ---
    // This is the single source of truth for applying the theme to the DOM.
    useEffect(() => {
        const currentEffectiveTheme = getEffectiveTheme();
        const htmlElement = document.documentElement;

        // Only update the DOM if the 'data-theme' attribute is different from the effective theme.
        if (htmlElement.getAttribute('data-theme') !== currentEffectiveTheme) {
            // Remove any existing theme-related classes first (e.g., 'light-theme', 'dark-theme')
            // This ensures a clean state before applying the new theme.
            htmlElement.classList.remove('light-theme', 'dark-theme');
            
            // Set the 'data-theme' attribute. Your CSS uses this for variable switching.
            htmlElement.setAttribute('data-theme', currentEffectiveTheme);
            
            // Add the current theme class if you still need it for specific styling or legacy.
            if (currentEffectiveTheme !== 'system') {
                htmlElement.classList.add(`${currentEffectiveTheme}-theme`);
            }

            // IMPORTANT: Manage Tailwind's 'dark' class here
            // This ensures Tailwind's dark mode utilities work correctly.
            if (currentEffectiveTheme === 'dark') {
                htmlElement.classList.add('dark');
            } else {
                htmlElement.classList.remove('dark');
            }
            
            console.log(`Applied theme: ${currentEffectiveTheme}`);
        }
    }, [settings.theme, systemTheme, getEffectiveTheme]); 

    // --- Effect Hook to Fetch Settings from Backend ---
    useEffect(() => {
        const fetchSettings = async () => {
            if (user && !authLoading && token) {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(`${BACKEND_URL}/settings`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token,
                        },
                    });

                    if (response.ok) {
                        const resData = await response.json();
                        
                        const validThemes = ['light', 'dark', 'system'];
                        if (!validThemes.includes(resData.theme)) {
                            console.warn(`Invalid theme "${resData.theme}" received from backend. Falling back to 'system'.`);
                            resData.theme = 'system';
                        }
                        
                        setSettings(resData);
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
                setSettings({
                    theme: 'system', 
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
    }, [user, authLoading, token, BACKEND_URL]);

    // --- Function to Update and Persist Settings to Backend ---
    const updateSetting = useCallback(async (key, value) => {
        if (!token) {
            console.error('Cannot update setting: User not authenticated.');
            setError('Not authenticated. Please log in.');
            return;
        }

        if (key === 'theme') {
            const validThemes = ['light', 'dark', 'system'];
            if (!validThemes.includes(value)) {
                console.error(`Invalid theme value: ${value}`);
                setError('Invalid theme selection.');
                return;
            }
        }

        const updatedSettings = { ...settings, [key]: value };
        setSettings(updatedSettings);

        try {
            const response = await fetch(`${BACKEND_URL}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ [key]: value }),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json();
                console.error(`Failed to save setting "${key}" to backend:`, errorData.message || response.statusText);
                setError(errorData.message || `Failed to update ${key}.`);
                setSettings(settings); 
                throw errorData.message || `Failed to update ${key}`;
            }
        } catch (err) {
            console.error(`Network error saving setting "${key}":`, err.message);
            setError(`Failed to update ${key} due to network error.`);
            setSettings(settings); 
            throw err.message || `Failed to update ${key} due to network error`;
        }
    }, [settings, token, BACKEND_URL]);

    // --- Theme Setter Function ---
    const setTheme = useCallback((val) => {
        const validThemes = ['light', 'dark', 'system'];
        if (!validThemes.includes(val)) {
            console.error(`Invalid theme value: ${val}`);
            return Promise.reject(new Error('Invalid theme value')); 
        }
        return updateSetting('theme', val);
    }, [updateSetting]);

    // --- Other Setter Functions ---
    const setLanguage = useCallback((val) => updateSetting('language', val), [updateSetting]);
    const setAiModel = useCallback((val) => updateSetting('aiModel', val), [updateSetting]);
    const setResponseTone = useCallback((val) => updateSetting('responseTone', val), [updateSetting]);
    const setDefaultSearchType = useCallback((val) => updateSetting('defaultSearchType', val), [updateSetting]);
    const setDataRetention = useCallback((val) => updateSetting('dataRetention', val), [updateSetting]);
    const setNotificationsEnabled = useCallback((val) => updateSetting('notificationsEnabled', val), [updateSetting]);

    // --- Utility Function: Clear All Conversations ---
    const clearAllConversations = useCallback(async () => {
        // ... (your existing code)
    }, [token, BACKEND_URL]);

    // --- Utility Function: Delete User Account ---
    const deleteUserAccount = useCallback(async () => {
        // ... (your existing code)
    }, [token, logout, BACKEND_URL]);

    const contextValue = {
        settings,           
        loading,            
        error,              
        systemTheme,        
        getEffectiveTheme,  
        setTheme,
        setLanguage,
        setAiModel,
        setResponseTone,
        setDefaultSearchType,
        setDataRetention,
        setNotificationsEnabled,
        clearAllConversations,
        deleteUserAccount,
    };

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};