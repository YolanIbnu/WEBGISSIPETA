# Solusi Masalah Data Tidak Real-Time

## Masalah
Data tidak sinkron antara perangkat (laptop vs HP). Kadang laptop dapat data baru langsung, tapi HP masih data lama, atau sebaliknya. Refresh berkali-kali tidak membantu.

## Penyebab Utama
1. **Browser Caching** - Browser mobile sangat agresif melakukan cache
2. **Realtime Connection** terputus saat tab tidak aktif
3. **Service Worker** (PWA) mungkin cache responses
4. **Network Latency** - Mobile mungkin lebih lambat

## Solusi yang Diterapkan

### 1. Tambah Query Parameter Timestamp (Cache Busting)
Setiap request ke Supabase akan memiliki timestamp unik untuk mencegah cache browser.

### 2. Visibilitychange Event
Selain focus event, tambahkan visibilitychange untuk mendeteksi ketika tab kembali aktif.

### 3. Reconnect Realtime on Visibility
Re-subscribe realtime subscription setiap kali tab kembali visible.

### 4. Periodic Refresh
Tambahkan auto-refresh setiap 30 detik untuk mobile devices.

### 5. Force Refresh on Manual Trigger
Tambahkan mekanisme hard refresh dengan timestamp.

### 6. Network State Detection
Detect online/offline state dan auto-refresh saat kembali online.

## Cara Menggunakan
1. Jalankan SQL di `enable_realtime.sql` jika belum
2. Deploy perubahan kode
3. Pastikan tidak ada Service Worker lama yang cache
4. Test di multiple devices

## Testing
- Buka aplikasi di 2 perangkat berbeda
- Update data di device 1
- Cek apakah device 2 langsung update (max 2-3 detik)
- Switch tab/app di mobile, kemudian kembali - data harus fresh
- Matikan internet, nyalakan lagi - data harus auto-refresh
