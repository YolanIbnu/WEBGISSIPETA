# 🚨 URGENT: DATA LAMA DI PRODUCTION - FIX GUIDE

## ⚠️ **MASALAH KRITIS**

**Symptoms:**
- ❌ Data di `sipetatpk.netlify.app` masih **data lama**
- ❌ Tidak sync dengan database Supabase
- ❌ Realtime sudah enabled, tapi tidak jalan
- ❌ Hard refresh tidak membantu

**Root Cause:**
1. **Production code** belum ter-update dengan fix terbaru
2. **Browser cache** production sangat agresif  
3. **Supabase Realtime** mungkin tidak ter-configure di production
4. **Service Worker** caching old data

---

## ✅ **SOLUSI INSTANT - 3 LANGKAH**

### **STEP 1: Clear Production Cache** 🗑️

**Di browser production (`sipetatpk.netlify.app`):**

#### **Method 1: Application Storage (RECOMMENDED)**

1. **Buka DevTools** (F12)
2. **Tab "Application"**
3. **Storage** di sidebar kiri
4. **Click "Clear site data"** button
5. **Refresh** (`Ctrl+Shift+R`)

#### **Method 2: Manual Storage Clear**

**Di Console (F12), paste & run:**
```javascript
// Clear ALL cache & storage
localStorage.clear();
sessionStorage.clear();
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
// Unregister service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
// Hard reload
setTimeout(() => location.reload(true), 1000);
```

**Tunggu 1-2 detik, page akan auto-refresh.**

---

### **STEP 2: Verify Supabase Realtime** 🔌

**Check di Supabase Dashboard:**

1. Login ke https://supabase.com
2. Pilih project Anda
3. **Database** → **Replication**
4. **Verify:**
   - ✅ `supabase_realtime` publication exists
   - ✅ Tables included: `stok_kayu`, `system_settings`

**Atau run SQL di Supabase SQL Editor:**

```sql
-- Check publication exists
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Check tables in publication  
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Should return: stok_kayu, system_settings
```

**If NOT exist, run:** `enable_realtime.sql` (file sudah ada di project)

---

### **STEP 3: Force Deploy Latest Code** 🚀

**Option A: Git Push to Trigger Deploy**

```bash
# Create empty commit to trigger deploy
git commit --allow-empty -m "Force deploy: Fix realtime sync v2.1.0"
git push origin main
```

**Netlify akan auto-deploy dalam 2-3 menit.**

**Option B: Manual Deploy di Netlify**

1. Login ke https://app.netlify.com
2. Pilih site `sipetatpk`
3. **Deploys** tab
4. Click **"Trigger deploy"** → **"Deploy site"**
5. Tunggu build selesai (3-5 menit)

---

## 🔍 **DEBUGGING - Check Console Logs**

**Buka F12 Console di production, verify:**

### **Expected Console Output (GOOD):**
```
✅ Cache management initialized
✅ App version initialized: 2.1.0
🔄 AppProvider: Starting initial data load...
✅ Fresh data fetched at 13:30:45
✅ AppProvider: Stocks loaded 8
✅ Settings fetched fresh at 13:30:45
🔔 Realtime update received (Stok Kayu)
```

### **Bad Console Output (NEED FIX):**
```
❌ Error fetching stok_kayu
❌ Realtime subscription failed
❌ Network error
❌ No "Fresh data fetched" message
```

---

## 🛠️ **VERIFIKASI ENVIRONMENT VARIABLES**

**Di Netlify Dashboard:**

1. **Site settings** → **Environment variables**
2. **Verify these exist:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. **If missing:** Add them!
4. **After adding:** Trigger new deploy

---

## 📊 **TESTING REAL-TIME SYNC**

**Test 1: Multi-Device Sync**

1. **Device 1** (Laptop): Open `sipetatpk.netlify.app`
2. **Device 2** (HP): Open `sipetatpk.netlify.app`  
3. **Device 1**: Update data stok kayu
4. **Device 2**: **WATCH** - data harus update dalam 3-5 detik!

**Test 2: Database Direct Update**

1. **Supabase Dashboard**: Table Editor → `stok_kayu`
2. **Edit** volume salah satu row
3. **Click Save**
4. **Browser**: Data harus auto-update (max 5 detik)
5. **No refresh needed!**

---

## 🔄 **FORCE REFRESH GUIDE (Production)**

### **Chrome/Edge:**
```
Windows: Ctrl + Shift + R
atau: Ctrl + F5
Mac: Cmd + Shift + R
```

