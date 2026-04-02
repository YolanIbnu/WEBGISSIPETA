-- ============================================================
-- MIGRATION: Update TPK Cabak inventory system
-- Date: 2026-03-24
-- Description: 
--   1. Add new fields (cacat_kayu, panjang, diameter, tahun_produksi)
--   2. Update status values from Available/Sold to HARA/LOKAL/INDUSTRI/VINIR
--   3. Update block IDs to match TPK naming convention
--   4. Update grade values to AI/AII/AIII (displayed as "Sortimen" in UI)
-- ============================================================

-- 1. Add new columns to stok_kayu table
ALTER TABLE stok_kayu 
  ADD COLUMN IF NOT EXISTS cacat_kayu TEXT,
  ADD COLUMN IF NOT EXISTS panjang1 NUMERIC,
  ADD COLUMN IF NOT EXISTS panjang2 NUMERIC,
  ADD COLUMN IF NOT EXISTS diameter1 NUMERIC,
  ADD COLUMN IF NOT EXISTS diameter2 NUMERIC,
  ADD COLUMN IF NOT EXISTS tahun_produksi INTEGER;

-- 2. Add new columns to stok_kayu_history table
ALTER TABLE stok_kayu_history 
  ADD COLUMN IF NOT EXISTS cacat_kayu TEXT,
  ADD COLUMN IF NOT EXISTS panjang1 NUMERIC,
  ADD COLUMN IF NOT EXISTS panjang2 NUMERIC,
  ADD COLUMN IF NOT EXISTS diameter1 NUMERIC,
  ADD COLUMN IF NOT EXISTS diameter2 NUMERIC,
  ADD COLUMN IF NOT EXISTS tahun_produksi INTEGER;

-- 3. Update existing status values
UPDATE stok_kayu SET status = 'HARA' WHERE status = 'Available';
UPDATE stok_kayu SET status = 'LOKAL' WHERE status = 'Sold';
UPDATE stok_kayu_history SET status = 'HARA' WHERE status = 'Available';
UPDATE stok_kayu_history SET status = 'LOKAL' WHERE status = 'Sold';

-- 4. Update grade values to new format
UPDATE stok_kayu SET grade = 'AI' WHERE grade IN ('A.I', 'A.II');
UPDATE stok_kayu_history SET grade = 'AI' WHERE grade IN ('A.I', 'A.II');

-- 5. Rename existing block IDs (stok_kayu)
UPDATE stok_kayu SET id = 'BLOK-F-1-3', zone = 'Blok F 1-3' WHERE id = 'TPK-A01';
UPDATE stok_kayu SET id = 'BLOK-E-4-8', zone = 'Blok E 4-8' WHERE id = 'TPK-A02';
UPDATE stok_kayu SET id = 'BLOK-B-4-6', zone = 'Blok B 4-6' WHERE id = 'TPK-A03';
UPDATE stok_kayu SET id = 'BLOK-C-1-2', zone = 'Blok C 1-2' WHERE id = 'TPK-A04';
UPDATE stok_kayu SET id = 'BLOK-G-1-3', zone = 'Blok G 1-3' WHERE id = 'TPK-A05';
UPDATE stok_kayu SET id = 'BLOK-H-1-3', zone = 'Blok H 1-3' WHERE id = 'TPK-A06';
UPDATE stok_kayu SET id = 'BLOK-H-4-6', zone = 'Blok H 4-6' WHERE id = 'TPK-A07';
UPDATE stok_kayu SET id = 'BLOK-A-1-2', zone = 'Blok A 1-2' WHERE id = 'TPK-A08';
UPDATE stok_kayu SET id = 'BLOK-C-3-5', zone = 'Blok C 3-5' WHERE id = 'TPK-A09';
UPDATE stok_kayu SET id = 'BLOK-A-3-5', zone = 'Blok A 3-5' WHERE id = 'TPK-A10';
UPDATE stok_kayu SET id = 'BLOK-D-1-5', zone = 'Blok D 1-5' WHERE id = 'TPK-A11';
UPDATE stok_kayu SET id = 'BLOK-B-1-3', zone = 'Blok B 1-3' WHERE id = 'TPK-A12';
UPDATE stok_kayu SET id = 'BLOK-E-1-3', zone = 'Blok E 1-3' WHERE id = 'TPK-A13';
UPDATE stok_kayu SET id = 'BLOK-G-4-6', zone = 'Blok G 4-6' WHERE id = 'TPK-A14';
UPDATE stok_kayu SET id = 'BLOK-I-1-5', zone = 'Blok I 1-5' WHERE id = 'TPK-A15';

