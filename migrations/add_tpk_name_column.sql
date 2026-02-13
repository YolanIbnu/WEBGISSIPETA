-- Migration: Add tpk_name column to stok_kayu and stok_kayu_history tables
-- Tanggal: 2026-02-13
-- Deskripsi: Menambahkan kolom tpk_name untuk menyimpan nama TPK yang dapat diedit per blok

-- 1. Tambahkan kolom tpk_name ke tabel stok_kayu
ALTER TABLE stok_kayu 
ADD COLUMN IF NOT EXISTS tpk_name VARCHAR(100);

-- 2. Tambahkan kolom tpk_name ke tabel stok_kayu_history (jika ada)
ALTER TABLE stok_kayu_history 
ADD COLUMN IF NOT EXISTS tpk_name VARCHAR(100);

-- 3. Update existing records dengan nilai default (opsional)
-- Uncomment jika ingin set nilai default untuk data yang sudah ada
-- UPDATE stok_kayu SET tpk_name = 'TPK 40' WHERE tpk_name IS NULL;

-- 4. Tambahkan index untuk optimasi query (opsional, tapi direkomendasikan)
CREATE INDEX IF NOT EXISTS idx_stok_kayu_tpk_name ON stok_kayu(tpk_name);

-- 5. Tambahkan komentar pada kolom untuk dokumentasi
COMMENT ON COLUMN stok_kayu.tpk_name IS 'Nama TPK yang dapat diedit untuk setiap blok';
COMMENT ON COLUMN stok_kayu_history.tpk_name IS 'Nama TPK yang dapat diedit untuk setiap blok (historical record)';
