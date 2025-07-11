// src/pages/SettingsPage.jsx (Modified)

import React, { useState, useContext } from 'react'; // <--- Import useContext
import { ChevronRight, Sun, Moon, Sparkles, User, Lock, Trash2, Globe, WifiOff, Info } from 'lucide-react';
import { SettingsContext } from '../../SettingContext/SettingContext';
import { AuthContext } from '../../AuthContext/AuthContext';
// import AlertDemo from '../Alert/Alert';
const SettingsPage = () => {
    // Use useContext to get the settings and their setters
    const {
        theme, setTheme,
        language, setLanguage,
        aiModel, setAiModel,
        responseTone, setResponseTone,
        defaultSearchType, setDefaultSearchType,
        dataRetention, setDataRetention,
        notificationsEnabled, setNotificationsEnabled,
        clearAllConversations, // Get the function from context
        deleteUserAccount,     // Get the function from context
    } = useContext(SettingsContext); // <--- Use the context

    const [confirmClearHistory, setConfirmClearHistory] = useState(false);
    const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
     const { user } = useContext(AuthContext);

    // --- Modify handlers to use context functions ---
    const handleClearHistory = () => {
        clearAllConversations(); // Call the function from context
        setConfirmClearHistory(false);
    };

    const handleDeleteAccount = () => {
        deleteUserAccount(); // Call the function from context
        setConfirmDeleteAccount(false);
    };

    // Placeholder for actual logout logic (can be part of deleteUserAccount or a separate handler)
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            console.log("Logging out (implement actual logout via context or prop from Root)...");
            // This would likely involve:
            // 1. Clearing authentication token from localStorage
            // 2. Setting isAuthenticated to false in Root
            // 3. Redirecting to /login
            // You'll need to pass a logout function from Root to SettingsProvider,
            // and then from SettingsProvider to the context, or directly pass it as a prop
            // to SettingsPage if only SettingsPage needs to trigger logout.
            localStorage.removeItem('token'); // Example token removal
            // Ideally, you'd navigate here, but for simplicity:
            window.location.href = '/login';
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8"
            style={{ backgroundColor: 'var(--background-dark)', color: 'var(--text-light)' }}
        >
            <div
                className="w-full max-w-3xl p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col space-y-8 overflow-hidden"
                style={{
                    background: 'var(--glass-background)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'var(--glass-backdrop-filter)',
                    boxShadow: '0 10px 30px var(--glass-shadow)',
                }}
            >
                <h1
                    className="text-3xl sm:text-4xl font-bold text-center mb-4"
                    style={{ color: 'var(--text-accent)' }}
                >
                    Settings
                </h1>

                {/* General Settings Section */}
                <Section title="General" icon={<Info size={20} style={{ color: 'var(--primary-accent)' }} />}>
                    {/* Theme Toggle */}
                    <SettingItem label="App Theme">
                        <div className="flex items-center space-x-2">
                            <Sun size={18} style={{ color: theme === 'light' ? 'var(--primary-accent)' : 'var(--text-muted)' }} />
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    value=""
                                    className="sr-only peer"
                                    checked={theme === 'dark'}
                                    onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} // <--- Use context setter
                                />
                                <div
                                    className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"
                                    style={{
                                        backgroundColor: theme === 'dark' ? 'var(--primary-accent)' : 'var(--background-secondary)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                ></div>
                            </label>
                            <Moon size={18} style={{ color: theme === 'dark' ? 'var(--primary-accent)' : 'var(--text-muted)' }} />
                        </div>
                    </SettingItem>

                    {/* Language Selection */}
                    <SettingItem label="Language">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)} // <--- Use context setter
                            className="p-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{
                                background: 'var(--background-secondary)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-light)',
                                fontSize: 'var(--font-size-sm)',
                                borderColor: 'var(--border-color)',
                                '--tw-ring-color': 'var(--primary-accent)'
                            }}
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="hi">हिन्दी</option>
                        </select>
                    </SettingItem>

                    {/* Notifications Toggle */}
                    <SettingItem label="Notifications">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={notificationsEnabled}
                                onChange={() => setNotificationsEnabled(!notificationsEnabled)} // <--- Use context setter
                            />
                            <div
                                className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"
                                style={{
                                    backgroundColor: notificationsEnabled ? 'var(--primary-accent)' : 'var(--background-secondary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            ></div>
                        </label>
                    </SettingItem>
                </Section>

                {/* AI Preferences Section */}
                <Section title="AI Preferences" icon={<Sparkles size={20} style={{ color: 'var(--primary-accent)' }} />}>
                    {/* AI Model Selection */}
                    <SettingItem label="AI Model">
                        <select
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)} // <--- Use context setter
                            className="p-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{
                                background: 'var(--background-secondary)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-light)',
                                fontSize: 'var(--font-size-sm)',
                                borderColor: 'var(--border-color)',
                                '--tw-ring-color': 'var(--primary-accent)'
                            }}
                        >
                            <option value="soul-pro-v1">Soul Pro (Advanced)</option>
                            <option value="soul-lite-v1">Soul Lite (Fast)</option>
                            <option value="soul-custom-v1">Soul Custom (Beta)</option>
                        </select>
                    </SettingItem>

                    {/* Response Tone/Style */}
                    <SettingItem label="Response Tone">
                        <select
                            value={responseTone}
                            onChange={(e) => setResponseTone(e.target.value)} // <--- Use context setter
                            className="p-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{
                                background: 'var(--background-secondary)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-light)',
                                fontSize: 'var(--font-size-sm)',
                                borderColor: 'var(--border-color)',
                                '--tw-ring-color': 'var(--primary-accent)'
                            }}
                        >
                            <option value="neutral">Neutral</option>
                            <option value="creative">Creative</option>
                            <option value="concise">Concise</option>
                            <option value="formal">Formal</option>
                            <option value="friendly">Friendly</option>
                        </select>
                    </SettingItem>

                    {/* Default Search Type */}
                    <SettingItem label="Default Search Type">
                        <select
                            value={defaultSearchType}
                            onChange={(e) => setDefaultSearchType(e.target.value)} // <--- Use context setter
                            className="p-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{
                                background: 'var(--background-secondary)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-light)',
                                fontSize: 'var(--font-size-sm)',
                                borderColor: 'var(--border-color)',
                                '--tw-ring-color': 'var(--primary-accent)'
                            }}
                        >
                            <option value="text">Text Search</option>
                            <option value="image">Image Search</option>
                            <option value="code">Code Search</option>
                        </select>
                    </SettingItem>

                    {/* Data Retention/Privacy */}
                    <SettingItem label="Allow Data Retention for Training">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={dataRetention}
                                onChange={() => setDataRetention(!dataRetention)} // <--- Use context setter
                            />
                            <div
                                className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"
                                style={{
                                    backgroundColor: dataRetention ? 'var(--primary-accent)' : 'var(--background-secondary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            ></div>
                        </label>
                    </SettingItem>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Disabling this may limit certain personalized features but enhances privacy.
                    </p>

                    {/* Clear Conversation History Button */}
                    <SettingItem label="Clear All Conversations">
                        <button
                            onClick={() => setConfirmClearHistory(true)}
                            className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            style={{
                                background: 'var(--background-secondary)',
                                color: 'var(--error-color)',
                                border: '1px solid var(--error-color)',
                                boxShadow: '0 2px 10px rgba(220, 53, 69, 0.2)',
                                '--tw-ring-color': 'var(--error-color)'
                            }}
                        >
                            Clear History
                        </button>
                    </SettingItem>
                    {confirmClearHistory && (
                        <ConfirmationPrompt
                            message="Are you sure you want to clear ALL your conversation history? This cannot be undone."
                            onConfirm={handleClearHistory}
                            onCancel={() => setConfirmClearHistory(false)}
                        />
                    )}
                </Section>

                {/* Account Settings Section */}
                <Section title="Account" icon={<User size={20} style={{ color: 'var(--primary-accent)' }} />}>
                    {/* User Email (read-only) */}
                    <SettingItem label="Your Email">
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-md)' }}>
                            {user ? user.email : 'Not logged in'} {/* <--- Display user.email here */}
                        </span>
                    </SettingItem>

                    {/* Change Password Button */}
                    <SettingItem label="Change Password">
                        <button
                            onClick={() => console.log("Navigate to Change Password")}
                            className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            style={{
                                background: 'var(--background-secondary)',
                                color: 'var(--primary-accent)',
                                border: '1px solid var(--border-accent)',
                                boxShadow: '0 2px 10px rgba(108, 92, 231, 0.2)',
                                '--tw-ring-color': 'var(--primary-accent)'
                            }}
                        >
                            Update Password
                        </button>
                    </SettingItem>

                    {/* Membership Status/Management */}
                    <SettingItem label="Membership">
                        <button
                            onClick={() => console.log("Navigate to Membership Page")}
                            className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            style={{
                                background: 'var(--background-secondary)',
                                color: 'var(--secondary-accent)',
                                border: '1px solid var(--secondary-accent)',
                                boxShadow: '0 2px 10px rgba(162, 155, 254, 0.2)',
                                '--tw-ring-color': 'var(--secondary-accent)'
                            }}
                        >
                            Manage Subscription
                        </button>
                    </SettingItem>

                    {/* Logout Button */}
                    <SettingItem label="Log Out">
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            style={{
                                background: 'var(--background-secondary)',
                                color: 'var(--primary-accent)',
                                border: '1px solid var(--primary-accent)',
                                boxShadow: '0 2px 10px rgba(108, 92, 231, 0.2)',
                                '--tw-ring-color': 'var(--primary-accent)'
                            }}
                        >
                            Log Out
                        </button>
                    </SettingItem>

                    {/* Delete Account Button */}
                    <SettingItem label="Delete Account">
                        <button
                            onClick={() => setConfirmDeleteAccount(true)}
                            className="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            style={{
                                background: 'var(--background-secondary)',
                                color: 'var(--error-color)',
                                border: '1px solid var(--error-color)',
                                boxShadow: '0 2px 10px rgba(220, 53, 69, 0.2)',
                                '--tw-ring-color': 'var(--error-color)'
                            }}
                        >
                            Delete Account
                        </button>
                    </SettingItem>
                    {confirmDeleteAccount && (
                        <ConfirmationPrompt
                            message="This action is irreversible. All your data will be permanently lost."
                            onConfirm={handleDeleteAccount}
                            onCancel={() => setConfirmDeleteAccount(false)}
                            confirmText="Delete Permanently"
                        />
                    )}
                </Section>
            </div>
        </div>
    );
};

