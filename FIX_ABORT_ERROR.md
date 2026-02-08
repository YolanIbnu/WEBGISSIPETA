# 🆘 FIX: Runtime AbortError

## ⚠️ Error yang Terjadi

```
Runtime AbortError
signal is aborted without reason
```

**Dan juga:**
```
Persisting failed: Unable to write SST file 00000952.sst
The system cannot find the path specified. (os error 3)
```

---

## 🔍 **Penyebab**

1. **Multiple dev servers running** - Port 3000 dan 3001 conflict
2. **Corrupted .next cache** - Setelah delete folder, ada sisa process
3. **Node.js cache issue** - Persistent connection tidak ter-cleanup
4. **Supabase client** - AbortController terminated mid-request

---

## ✅ **SOLUSI LENGKAP**

### **OPTION 1: Manual Process Kill (RECOMMENDED)**

#### **Step 1: Tutup SEMUA Terminal**
- ❌ Close tab terminal di VS Code
- ❌ Close terminal window
- ❌ Close VS Code jika perlu

#### **Step 2: Kill Node Process Manual**

**Windows:**
1. Tekan `Ctrl + Shift + Esc` (Task Manager)
2. Tab **"Details"**
3. Cari semua **"node.exe"**
4. Klik kanan → **"End Task"** untuk SEMUA node.exe
5. Tunggu 5 detik

**Atau gunakan Command Prompt (Run as Administrator):**
```cmd
taskkill /F /IM node.exe
```

#### **Step 3: Clean Start**

**Buka terminal BARU**, jalankan:

```powershell
# 1. Navigate to project
cd "d:\idm download\SEMESTER 8 YOLAN\TA YOLAN\Program WebQgis Yolan\WEBQGIS"

# 2. Delete build cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 3. Start dev server
npm run dev
```

---

### **OPTION 2: Fresh Installation (Nuclear Option)**

Jika masalah masih persist:

```powershell
# 1. Stop all node
taskkill /F /IM node.exe

# 2. Clean all
Remove-Item -Recurse -Force .next, node_modules

# 3. Reinstall
npm install

# 4. Start
npm run dev
```

⚠️ **Warning:** Ini akan re-download semua packages (~500MB), butuh waktu 5-10 menit.

---

### **OPTION 3: Use Different Port**

Jika port 3000 tetap stuck:

**Edit** `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    ...
  }
}
```

Atau langsung jalankan:
```bash
npx next dev -p 3002
```

Akses aplikasi di: `http://localhost:3002`

---

## 🔧 **Code Fix: Prevent AbortError**

### **File:** `lib/supabase.ts`

**Add timeout and better error handling:**

```typescript
// At the top, after imports
const FETCH_TIMEOUT = 10000; // 10 seconds

// Update fetchAllStokKayu
export async function fetchAllStokKayu(retries = 3): Promise<LogItem[]> {
  for (let i = 0; i < retries; i++) {
    try {
      const cacheBuster = `_t=${Date.now()}_${Math.random()}`;
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      
      const { data, error } = await supabase
        .from('stok_kayu')
        .select('*')
        .order('id')
        .or(`id.neq.${cacheBuster},id.eq.id`)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);

      if (error) {
        console.warn(`Fetch stok_kayu attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) return [];
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      console.log(`✅ Fresh data fetched at ${new Date().toLocaleTimeString()}`);
      return (data || []).map(transformToLogItem);
    } catch (error: any) {
      // Handle AbortError gracefully
      if (error.name === 'AbortError') {
        console.warn(`Request timeout (attempt ${i + 1})`);
      } else {
        console.error(`Error fetching stok_kayu (attempt ${i + 1}):`, error);
      }
      
      if (i === retries - 1) return [];
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return [];
}
```

---

## 🎯 **Expected Result After Fix**

### **Console Should Show:**
```
✓ Ready in 15.2s
○ Compiling / ...
✓ Compiled / in 2.5s (compile: 2.0s, render: 500ms)
GET / 200 in 2500ms
```

### **No More:**
- ❌ AbortError
- ❌ Persisting failed
- ❌ Port in use errors

---

## 📊 **Testing**

Setelah server running:

1. **Open browser** → `http://localhost:3000` (atau 3002)
2. **Check console** (F12) - tidak ada error merah
3. **Login** - harus smooth
4. **Dashboard** - load < 3 detik
5. **Data Stok** - load < 1 detik

---

## 💡 **Pro Tips**

### **Development Best Practice:**

1. **Always use single terminal** untuk dev server
2. **Stop server properly** dengan `Ctrl+C` sebelum close
3. **Check port** sebelum restart:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000
   ```
4. **Use VS Code integrated terminal** - lebih stable

### **If Error Persists:**

1. **Restart computer** (serius, kadang ini solusi tercepat!)
2. **Check antivirus** - kadang block file write
3. **Check disk space** - pastikan ada space cukup
4. **Check permissions** - run VS Code as administrator

---

## 🚀 **Quick Command Reference**

```powershell
# Kill all node
taskkill /F /IM node.exe

# Clean build
Remove-Item -Recurse -Force .next

# Check port usage
Get-NetTCPConnection -LocalPort 3000

# Start on different port
npx next dev -p 3002

# Full clean install
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run dev
```

---

**TL;DR:**
1. Task Manager → Kill all `node.exe`
2. Delete `.next` folder
3. Open **NEW** terminal
4. Run `npm run dev`
5. Hard refresh browser

**Last Updated:** 2026-02-08 13:00  
**Fix Version:** AbortError Resolution Guide
