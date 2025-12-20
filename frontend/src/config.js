
// Application Configuration & Assets
// Allows dynamic overrides via environment variables

export const CONFIG = {
    APP_NAME: 'Nexus AI',
    API_URL: `http://localhost:${import.meta.env.VITE_PORT || 5000}/api`,
}

export const ASSETS = {
    // Core Logic
    LOGO: import.meta.env.VITE_LOGO_URL || '/soul_logo.svg',

    // Fallbacks
    USER_AVATAR: '/soul_logo.svg', // Fallback if no user photo
    PLACEHOLDER: 'https://placehold.co/800x600/27272a/fbbf24?text=Image',
}

export const THEME = {
    ACCENT: 'var(--amber-400)'
}
