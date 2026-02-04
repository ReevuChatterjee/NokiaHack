'use client';

import { useEffect } from 'react';
import { initializeNativeFeatures } from '../utils/native-features';

/**
 * Component to initialize native features on app mount
 * This should be included in the root layout or main page
 */
export default function NativeInit() {
    useEffect(() => {
        // Initialize native features when app mounts
        initializeNativeFeatures();
    }, []);

    // This component doesn't render anything
    return null;
}
