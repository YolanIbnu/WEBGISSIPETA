-- ================================================================
-- TRIGGER OTOMATIS UNTUK PROFIL USER
-- Jalankan script ini di SQL Editor Supabase
-- ================================================================

-- 1. Buat Fungsi Penanganan User Baru
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    new.id, 
    new.email, -- Menggunakan email sebagai username default
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Staff'), -- Ambil nama dari metadata atau default
    COALESCE(new.raw_user_meta_data->>'role', 'staff') -- Ambil role dari metadata atau default 'staff'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Pasang Trigger ke Tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) FIX
-- Agar aplikasi bisa membaca data profiles tanpa diblokir
-- ================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Buat policy baru (BACA: Semua Orang, UPDATE: Pemilik Akun Saja)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);
