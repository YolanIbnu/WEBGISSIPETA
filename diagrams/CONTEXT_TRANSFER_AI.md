# 🧠 KONTEKS LENGKAP PROYEK YOLAN — Transfer ke AI Baru

> **Prompt ini berisi SELURUH konteks yang perlu diketahui AI baru agar bisa melanjutkan pekerjaan tanpa kehilangan informasi.**

---

## 👤 IDENTITAS PEMILIK PROYEK

- **Nama:** Yolan Ibnu Prasetya
- **NIM:** 1222002009
- **Jurusan:** Sistem Informasi, Fakultas Teknik dan Ilmu Komputer
- **Universitas:** Universitas Bakrie, Jakarta
- **Dosen Pembimbing:** Bapak Zakiul Fahmi Jailani, S.Kom.
- **Lokasi Penelitian:** TPK Cabak, Kec. Jiken, Kab. Blora, Provinsi Jawa Tengah

---

## 📄 TENTANG SKRIPSI

### Judul:
**"Rancang Bangun Website Sistem Informasi Geografis (SIG) Inventarisasi dan Pemetaan Stok Kayu Jati di TPK Cabak Menggunakan Metode Web Development Life Cycle (WDLC)"**

### Nama Sistem:
**SIPETA TPK** (Sistem Pemetaan dan Inventarisasi Tempat Penimbunan Kayu)

### Masalah yang Diselesaikan:
1. Pencatatan stok kayu di TPK Cabak masih manual (buku besar/spreadsheet) → rentan error
2. Tidak ada peta digital → petugas sulit melacak lokasi kaveling kayu di lapangan yang luas
3. Lag informasi → data fisik lapangan tidak sinkron dengan data di manajemen

### Solusi:
Website WebGIS interaktif yang mengintegrasikan peta digital (Leaflet.js + GeoJSON) dengan manajemen inventaris stok kayu real-time (Supabase Realtime via WebSocket).

---

## 💻 TENTANG APLIKASI SIPETA TPK

### Lokasi Kode:
```
d:\idm download\SEMESTER 8 YOLAN\TA YOLAN\Program WebQgis Yolan\WEBQGIS\
```

### Tech Stack:
| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js (v16), React 19 |
| Bahasa | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + Shadcn/UI |
| Peta | Leaflet.js 1.9.4 + react-leaflet 5.0 |
| Data Spasial | GeoJSON (dari QGIS) |
| Backend/DB | Supabase (PostgreSQL) + Realtime WebSocket |
| Animasi | Framer Motion |
| Charts | Recharts |
| Export | xlsx (Excel), jsPDF (PDF) |
| Deployment | Netlify (frontend) + GitHub (version control) |

