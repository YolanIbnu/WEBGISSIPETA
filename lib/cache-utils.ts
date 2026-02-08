/**
 * Cache Management Utilities - OPTIMIZED VERSION
 * Simplified to prevent performance issues
 */

const APP_VERSION = '2.1.0';
const VERSION_KEY = 'sipeta_version';

/**
 * Check app version ONCE and clear cache if changed
 * This runs only once per session
 */
export function checkAppVersion(): void {
    if (typeof window === 'undefined') return;

    try {
        const storedVersion = sessionStorage.getItem(VERSION_KEY);

        // Only clear if version actually changed
        if (storedVersion && storedVersion !== APP_VERSION) {
            console.log(`🔄 Version update detected: ${storedVersion} → ${APP_VERSION}`);

            // Clear caches
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                });
            }

            // Update version
            sessionStorage.setItem(VERSION_KEY, APP_VERSION);
            localStorage.setItem(VERSION_KEY, APP_VERSION);

            console.log('✅ Cache cleared due to version change');
        } else if (!storedVersion) {
            // First time - just set version
            sessionStorage.setItem(VERSION_KEY, APP_VERSION);
            localStorage.setItem(VERSION_KEY, APP_VERSION);
            console.log('✅ App version initialized:', APP_VERSION);
        }
    } catch (error) {
        console.error('❌ Version check failed:', error);
    }
}

/**
 * Disable browser back/forward cache (bfcache)
 * Critical for mobile Safari and Chrome
 */
export function disableBFCache(): void {
    if (typeof window === 'undefined') return;

    // Disable bfcache by using pageshow event
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            console.log('🔄 Page restored from bfcache - reloading for fresh data');
            window.location.reload();
        }
    });
}

/**
 * Force hard reload (for manual use only)
 */
export function forceHardReload(): void {
    if (typeof window === 'undefined') return;
    console.log('🔄 Force hard reload...');
    window.location.reload();
}
