// Updated SettingsPage Theme Toggle Section

import React, { useState, useContext, useEffect } from "react";
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
} from "lucide-react";
import { SettingsContext } from "../../SettingContext/SettingContext"; // Correct path as per your usage
import { AuthContext } from "../../AuthContext/AuthContext"; // Correct path as per your usage

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
    // Icons should generally adapt to the text color, not have a fixed style.
    // The color should be inherited from the parent or set by --text-primary.
    // If you want them to be accent colored, use --primary-accent.
    const iconStyle = { fontSize: "18px" }; // Removed fixed color here
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
        color: 'var(--text-muted)' // Muted text for the label
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
          color: 'var(--text-primary)' // Changed to --text-primary for button text
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
    systemTheme, // New: Get system theme
    getEffectiveTheme, // New: Get effective theme
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
  const { user } = useContext(AuthContext);

  const handleClearHistory = () => {
    clearAllConversations();
    setConfirmClearHistory(false);
  };

  const handleDeleteAccount = () => {
    deleteUserAccount();
    setConfirmDeleteAccount(false);
  };

  // IMPORTANT: Avoid window.confirm() in Canvas environment.
  // Use a custom modal component instead.
  const handleLogout = () => {
    // For demonstration, replacing window.confirm with a simple log
    // In a real app, you'd use a custom modal like ConfirmationPrompt
    console.log("Logout initiated. In a real app, a custom confirmation modal would appear here.");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-2 py-4 sm:p-6 lg:p-8"
      style={{
        backgroundColor: "var(--primary-background-color)", // Changed to primary-background-color
        color: "var(--text-primary)", // Changed to text-primary
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
          style={{ color: "var(--primary-accent)" }} // Titles often use accent color
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
                background: "var(--background-secondary)", // Changed to secondary
                color: "var(--text-muted)",
                border: "1px solid var(--border-primary)", // Changed to primary
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
                border: "1px solid var(--border-primary)", // Changed to primary
                color: "var(--text-primary)", // Changed to text-primary
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
                  borderColor: "var(--border-primary)", // Changed to primary
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
                border: "1px solid var(--border-primary)", // Changed to primary
                color: "var(--text-primary)", // Changed to text-primary
                "--tw-ring-color": "var(--primary-accent)",
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
              onChange={(e) => setResponseTone(e.target.value)}
              className="p-2 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base"
              style={{
                background: "var(--background-secondary)",
                border: "1px solid var(--border-primary)", // Changed to primary
                color: "var(--text-primary)", // Changed to text-primary
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
                border: "1px solid var(--border-primary)", // Changed to primary
                color: "var(--text-primary)", // Changed to text-primary
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
                  borderColor: "var(--border-primary)", // Changed to primary
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

          {/* Change Password Button */}
          <SettingItem label="Change Password">
            <button
              onClick={() => console.log("Navigate to Change Password")}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200"
              style={{
                background: "var(--background-secondary)",
                color: "var(--primary-accent)",
                border: "1px solid var(--primary-accent)", // Changed to primary-accent
                boxShadow: "0 2px 10px rgba(108, 92, 231, 0.2)",
                "--tw-ring-color": "var(--primary-accent)",
              }}
            >
              Update Password
            </button>
          </SettingItem>

          {/* Membership Status/Management */}
          <SettingItem label="Membership">
            <button
              onClick={() => console.log("Navigate to Membership Page")}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200"
              style={{
                background: "var(--background-secondary)",
                color: "var(--primary-accent)", // Changed to primary-accent
                border: "1px solid var(--primary-accent)", // Changed to primary-accent
                boxShadow: "0 2px 10px rgba(162, 155, 254, 0.2)",
                "--tw-ring-color": "var(--primary-accent)",
              }}
            >
              Manage Subscription
            </button>
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
    style={{ borderBottom: "1px solid var(--border-primary)" }} // Changed to primary
  >
    <span
      className="text-sm sm:text-base"
      style={{ color: "var(--text-primary)" }} // Changed to text-primary
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
      background: "var(--secondary-background-color)", // Changed to secondary
      border: "1px solid var(--border-primary)", // Changed to primary
    }}
  >
    <h2
      className="text-lg sm:text-xl font-semibold flex items-center space-x-2"
      style={{ color: "var(--text-primary)" }} // Changed to text-primary
    >
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </h2>
    <div className="space-y-2 sm:space-y-3">{children}</div>
  </div>
);

// Placeholder for ConfirmationPrompt if it's not provided
// In a real app, this would be a separate, properly styled modal component
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