-- 6. Update history references
UPDATE stok_kayu_history SET block_id = 'BLOK-F-1-3' WHERE block_id = 'TPK-A01';
UPDATE stok_kayu_history SET block_id = 'BLOK-E-4-8' WHERE block_id = 'TPK-A02';
UPDATE stok_kayu_history SET block_id = 'BLOK-B-4-6' WHERE block_id = 'TPK-A03';
UPDATE stok_kayu_history SET block_id = 'BLOK-C-1-2' WHERE block_id = 'TPK-A04';
UPDATE stok_kayu_history SET block_id = 'BLOK-G-1-3' WHERE block_id = 'TPK-A05';
UPDATE stok_kayu_history SET block_id = 'BLOK-H-1-3' WHERE block_id = 'TPK-A06';
UPDATE stok_kayu_history SET block_id = 'BLOK-H-4-6' WHERE block_id = 'TPK-A07';
UPDATE stok_kayu_history SET block_id = 'BLOK-A-1-2' WHERE block_id = 'TPK-A08';
UPDATE stok_kayu_history SET block_id = 'BLOK-C-3-5' WHERE block_id = 'TPK-A09';
UPDATE stok_kayu_history SET block_id = 'BLOK-A-3-5' WHERE block_id = 'TPK-A10';
UPDATE stok_kayu_history SET block_id = 'BLOK-D-1-5' WHERE block_id = 'TPK-A11';
UPDATE stok_kayu_history SET block_id = 'BLOK-B-1-3' WHERE block_id = 'TPK-A12';
UPDATE stok_kayu_history SET block_id = 'BLOK-E-1-3' WHERE block_id = 'TPK-A13';
UPDATE stok_kayu_history SET block_id = 'BLOK-G-4-6' WHERE block_id = 'TPK-A14';
UPDATE stok_kayu_history SET block_id = 'BLOK-I-1-5' WHERE block_id = 'TPK-A15';

-- 7. Insert blocks if they don't exist (e.g., fresh database)
INSERT INTO stok_kayu (id, zone, wood_type, volume, log_count, grade, status)
VALUES
  ('BLOK-A-1-2', 'Blok A 1-2', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-A-3-5', 'Blok A 3-5', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-B-1-3', 'Blok B 1-3', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-B-4-6', 'Blok B 4-6', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-C-1-2', 'Blok C 1-2', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-C-3-5', 'Blok C 3-5', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-D-1-5', 'Blok D 1-5', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-E-1-3', 'Blok E 1-3', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-E-4-8', 'Blok E 4-8', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-F-1-3', 'Blok F 1-3', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-G-1-3', 'Blok G 1-3', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-G-4-6', 'Blok G 4-6', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-H-1-3', 'Blok H 1-3', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-H-4-6', 'Blok H 4-6', 'Jati', 0, 0, 'AI', 'HARA'),
  ('BLOK-I-1-5', 'Blok I 1-5', 'Jati', 0, 0, 'AI', 'HARA')
ON CONFLICT (id) DO NOTHING;

-- 8. Add comments
COMMENT ON COLUMN stok_kayu.grade IS 'Sortimen kayu: AI, AII, AIII';
COMMENT ON COLUMN stok_kayu.cacat_kayu IS 'Cacat kayu: NORMAL, DORENG, BUNCAK, GROWONG, LAPUK';
COMMENT ON COLUMN stok_kayu.panjang1 IS 'Panjang kolom 1 dalam meter';
COMMENT ON COLUMN stok_kayu.panjang2 IS 'Panjang kolom 2 dalam meter';
COMMENT ON COLUMN stok_kayu.diameter1 IS 'Tebal/Diameter kolom 1 dalam cm';
COMMENT ON COLUMN stok_kayu.diameter2 IS 'Tebal/Diameter kolom 2 dalam cm';
COMMENT ON COLUMN stok_kayu.tahun_produksi IS 'Tahun produksi kayu';
