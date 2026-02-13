# Fitur Edit Nama TPK

## Deskripsi
Fitur ini memungkinkan user untuk mengedit nama TPK pada setiap blok di peta. Nama TPK yang diedit akan tersimpan di database dan ditampilkan di detail bidang.

## Implementasi

### 1. Database Migration
Jalankan SQL migration berikut di Supabase Dashboard:

```sql
-- File: migrations/add_tpk_name_column.sql
```

**Cara menjalankan:**
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik menu "SQL Editor" di sidebar kiri
4. Klik "New Query"
5. Copy-paste isi file `migrations/add_tpk_name_column.sql`
6. Klik "Run" untuk execute SQL

### 2. Struktur Data

**Interface WoodBlock:**
```typescript
export interface WoodBlock {
  id: string;
  zone: string;
  tpkName?: string; // ← Field baru untuk nama TPK
  woodType: string;
  volume: number;
  logCount: number;
  grade: string;
  status: "Available" | "Sold";
  tanggal?: string;
}
```

**Database Table `stok_kayu`:**
- Kolom baru: `tpk_name` (VARCHAR 100, nullable)
- Index: `idx_stok_kayu_tpk_name`

### 3. Cara Menggunakan

1. **Buka Map Inventory**
2. **Klik pada blok/polygon** yang ingin di-edit
3. **Klik tombol "Update Inventaris"** di detail panel
4. **Isi field "Nama TPK"** di modal edit (contoh: "TPK 40", "TPK Cabak Utara", dll)
5. **Klik "Simpan Perubahan"**
6. Nama TPK akan disimpan dan ditampilkan di "Detail Bidang"

### 4. Fitur Yang Ditambahkan

✅ Field input "Nama TPK" di `EditModal`
✅ Simpan nama TPK ke database `stok_kayu`
✅ Simpan nama TPK ke history `stok_kayu_history`
✅ Tampilkan nama TPK di Detail Bidang (panel map inventory)
✅ **Kolom "TPK / Zona" di tabel Data Stok menampilkan nama TPK (jika terisi)**
✅ Realtime sync nama TPK antar devices
✅ Search filter support untuk nama TPK

### 5. File Yang Dimodifikasi

1. **lib/geojson-data.ts** - Tambah field `tpkName` di interface `WoodBlock`
2. **lib/supabase.ts** - Update interface & transformasi data
3. **components/edit-modal.tsx** - Tambah input field Nama TPK
4. **components/pages/map-inventory.tsx** - Tampilkan nama TPK di detail panel
5. **components/pages/data-stok.tsx** - Kolom Zona menampilkan nama TPK (dengan fallback ke zona)
6. **context/app-context.tsx** - Sudah support karena menggunakan `Partial<WoodBlock>`

### 6. Testing

**Test Case:**
- [ ] Buat/edit nama TPK di satu device
- [ ] Verifikasi tersimpan di database Supabase
- [ ] Buka di device lain, pastikan nama TPK muncul
- [ ] Edit lagi, pastikan update berhasil
- [ ] Check history table, pastikan tpk_name terekam

### 7. Next Steps (Opsional)

Jika ingin menampilkan nama TPK di detail panel:
- Edit komponen yang menampilkan "Detail Bidang"
- Tambahkan field display untuk `tpkName` atau `TPK`
- Contoh: `<p>TPK: {block.tpkName || 'Belum diisi'}</p>`

## Screenshot

**Before:**
- Modal hanya punya: Jenis Kayu, Volume, Jumlah Batang, Grade, Status

**After:**
- Modal sekarang punya: **Nama TPK** (baru), Jenis Kayu, Volume, Jumlah Batang, Grade, Status

## Notes

- Field `tpkName` bersifat **opsional** (tidak wajib diisi)
- Jika tidak diisi, database akan menyimpan `NULL`
- Tidak ada validasi khusus (bisa diisi text bebas)
- Maksimal panjang: 100 karakter
