-- ============================================================
-- ENABLE REALTIME FOR SIPETA TPK
-- Jalankan script ini di SQL Editor Supabase Anda
-- ============================================================

-- 1. Enable Realtime for the publication
-- Pastikan publication 'supabase_realtime' ada (biasanya otomatis ada)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- 2. Add tables to the publication
-- Ini mengaktifkan Realtime untuk tabel stok_kayu dan system_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.stok_kayu;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;

-- 3. Set Replica Identity to FULL
-- Ini memastikan bahwa payload Realtime menyertakan data lama dan baru secara lengkap,
-- yang sangat disarankan untuk sinkronisasi data yang akurat.
ALTER TABLE public.stok_kayu REPLICA IDENTITY FULL;
ALTER TABLE public.system_settings REPLICA IDENTITY FULL;

-- 4. Verify RLS for Realtime
-- Realtime menghormati Row Level Security (RLS). 
-- Pastikan policy 'SELECT' mengizinkan user untuk melihat data.
-- (Biasanya sudah ada di db_schema.sql Anda)
