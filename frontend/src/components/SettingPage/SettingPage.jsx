import React, { useState, useContext, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Sun,
    Moon,
    Monitor,
    Sparkles,
    User,
    Lock,
    Trash2,
    Globe,
    WifiOff,
    Info,
    Crown, // Import Crown icon for Pro status
} from "lucide-react";
import { SettingsContext } from "../../SettingContext/SettingContext"; // Correct path as per your usage
import { AuthContext } from "../../AuthContext/AuthContext"; // Correct path as per your usage

// Define AI Model properties (should be consistent with App.jsx and backend)
// In a larger application, consider moving this to a shared constants file.
const aiModelProperties = [
    { name: 'Soul Lite (Fast)', value: 'Soul Lite (Fast)', isPro: false },
    { name: 'Soul Pro (Advanced)', value: 'Soul Pro (Advanced)', isPro: true },
    { name: 'Soul Custom (Beta)', value: 'Soul Custom (Beta)', isPro: true },
];

// Enhanced Theme Toggle Component
const ThemeToggle = ({ theme, setTheme, systemTheme }) => {
    const getNextTheme = (currentTheme) => {
        switch (currentTheme) {
            case "light": return "system";
            case "system": return "dark";
            case "dark": return "light";
            default: return "system"; // Fallback
        }
    };

    const getThemeIcon = () => {
        const iconStyle = { fontSize: "18px" };
        switch (theme) {
            case "light": return <Sun style={{ ...iconStyle, color: "var(--primary-accent)" }} />;
            case "system": return <Monitor style={{ ...iconStyle, color: "var(--primary-accent)" }} />;
            case "dark": return <Moon style={{ ...iconStyle, color: "var(--primary-accent)" }} />;
            default: return <Monitor style={{ ...iconStyle, color: "var(--primary-accent)" }} />;
        }
    };

    const getThemeLabel = () => {
        switch (theme) {
            case "light": return "Light";
            case "system": return `System (${systemTheme})`;
            case "dark": return "Dark";
            default: return "System";
        }
    };

    const handleThemeChange = () => {
        const nextTheme = getNextTheme(theme);
        setTheme(nextTheme); // This calls the setTheme from SettingsContext
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        }}>
            <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                minWidth: '100px',
                color: 'var(--text-muted)'
            }}>
                {getThemeLabel()}
            </span>
            <button
                onClick={handleThemeChange}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    background: 'var(--background-secondary)',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 8px rgba(108, 92, 231, 0.15)',
                    color: 'var(--text-primary)'
                }}
            >
                {getThemeIcon()}
                <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '500'
                }}>
                    Switch
                </span>
            </button>
        </div>
    );
};

