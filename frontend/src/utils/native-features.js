/**
 * Native Features Utility
 * Wrapper for Capacitor APIs with graceful fallbacks for web
 */

import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

// Check if we're running in native app (safe for SSR)
export const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
export const platform = typeof window !== 'undefined' ? Capacitor.getPlatform() : 'web'; // 'ios', 'android', or 'web'

/**
 * Network Status Management
 */
export const NetworkStatus = {
    // Get current network status
    async getStatus() {
        if (!isNative) return { connected: true, connectionType: 'wifi' };
        try {
            const status = await Network.getStatus();
            return status;
        } catch (error) {
            console.error('Error getting network status:', error);
            return { connected: true, connectionType: 'unknown' };
        }
    },

    // Add listener for network changes
    addListener(callback) {
        if (!isNative) return () => { };

        const handler = Network.addListener('networkStatusChange', callback);
        return () => handler.remove();
    }
};

/**
 * Status Bar Management
 */
export const StatusBarManager = {
    // Set status bar to dark mode with accent color
    async setDark() {
        if (!isNative) return;
        try {
            await StatusBar.setStyle({ style: Style.Dark });
            if (platform === 'android') {
                await StatusBar.setBackgroundColor({ color: '#0a0e1a' }); // Match app background
            }
        } catch (error) {
            console.error('Error setting status bar:', error);
        }
    },

    // Hide status bar
    async hide() {
        if (!isNative) return;
        try {
            await StatusBar.hide();
        } catch (error) {
            console.error('Error hiding status bar:', error);
        }
    },

    // Show status bar
    async show() {
        if (!isNative) return;
        try {
            await StatusBar.show();
        } catch (error) {
            console.error('Error showing status bar:', error);
        }
    }
};

/**
 * Splash Screen Management
 */
export const SplashScreenManager = {
    // Hide splash screen
    async hide() {
        if (!isNative) return;
        try {
            await SplashScreen.hide();
        } catch (error) {
            console.error('Error hiding splash screen:', error);
        }
    },

    // Show splash screen
    async show() {
        if (!isNative) return;
        try {
            await SplashScreen.show();
        } catch (error) {
            console.error('Error showing splash screen:', error);
        }
    }
};

/**
 * App State Management
 */
export const AppStateManager = {
    // Add listener for app state changes (foreground/background)
    addListener(callback) {
        if (!isNative) return () => { };

        const handler = App.addListener('appStateChange', callback);
        return () => handler.remove();
    },

    // Get app info
    async getInfo() {
        if (!isNative) return { version: '1.0.0-web', build: '1' };
        try {
            return await App.getInfo();
        } catch (error) {
            console.error('Error getting app info:', error);
            return { version: 'unknown', build: 'unknown' };
        }
    }
};

/**
 * Initialize all native features on app start
 */
export const initializeNativeFeatures = async () => {
    if (!isNative) {
        console.log('Running in web mode, native features disabled');
        return;
    }

    console.log(`Initializing native features for platform: ${platform}`);

    // Set status bar style
    await StatusBarManager.setDark();

    // Hide splash screen after a delay (let content load first)
    setTimeout(async () => {
        await SplashScreenManager.hide();
    }, 1000);

    // Log app info
    const appInfo = await AppStateManager.getInfo();
    console.log('App Info:', appInfo);
};

export default {
    isNative,
    platform,
    NetworkStatus,
    StatusBarManager,
    SplashScreenManager,
    AppStateManager,
    initializeNativeFeatures
};