### Struktur Folder Utama:
```
WEBQGIS/
├── app/
│   ├── layout.tsx          → Root layout
│   ├── page.tsx            → Entry point
│   └── globals.css         → Global styles
├── components/
│   ├── app-layout.tsx      → Layout utama (sidebar + content)
│   ├── app-sidebar.tsx     → Navigasi sidebar
│   ├── login-screen.tsx    → Halaman login
│   ├── map-view.tsx        → Wrapper peta Leaflet
│   ├── map-content.tsx     → Konten peta (poligon, popup, interaksi)
│   ├── edit-modal.tsx      → Modal edit data stok
│   ├── update-modal.tsx    → Modal update
│   ├── data-view.tsx       → Tampilan tabel data stok
│   ├── connection-status.tsx → Indikator koneksi realtime
│   ├── sidebar.tsx         → Sidebar component
│   └── pages/
│       ├── dashboard.tsx   → Halaman Dashboard (stat cards, charts)
│       ├── data-stok.tsx   → Halaman Data Stok (tabel + filter)
│       ├── map-inventory.tsx → Halaman Peta Inventori (WebGIS)
│       ├── laporan.tsx     → Halaman Laporan (filter bulan + export)
│       └── settings.tsx    → Halaman Pengaturan Sistem (admin only)
├── context/
│   ├── app-context.tsx     → Global state (auth, stok, settings, realtime)
│   └── inventory-context.tsx → Inventory-specific context
├── lib/
│   ├── supabase.ts         → Supabase client + API functions
│   ├── geojson-data.ts     → Data GeoJSON kaveling
│   ├── cache-utils.ts      → Caching utilities
│   └── utils.ts            → Utility functions
├── GeojsonTPK/             → File GeoJSON asli dari QGIS
├── diagrams/               → Diagram skripsi + file skripsi.txt
│   ├── skripsi.txt         → ⭐ FILE UTAMA SKRIPSI (seluruh BAB I-III)
│   ├── kerangka_penelitian.html → Diagram kerangka penelitian (HTML)
│   ├── timeline_penelitian.html → Tabel Gantt Chart (HTML)
│   ├── flowchart_sipeta_tpk.drawio → Flowchart sistem
│   ├── *.png               → Diagram UML (Use Case, Class, Activity, Sequence, ERD)
│   └── tabel_bab3.html     → Tabel BAB III dalam HTML
├── db_schema.sql           → Schema database lengkap
├── auth_trigger.sql        → Trigger untuk auto-create profile
└── enable_realtime.sql     → Script enable realtime subscription
```

### Database Schema (4 tabel):
```sql
1. profiles       → User data (id UUID PK/FK, username, full_name, role admin/staff, avatar_url)
2. stok_kayu      → Data stok (id TEXT PK, zone, tpk_name, wood_type, volume, log_count, grade, status Available/Sold, coordinates JSONB, tanggal, updated_by)
3. stok_kayu_history → Riwayat perubahan (id BIGSERIAL PK, block_id FK, semua field stok + created_at)
4. system_settings → Pengaturan TPK (id=1 single row, tpk_name, location, capacity, total_area, zones)
```

### Aktor/Role Sistem:
| Role | Hak Akses |
|------|-----------|
| **Admin** | Semua: CRUD stok, user management, pengaturan sistem, laporan, peta |
| **Staff** | Edit stok, lihat dashboard/peta/laporan, export. TANPA akses pengaturan & user management |

### Deployment:
- **URL Produksi:** Di-deploy ke Netlify
- **Repo:** GitHub (CI/CD otomatis: push → auto build → deploy)
- **Supabase Project:** Cloud (bukan self-hosted)

### Fitur Real-time:
- Menggunakan Supabase Realtime (WebSocket)
- Saat user A edit stok → user B langsung melihat perubahan tanpa refresh
- Optimistic Update: UI diperbarui dulu, baru kirim ke database

---

## 📚 TENTANG REVISI SKRIPSI

### File Skripsi:
```
d:\idm download\SEMESTER 8 YOLAN\TA YOLAN\Program WebQgis Yolan\WEBQGIS\diagrams\skripsi.txt
```

### 3 Skripsi Referensi (Universitas Bakrie):
1. **Bagas** — Mobile app manajemen RT, metode UCD (User Centered Design)
2. **Iam** — Web perpustakaan digital, metode Iterative Waterfall
3. **Tya** — QGIS pemetaan kasus TB, metode analisis spasial

### Catatan Dosen Pembimbing (dari bimbingan terakhir):
1. ✅ Metode diganti dari Prototype → **WDLC** (Web Development Life Cycle)
2. ✅ Tabel penelitian terdahulu dipindah ke akhir BAB II (2.10)
3. ✅ Tambah QGIS di BAB II (2.6.3)
4. ✅ Black Box Testing disederhanakan penjelasannya (seperti Bagas 2.10 Usability Testing)
5. ✅ BAB III diawali Kerangka Pemikiran
6. ✅ BAB III ditutup Gantt Chart/Timeline
7. ❌ BAB III JANGAN menampilkan diagram dan interface → pindah ke BAB IV
8. ❌ BAB III harus bernada RENCANA, bukan sudah selesai
9. ✅ Gambar dan tabel taruh duluan baru penjelasan
10. ✅ Sub-bab 2.9 diganti dari "Pemodelan dan Perancangan Sistem" → "Unified Modeling Language (UML)" saja (seperti Bagas & Iam)