### **Mobile (Chrome Android):**
```
1. Menu (⋮) → Settings
2. Privacy → Clear browsing data
3. Select: Cached images and files
4. Time range: Last 24 hours
5. Clear data
6. Restart Chrome
```

### **Mobile (Safari iOS):**
```
1. Settings → Safari
2. Clear History and Website Data
3. Confirm
4. Reopen Safari → site
```

---

## ⚡ **NUCLEAR OPTION - Complete Reset**

**If nothing works:**

### **1. Clear Everything Client-Side**
```javascript
// Run in Console (F12)
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.trim().split("=")[0] + 
    "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
});
caches.keys().then(k => k.forEach(c => caches.delete(c)));
navigator.serviceWorker.getRegistrations()
  .then(r => r.forEach(reg => reg.unregister()));
location.reload(true);
```

### **2. Rebuild Supabase Realtime**

**Run di SQL Editor:**
```sql
-- Drop existing publication
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;

-- Recreate
CREATE PUBLICATION supabase_realtime FOR TABLE stok_kayu, system_settings;

-- Set replica identity
ALTER TABLE stok_kayu REPLICA IDENTITY FULL;
ALTER TABLE system_settings REPLICA IDENTITY FULL;
```

### **3. Force New Deploy**
```bash
# Delete .next folder
rm -rf .next

# Rebuild locally to verify
npm run build

# Commit & push
git add .
git commit -m "Emergency: Force rebuild realtime sync"
git push origin main
```

---

## 📋 **CHECKLIST - Execute in Order**

- [ ] **1. Clear browser cache** (Method 1 atau 2)
- [ ] **2. Check console** for "Fresh data fetched"
- [ ] **3. Verify Supabase Realtime** (SQL check)
- [ ] **4. Check Netlify env vars** (URL + Key)
- [ ] **5. Trigger new deploy** (Git push atau manual)
- [ ] **6. Wait for deploy** (3-5 min)
- [ ] **7. Hard refresh production** (`Ctrl+Shift+R`)
- [ ] **8. Test multi-device sync**
- [ ] **9. Verify console logs** (realtime messages)
- [ ] **10. Test update** (toast + instant sync)

---

## 🎯 **Expected Timeline**

```
T+0:00   Clear cache + Console run      (30 seconds)
T+0:30   Check Supabase Realtime        (2 minutes)
T+2:30   Trigger Netlify deploy         (30 seconds)
T+3:00   Wait for build                 (4 minutes)
T+7:00   Hard refresh production        (10 seconds)
T+7:10   Test real-time sync            (1 minute)
T+8:10   ✅ DONE - Data fresh!
```

**Total time:** ~8-10 minutes

---

## 💡 **Pro Tips**

### **Prevent Future Issues:**

1. **Always deploy after major changes**
2. **Test on production** after every deploy
3. **Monitor Netlify build logs** for errors
4. **Keep Supabase Dashboard open** during testing
5. **Use Incognito mode** for production testing (no cache)

### **Quick Diagnostic:**

**If data still old:**
- ❌ Cache not cleared → Try harder methods
- ❌ Code not deployed → Check Netlify deploy time
- ❌ Realtime not enabled → Run enable_realtime.sql
- ❌ Network error → Check Supabase status

---

## 🆘 **Emergency Contacts & Links**

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Status: https://status.supabase.com
- Docs Realtime: https://supabase.com/docs/guides/realtime

**Netlify:**
- Dashboard: https://app.netlify.com
- Deploys: https://app.netlify.com/sites/sipetatpk/deploys
- Logs: Check build logs for errors

**Your Site:**
- Production: https://sipetatpk.netlify.app
- Localhost: http://localhost:3001

---

## 📞 **Next Steps RIGHT NOW**

### **IMMEDIATE ACTION (Do This First!):**

```javascript
// 1. Open production site in browser
// 2. Press F12 (DevTools)
// 3. Go to Console tab
// 4. Paste this and run:

localStorage.clear();
sessionStorage.clear();
caches.keys().then(k => k.forEach(c => caches.delete(c)));
alert('Cache cleared! Page will reload in 2 seconds...');
setTimeout(() => location.reload(true), 2000);
```

**Tunggu page reload, lalu:**
- Check apakah data sudah fresh
- Update 1 data untuk test
- Verify toast notification muncul
- Check apakah perubahan tersimpan

---

**Last Updated:** 2026-02-08 13:35  
**Priority:** 🔴 CRITICAL - Data Sync Issue  
**Version:** Production Hotfix v2.1.1