// Your existing SettingsPage component with the theme section updated
const SettingsPage = () => {
    const {
        settings,
        setTheme,
        setLanguage,
        setAiModel,
        setResponseTone,
        setDefaultSearchType,
        setDataRetention,
        setNotificationsEnabled,
        clearAllConversations,
        deleteUserAccount,
        systemTheme,
        getEffectiveTheme,
    } = useContext(SettingsContext);

    const {
        theme,
        language,
        aiModel,
        responseTone,
        defaultSearchType,
        dataRetention,
        notificationsEnabled,
    } = settings;

    const [confirmClearHistory, setConfirmClearHistory] = useState(false);
    const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
    
    // Get user and loading from AuthContext
    const { user, loading: authLoading, logout } = useContext(AuthContext); // <--- MODIFIED: Added logout for consistency

    // Check if user is Pro
    const isProUser = user?.isProUser || false;

    const handleClearHistory = () => {
        // Assume clearAllConversations handles the API call and context update
        clearAllConversations();
        setConfirmClearHistory(false);
    };

    const handleDeleteAccount = () => {
        // Assume deleteUserAccount handles the API call and context update
        deleteUserAccount(); // This function should internally call AuthContext's logout
        setConfirmDeleteAccount(false);
    };

    const handleLogout = () => {
        console.log("Logout initiated. In a real app, a custom confirmation modal would appear here.");
        // Call the logout function from AuthContext to clear token and user state
        logout(); // <--- MODIFIED: Use logout from AuthContext
        // window.location.href = "/login"; // This is handled by AuthContext's logout now
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--primary-background-color)', color: 'var(--text-primary)' }}>
                <p>Loading user data...</p>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-2 py-4 sm:p-6 lg:p-8"
            style={{
                backgroundColor: "var(--primary-background-color)",
                color: "var(--text-primary)",
            }}
        >
            <div
                className="w-full max-w-xl sm:max-w-3xl p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col space-y-6 sm:space-y-8 overflow-hidden"
                style={{
                    background: "var(--glass-background)",
                    border: "1px solid var(--glass-border)",
                    backdropFilter: "var(--glass-backdrop-filter)",
                    boxShadow: "0 10px 30px var(--glass-shadow)",
                }}
            >
                <h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-4"
                    style={{ color: "var(--primary-accent)" }}
                >
                    Settings
                </h1>

                {/* General Settings Section */}
                <Section
                    title="General"
                    icon={<Info size={20} style={{ color: "var(--primary-accent)" }} />}
                >
                    {/* Enhanced Theme Toggle */}
                    <SettingItem label="App Theme">
                        <ThemeToggle
                            theme={theme}
                            setTheme={setTheme}
                            systemTheme={systemTheme}
                        />
                    </SettingItem>

                    {/* Show effective theme for debugging/info */}
                    {theme === "system" && (
                        <div
                            className="text-xs px-3 py-2 rounded-lg"
                            style={{
                                background: "var(--background-secondary)",
                                color: "var(--text-muted)",
                                border: "1px solid var(--border-primary)",
                            }}
                        >
                            <Info size={14} className="inline mr-2" />
                            Currently using: {getEffectiveTheme()} theme (following system
                            preference)
                        </div>
                    )}

                    {/* Language Selection */}
                    <SettingItem label="Language">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="p-2 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base"
                            style={{
                                background: "var(--background-secondary)",
                                border: "1px solid var(--border-primary)",
                                color: "var(--text-primary)",
                                "--tw-ring-color": "var(--primary-accent)",
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
                                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                            />
                            <div
                                className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"
                                style={{
                                    backgroundColor: notificationsEnabled
                                        ? "var(--primary-accent)"
                                        : "var(--background-secondary)",
                                    borderColor: "var(--border-primary)",
                                }}
                            ></div>
                        </label>
                    </SettingItem>
                </Section>

                {/* AI Preferences Section */}
                <Section
                    title="AI Preferences"
                    icon={
                        <Sparkles size={20} style={{ color: "var(--primary-accent)" }} />
                    }
                >
                    {/* AI Model Selection */}
                    <SettingItem label="AI Model">
                        <select
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            className="p-2 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base"
                            style={{
                                background: "var(--background-secondary)",
                                border: "1px solid var(--border-primary)",
                                color: "var(--text-primary)",
                                "--tw-ring-color": "var(--primary-accent)",
                            }}
                        >
                            {/* Dynamically render options with Pro status and disable if not Pro user */}
                            {aiModelProperties.map((model) => (
                                <option
                                    key={model.value}
                                    value={model.value}
                                    disabled={model.isPro && !isProUser} // Correctly disables Pro models for free users
                                >
                                    {model.name}
                                    {model.isPro && !isProUser && " (Pro-only)"}
                                </option>
                            ))}
                        </select>
                    </SettingItem>

                    {/* Response Tone/Style */}
                    <SettingItem label="Response Tone">
                        <select
                            value={responseTone}
                            onChange={(e) => setResponseTone(e.target.value)}
                            className="p-2 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base"
                            style={{
                                background: "var(--background-secondary)",
                                border: "1px solid var(--border-primary)",
                                color: "var(--text-primary)",
                                "--tw-ring-color": "var(--primary-accent)",
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
                            onChange={(e) => setDefaultSearchType(e.target.value)}
                            className="p-2 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base"
                            style={{
                                background: "var(--background-secondary)",
                                border: "1px solid var(--border-primary)",
                                color: "var(--text-primary)",
                                "--tw-ring-color": "var(--primary-accent)",
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
                                onChange={() => setDataRetention(!dataRetention)}
                            />
                            <div
                                className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"
                                style={{
                                    backgroundColor: dataRetention
                                        ? "var(--primary-accent)"
                                        : "var(--background-secondary)",
                                    borderColor: "var(--border-primary)",
                                }}
                            ></div>
                        </label>
                    </SettingItem>

                    <p
                        className="text-xs sm:text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Disabling this may limit certain personalized features but enhances
                        privacy.
                    </p>

                    {/* Clear Conversation History Button */}
                    <SettingItem label="Clear All Conversations">
                        <button
                            onClick={() => setConfirmClearHistory(true)}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200"
                            style={{
                                background: "var(--background-secondary)",
                                color: "var(--error-color)",
                                border: "1px solid var(--error-color)",
                                boxShadow: "0 2px 10px rgba(220, 53, 69, 0.2)",
                                "--tw-ring-color": "var(--error-color)",
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
                <Section
                    title="Account"
                    icon={<User size={20} style={{ color: "var(--primary-accent)" }} />}
                >
                    {/* User Email (read-only) */}
                    <SettingItem label="Your Email">
                        <span
                            className="text-sm sm:text-base"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {user ? user.email : "Not logged in"}
                        </span>
                    </SettingItem>

                    {/* Membership Status */}
                    <SettingItem label="Membership Status">
                        <span
                            className="text-sm sm:text-base flex items-center"
                            style={{ color: isProUser ? "var(--success-color)" : "var(--text-muted)" }}
                        >
                            {isProUser ? (
                                <>
                                    <Crown size={16} className="mr-1 text-gold-500" /> {/* Using text-gold-500 for a gold-like color */}
                                    <span className="font-semibold capitalize">{user?.planType || 'Pro'}</span>
                                </>
                            ) : (
                                <span className="capitalize">{user?.planType || 'Free'}</span>
                            )}
                        </span>
                    </SettingItem>

                    {/* Change Password Button */}
                    <SettingItem label="Change Password">
                        <button
                            onClick={() => console.log("Navigate to Change Password")} // You'll likely want to replace this with `navigate('/change-password')`
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200"
                            style={{
                                background: "var(--background-secondary)",
                                color: "var(--primary-accent)",
                                border: "1px solid var(--primary-accent)",
                                boxShadow: "0 2px 10px rgba(108, 92, 231, 0.2)",
                                "--tw-ring-color": "var(--primary-accent)",
                            }}
                        >
                            Update Password
                        </button>
                    </SettingItem>

                    {/* Membership Management */}
                    <SettingItem label="Manage Subscription">
                        <Link to={'/membership'}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200"
                            style={{
                                background: "var(--background-secondary)",
                                color: "var(--primary-accent)",
                                border: "1px solid var(--primary-accent)",
                                boxShadow: "0 2px 10px rgba(162, 155, 254, 0.2)",
                                "--tw-ring-color": "var(--primary-accent)",
                            }}
                        >
                            {isProUser ? 'View Plan' : 'Upgrade Now'}
                        </Link>
                    </SettingItem>

                    {/* Logout Button */}
                    <SettingItem label="Log Out">
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200"
                            style={{
                                background: "var(--background-secondary)",
                                color: "var(--primary-accent)",
                                border: "1px solid var(--primary-accent)",
                                boxShadow: "0 2px 10px rgba(108, 92, 231, 0.2)",
                                "--tw-ring-color": "var(--primary-accent)",
                            }}
                        >
                            Log Out
                        </button>
                    </SettingItem>

                    {/* Delete Account Button */}
                    <SettingItem label="Delete Account">
                        <button
                            onClick={() => setConfirmDeleteAccount(true)}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200"
                            style={{
                                background: "var(--background-secondary)",
                                color: "var(--error-color)",
                                border: "1px solid var(--error-color)",
                                boxShadow: "0 2px 10px rgba(220, 53, 69, 0.2)",
                                "--tw-ring-color": "var(--error-color)",
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

// Your existing helper components remain the same
const SettingItem = ({ label, children }) => (
    <div
        className="flex justify-between items-center p-2 sm:p-3 rounded-lg transition-colors duration-200 hover:bg-white/[0.03]"
        style={{ borderBottom: "1px solid var(--border-primary)" }}
    >
        <span
            className="text-sm sm:text-base"
            style={{ color: "var(--text-primary)" }}
        >
            {label}
        </span>
        <div className="flex items-center space-x-2">{children}</div>
    </div>
);

const Section = ({ title, icon, children }) => (
    <div
        className="space-y-3 p-3 rounded-xl sm:space-y-4 sm:p-4"
        style={{
            background: "var(--secondary-background-color)",
            border: "1px solid var(--border-primary)",
        }}
    >
        <h2
            className="text-lg sm:text-xl font-semibold flex items-center space-x-2"
            style={{ color: "var(--text-primary)" }}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {title}
        </h2>
        <div className="space-y-2 sm:space-y-3">{children}</div>
    </div>
);

// Placeholder for ConfirmationPrompt if it's not provided
const ConfirmationPrompt = ({ message, onConfirm, onCancel, confirmText = "Confirm" }) => {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--primary-background-color)', padding: '20px',
                borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                color: 'var(--text-primary)', maxWidth: '400px', textAlign: 'center'
            }}>
                <p style={{ marginBottom: '20px' }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '8px 15px', borderRadius: '5px', border: '1px solid var(--border-primary)',
                            backgroundColor: 'var(--secondary-background-color)', color: 'var(--text-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '8px 15px', borderRadius: '5px', border: 'none',
                            backgroundColor: 'var(--error-color)', color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default SettingsPage;