### Status Revisi yang SUDAH Dilakukan di skripsi.txt:

| No | Revisi | Status |
|----|--------|--------|
| 1 | Ganti Prototype → WDLC di judul, kata pengantar, daftar isi, BAB I-III | ✅ Done |
| 2 | Pindah Penelitian Terdahulu ke 2.10 (akhir BAB II) | ✅ Done |
| 3 | Tambah 2.6.3 QGIS | ✅ Done |
| 4 | Sederhanakan 2.8.1 Black Box Testing (EP & BVA dipecah jadi poin) | ✅ Done |
| 5 | 2.9 → "Unified Modeling Language (UML)" dgn sub-bab: 2.9.1 Use Case (+ tabel simbol), 2.9.2 Activity, 2.9.3 Class, 2.9.4 Sequence | ✅ Done |
| 6 | DFD dan Flowchart dihapus dari 2.9 (tidak ada di BAB II Bagas/Iam) | ✅ Done |
| 7 | Tambah 3.1 Kerangka Pemikiran di awal BAB III | ✅ Done |
| 8 | Tambah 3.9 Deployment + 3.10 Timeline di akhir BAB III | ✅ Done |
| 9 | Judul BAB III diganti: "Analisis dan Perancangan Sistem" → "Metodologi Penelitian" | ✅ Done |

### Revisi yang BELUM Dilakukan (perlu Gemini/AI):

| No | Revisi | Status |
|----|--------|--------|
| 1 | BAB I: Tambah 1.2 Identifikasi Masalah + renumber sub-bab | ❌ Belum |
| 2 | BAB I: Tambah 1.7 Sistematika Penulisan | ❌ Belum |
| 3 | BAB II: Sederhanakan bahasa seluruh BAB (masih terlalu berbelit/rumit) | ❌ Belum |
| 4 | BAB III: TULIS ULANG TOTAL sesuai pola R&D (tanpa diagram/UI/database) | ❌ Belum |
| 5 | Daftar Isi: Update sesuai struktur baru | ❌ Belum |

### Struktur BAB I yang Benar (belum diupdate):
```
BAB I PENDAHULUAN
├── 1.1 Latar Belakang Masalah ← sudah ada
├── 1.2 Identifikasi Masalah ← BELUM ADA, perlu ditambah
├── 1.3 Rumusan Masalah ← ada, perlu renumber dari 1.2
├── 1.4 Batasan Masalah ← ada sebagai "1.5 Ruang Lingkup", perlu rename+renumber
├── 1.5 Tujuan Penelitian ← ada, perlu renumber dari 1.3
├── 1.6 Manfaat Penelitian ← ada, perlu renumber dari 1.4
│   ├── 1.6.1 Manfaat Teoritis
│   └── 1.6.2 Manfaat Praktis
└── 1.7 Sistematika Penulisan ← BELUM ADA, perlu ditambah
```

