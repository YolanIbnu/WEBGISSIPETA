-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: profiles (Untuk Admin/Staff)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- TABLE: stok_kayu (Data Stok TPK)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.stok_kayu (
    id TEXT PRIMARY KEY, -- ID Blok, misal: 'TPK-A01'
    zone TEXT NOT NULL,
    wood_type TEXT NOT NULL,
    volume NUMERIC DEFAULT 0,
    log_count INTEGER DEFAULT 0,
    grade TEXT,
    status TEXT CHECK (status IN ('Available', 'Sold')) DEFAULT 'Available',
    updated_by UUID REFERENCES auth.users(id),
    coordinates JSONB, -- Simpan koordinat polygon GeoJSON
    tanggal DATE DEFAULT CURRENT_DATE, -- Tanggal entry/update
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for stok_kayu
ALTER TABLE public.stok_kayu ENABLE ROW LEVEL SECURITY;

-- Policies for stok_kayu
CREATE POLICY "Stok kayu is viewable by everyone" 
ON public.stok_kayu FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert/update stok_kayu" 
ON public.stok_kayu FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- SEED DATA (Data Awal untuk TPK Cabak)
-- ==========================================
INSERT INTO public.stok_kayu (id, zone, wood_type, volume, log_count, grade, status, coordinates, tanggal)
VALUES 
    ('TPK-A01', 'TPK Cabak - Blok A', 'Jati', 45.5, 120, 'A.II', 'Available', '[[[111.5137489, -7.0257169], [111.5143869, -7.0263295], [111.5145642, -7.0261307], [111.5138825, -7.0255821], [111.5137489, -7.0257169]]]'::jsonb, '2024-02-05'),
    ('TPK-A02', 'TPK Cabak - Blok A', 'Mahoni', 38.2, 95, 'B.I', 'Available', '[[[111.5134979, -7.0260072], [111.5140806, -7.0265924], [111.5143247, -7.0263135], [111.5137489, -7.0257764], [111.5134979, -7.0260072]]]'::jsonb, '2024-02-05')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- TABLE: system_settings (Pengaturan Aplikasi)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1, -- Single row table
    tpk_name TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity TEXT NOT NULL,
    total_area TEXT DEFAULT '250 Hektar',
    zones TEXT DEFAULT 'Zona A, Zona B',
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Settings viewable by everyone" 
ON public.system_settings FOR SELECT USING (true);

CREATE POLICY "Settings updateable by authenticated users" 
ON public.system_settings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Settings insertable by authenticated users" 
ON public.system_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Seed Data (Default)
INSERT INTO public.system_settings (id, tpk_name, location, capacity, total_area, zones)
VALUES (1, 'TPK Cabak', 'Desa Cabak, Jawa Tengah', '500 m³', '250 Hektar', 'Zona A, Zona B')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- TABLE: stok_kayu_history (Riwayat Stok)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.stok_kayu_history (
    id BIGSERIAL PRIMARY KEY,
    block_id TEXT NOT NULL,
    zone TEXT,
    wood_type TEXT,
    volume NUMERIC,
    log_count INTEGER,
    grade TEXT,
    status TEXT,
    updated_by UUID REFERENCES auth.users(id),
    tanggal DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.stok_kayu_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "History viewable by everyone" 
ON public.stok_kayu_history FOR SELECT USING (true);

CREATE POLICY "History insertable by authenticated users" 
ON public.stok_kayu_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