// ... Section, SettingItem, ConfirmationPrompt helper components (unchanged) ...
// (Copy them directly from the previous response below the SettingsPage component)

// Helper component for individual setting items
const SettingItem = ({ label, children }) => (
    <div
        className="flex justify-between items-center p-3 rounded-lg transition-colors duration-200 hover:bg-white/[0.03]"
        style={{ borderBottom: '1px solid var(--border-dark)' }}
    >
        <span style={{ color: 'var(--text-light)', fontSize: 'var(--font-size-md)' }}>
            {label}
        </span>
        <div className="flex items-center space-x-2">
            {children}
        </div>
    </div>
);

// Helper component for confirmation prompts (can be a modal or inline)
const ConfirmationPrompt = ({ message, onConfirm, onCancel, confirmText = "Confirm" }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div
            className="p-6 rounded-lg shadow-lg text-center flex flex-col space-y-4"
            style={{
                background: 'var(--glass-background)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'var(--glass-backdrop-filter)',
                boxShadow: '0 10px 30px var(--glass-shadow)',
                color: 'var(--text-light)',
                maxWidth: '400px'
            }}
        >
            <p className="text-lg font-semibold">{message}</p>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onCancel}
                    className="px-5 py-2 rounded-lg font-medium transition-colors duration-200"
                    style={{
                        background: 'var(--background-secondary)',
                        color: 'var(--text-light)',
                        border: '1px solid var(--border-light)',
                        hover: { backgroundColor: 'var(--glass-hover-bg)' }
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-5 py-2 rounded-lg font-medium transition-colors duration-200"
                    style={{
                        background: 'var(--error-color)',
                        color: 'var(--text-accent)',
                        border: '1px solid var(--error-color)',
                        hover: { opacity: 0.9 }
                    }}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);


// Helper component for sections with titles and icons
const Section = ({ title, icon, children }) => (
    <div
        className="space-y-4 p-4 rounded-xl"
        style={{ background: 'var(--background-secondary)', border: '1px solid var(--border-dark)' }}
    >
        <h2 className="text-xl font-semibold flex items-center space-x-2" style={{ color: 'var(--text-accent)' }}>
            {icon && <span className="mr-2">{icon}</span>}
            {title}
        </h2>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);


export default SettingsPage;