### Struktur BAB II yang Benar (SUDAH diupdate di skripsi.txt):
```
BAB II TINJAUAN PUSTAKA DAN LANDASAN TEORI
├── 2.1 Sistem Informasi dan Inventarisasi
├── 2.2 TPK dan Pengelolaan Kayu
├── 2.3 SIG dan WebGIS
├── 2.4 Teknologi Pengembangan Web (Next.js, React, TypeScript, Tailwind)
├── 2.5 Backend dan Basis Data (Supabase, PostgreSQL)
├── 2.6 Pemetaan dan Visualisasi Spasial (Leaflet.js, GeoJSON, QGIS)
├── 2.7 Metode Pengembangan Perangkat Lunak (WDLC)
├── 2.8 Metode Pengujian Sistem
│   └── 2.8.1 Black Box Testing (disederhanakan, EP & BVA terpisah)
├── 2.9 Unified Modeling Language (UML) ← SUDAH diubah
│   ├── 2.9.1 Use Case Diagram (+ tabel simbol notasi)
│   ├── 2.9.2 Activity Diagram
│   ├── 2.9.3 Class Diagram
│   └── 2.9.4 Sequence Diagram
└── 2.10 Penelitian Terdahulu (dipindah ke akhir)
```

### Struktur BAB III yang Benar (BELUM diupdate, perlu tulis ulang total):
```
BAB III METODOLOGI PENELITIAN
├── 3.1 Kerangka Penelitian (alur WDLC + gambar)
│   ├── 3.1.1 Planning
│   ├── 3.1.2 Analysis
│   ├── 3.1.3 Design → "detail di BAB IV"
│   ├── 3.1.4 Development → "detail di BAB IV"
│   ├── 3.1.5 Testing → "detail di BAB IV"
│   └── 3.1.6 Deployment
├── 3.2 Metode Pengumpulan Data
│   ├── 3.2.1 Observasi (kualitatif)
│   ├── 3.2.2 Wawancara (kualitatif)
│   └── 3.2.3 Studi Literatur
├── 3.3 Metode Pengujian Sistem (BBT = kuantitatif, detail di BAB IV)
├── 3.4 Alat Penelitian (Hardware + Software)
├── 3.5 Objek Penelitian (TPK Cabak)
└── 3.6 Tempat dan Waktu Penelitian (Gantt Chart Sep 2025 - Feb 2026)
```

### PENTING — BAB III TIDAK BOLEH berisi:
- ❌ Diagram UML (Use Case, Class, Activity, Sequence)
- ❌ ERD / tabel database
- ❌ Flowchart detail
- ❌ Wireframe / mockup UI
- ❌ Tabel skenario Black Box Testing detail
→ Semua itu masuk **BAB IV (Hasil dan Pembahasan)**

---

## 📖 DAFTAR 28 REFERENSI/JURNAL (WAJIB - JANGAN TAMBAH BARU)

| No | Referensi | Tahun | Konteks |
|----|-----------|-------|---------|
| 1 | Okyusmarianto, Sadjati, & Ikhsani | 2024 | WebGIS evaluasi lahan hutan |
| 2 | Ate | 2024 | WebGIS pemetaan lokasi |
| 3 | Yasin & Zaini | 2024 | Inventarisasi berbasis web, UML |
| 4 | Agustine & Handayani | 2025 | Inventory kayu UD Sulur Jati |
| 5 | Aprilisa & Aulia | 2024 | Metode WDLC, flowchart, Sequence Diagram |
| 6 | Asfari | 2024 | Sistem inventarisasi |
| 7 | Hafizah & Agustin | 2024 | Sistem informasi web |
| 8 | Wiranata | 2023 | Manajemen persediaan kayu log |
| 9 | Surachman | 2024 | SIG dan data spasial |
| 10 | Tarmizi & Ridha | 2021 | WebGIS client-side |
| 11 | Restu | 2024 | Arsitektur web, TypeScript |
| 12 | Hanafi, Haq, & Agustin | 2024 | Next.js SSR |
| 13 | Sanjaya & Saputra | 2023 | Next.js manajemen data |
| 14 | Rachman, Shalahudin, & Radifa | 2023 | React.js, non-fungsional |
| 15 | Azhariyah & Mukhlis | 2023 | Tailwind CSS, wireframe |
| 16 | Nugraha, Rianto, Rezkika, & Haryono | 2026 | React + Supabase |
| 17 | Uzlah et al. | 2025 | Leaflet.js visualisasi |
| 18 | Lisakiyanto & S | 2024 | Leaflet render koordinat |
| 19 | Mauliza, Achmady, & Nurfebruary | 2024 | GeoJSON |
| 20 | Ramadhan, Irawan, & Juardi | 2023 | QGIS pemetaan lahan |
| 21 | Suharyono, Kartini, & Junaidi | 2024 | Black Box Testing |
| 22 | Satyaninggrat, Hamijaya, & Rahmah | 2023 | Data Flow Diagram |
| 23 | Sonata | 2019 | UML standar industri |
| 24 | Fitria et al. | 2020 | Use Case Diagram |
| 25 | Ramasenjaya & Juman | 2022 | Activity Diagram, Class Diagram |
| 26 | Suendri | 2018 | Bagian class (Nama, Atribut, Operasi) |

