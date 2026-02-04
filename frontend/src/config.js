/**
 * Application Configuration
 * Handles environment-based settings for web and mobile platforms
 */

// Detect if we're running in Capacitor (mobile app)
// This check is SSR-safe and will only run in the browser
const getIsCapacitor = () => {
    if (typeof window === 'undefined') return false;
    if (!window.Capacitor) return false;
    return window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
};

const isCapacitor = getIsCapacitor();

// API Base URL Configuration
// For mobile: Use your local network IP (e.g., http://192.168.1.100:8000)
// For production: Use your deployed backend URL
const getApiBaseUrl = () => {
    // Check for environment variable first (set in .env.local)
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // For Capacitor mobile app, use local network IP
    // IMPORTANT: Update this IP to match your computer's local network IP
    if (isCapacitor) {
        // Use environment variable if available, otherwise fallback to localhost (which won't work on device but safe default)
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }

    // Default to localhost for web development
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const config = {
    apiBaseUrl: getApiBaseUrl(),
    isNative: isCapacitor,
    // Ollama URL - typically runs on localhost
    ollamaUrl: 'http://localhost:11434',
    // App metadata
    appName: 'Nokia NOC',
    appVersion: '1.0.0',
};

export default config;
