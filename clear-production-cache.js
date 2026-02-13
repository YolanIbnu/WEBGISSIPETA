// ============================================
// PRODUCTION CACHE CLEAR & FORCE REFRESH
// ============================================
// Untuk di-run di Console (F12) production site
// URL: https://sipetatpk.netlify.app
// ============================================

console.log('🔧 Starting production cache clear...');

// Step 1: Clear localStorage
console.log('1/6 Clearing localStorage...');
localStorage.clear();

// Step 2: Clear sessionStorage
console.log('2/6 Clearing sessionStorage...');
sessionStorage.clear();

// Step 3: Clear IndexedDB
console.log('3/6 Clearing IndexedDB...');
indexedDB.databases().then(databases => {
    databases.forEach(db => {
        console.log(`  - Deleting database: ${db.name}`);
        indexedDB.deleteDatabase(db.name);
    });
});

// Step 4: Clear Cache Storage
console.log('4/6 Clearing Cache Storage...');
caches.keys().then(cacheNames => {
    return Promise.all(
        cacheNames.map(cacheName => {
            console.log(`  - Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
        })
    );
});

// Step 5: Unregister Service Workers
console.log('5/6 Unregistering Service Workers...');
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            console.log(`  - Unregistering: ${registration.scope}`);
            registration.unregister();
        });
    });
}

// Step 6: Force reload
console.log('6/6 Scheduling force reload...');
console.log('%c✅ Cache clear complete!', 'color: green; font-size: 16px; font-weight: bold;');
console.log('%cPage will reload in 2 seconds...', 'color: blue; font-size: 14px;');

setTimeout(() => {
    console.log('🔄 Reloading page...');
    window.location.reload(true);
}, 2000);

// Show alert to user
alert('✅ Production cache cleared!\nPage will reload in 2 seconds to fetch fresh data from database.');