---

## 📁 FILE-FILE DIAGRAM YANG SUDAH DIBUAT

| File | Keterangan |
|------|------------|
| `diagrams/kerangka_penelitian.html` | Diagram alur kerangka penelitian (WDLC) — buka di browser, screenshot untuk Word |
| `diagrams/timeline_penelitian.html` | Tabel Gantt Chart alokasi waktu (Sep 2025 - Feb 2026) — buka di browser |
| `diagrams/flowchart_sipeta_tpk.drawio` | Flowchart sistem utama (draw.io) |
| `diagrams/USECASE DIAGRAM.png` | Use Case Diagram |
| `diagrams/CLASS DIAGRAM.png` | Class Diagram |
| `diagrams/ACTIVTY DIAGRAM.png` | Activity Diagram |
| `diagrams/SEQUENCE.png` | Sequence Diagram |
| `diagrams/ERD SIPETA.png` | Entity Relationship Diagram |

---

## 🎯 TASK SELANJUTNYA (PRIORITAS)

### Skripsi:
1. **BAB I** — Tambah Identifikasi Masalah (1.2) + Sistematika Penulisan (1.7) + renumber
2. **BAB II** — Sederhanakan bahasa seluruh bab (terlalu bertele-tele saat ini)
3. **BAB III** — TULIS ULANG TOTAL sesuai pola R&D (tanpa diagram, hanya metodologi)
4. **Daftar Isi** — Update sesuai struktur baru

### Aplikasi:
- Sistem sudah berjalan di production (Netlify)
- Kemungkinan ada bug fix atau fitur tambahan yang diminta dospem

---

## 🗣️ GAYA KOMUNIKASI

- Yolan berbicara dalam **Bahasa Indonesia**
- Yolan sering bilang "keknya" (= "sepertinya"), "deh", "yap", "coba liat punya bagas/iam"
- Yolan sering meminta AI untuk membaca file referensi Bagas/Iam/Tya sebagai acuan
- Yolan ingin hasil yang **LANGSUNG BISA DIPAKAI**, bukan teori panjang lebar
- Yolan lebih suka AI langsung edit file daripada hanya memberikan saran
- Untuk revisi skripsi, Yolan lebih suka menerima **prompt untuk Gemini** karena skripsi terlalu panjang

---

## ⚡ TIPS UNTUK AI BARU

1. **Selalu baca file-file referensi** (Bagas, Iam, Tya) sebelum merevisi skripsi
2. **JANGAN menambah referensi baru** — hanya 28 jurnal yang sudah ada
3. **BAB III = metodologi SAJA** — diagram dan hasil masuk BAB IV
4. **Bahasa skripsi** yang diinginkan: formal akademis tapi TIDAK bertele-tele
5. **Metode = WDLC** — bukan Prototype, bukan Waterfall
6. **Skripsi ada di** `diagrams/skripsi.txt` — ini file plain text, bukan .docx
7. **Aplikasi sudah production** — hati-hati jangan break existing features
8. **Daftar Isi di skripsi.txt masih outdated** — belum mengikuti revisi terakhir

---
