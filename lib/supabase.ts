// ============================================================
// SUPABASE SERVICE LAYER FOR SIPETA TPK
// ============================================================

import { createClient } from '@supabase/supabase-js';

// Pastikan variabel environment ada, atau gunakan string kosong fallback untuk mencegah error build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with no-cache headers and sessionStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
});

// ============================================================
// DATABASE TYPES
// ============================================================

export type LogStatus = "Available" | "Sold";

export interface StokKayu {
  id: string; // TPK-A01
  zone: string;
  wood_type: string;
  volume: number;
  log_count: number;
  grade: string;
  status: LogStatus;
  updated_by?: string;
  tanggal?: string;
  created_at?: string;
  updated_at?: string;
}

// Transform from DB format to UI format
// UI Format disesuaikan dengan kebutuhan GeoJSON properties
export interface LogItem {
  id: string;
  zone: string;
  woodType: string;
  volume: number;
  logCount: number;
  grade: string;
  status: LogStatus;
  updated_by?: string;
  tanggal?: string;
  id_history?: number;
}

export interface SystemSettings {
  tpk_name: string;
  location: string;
  capacity: string;
  total_area: string;
  zones: string;
}

// ============================================================
// TRANSFORM FUNCTIONS
// ============================================================

export function transformToLogItem(row: StokKayu): LogItem {
  return {
    id: row.id,
    zone: row.zone,
    woodType: row.wood_type,
    volume: Number(row.volume), // Ensure number type from Postgres Numeric
    logCount: row.log_count,
    grade: row.grade,
    status: row.status,
    updated_by: row.updated_by,
    tanggal: row.tanggal,
  };
}

export function transformToStokKayu(item: Partial<LogItem>): Partial<StokKayu> {
  const result: Partial<StokKayu> = {};

  if (item.woodType !== undefined) result.wood_type = item.woodType;
  // Pastikan dikonversi ke Number agar tidak error tipe data di database
  if (item.volume !== undefined) result.volume = Number(item.volume);
  if (item.logCount !== undefined) result.log_count = Number(item.logCount);
  if (item.grade !== undefined) result.grade = item.grade;
  if (item.status !== undefined) result.status = item.status;
  if (item.updated_by !== undefined) result.updated_by = item.updated_by;

  // Selalu gunakan tanggal hari ini (WIB/Local) jika melakukan update
  // Format: YYYY-MM-DD
  result.tanggal = new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD

  return result;
}

// ============================================================
// DATABASE FUNCTIONS (REALTIME)
// ============================================================

/**
 * Fetch all stok_kayu records with retry and cache-busting
 */
export async function fetchAllStokKayu(retries = 3): Promise<LogItem[]> {
  for (let i = 0; i < retries; i++) {
    try {
      // CRITICAL: Add timestamp to prevent browser/device caching
      // This ensures fresh data on every request across all devices
      const cacheBuster = `_t=${Date.now()}_${Math.random()}`;

      const { data, error } = await supabase
        .from('stok_kayu')
        .select('*')
        .order('id')
        // Add a filter that's always true but includes our cache buster
        .or(`id.neq.${cacheBuster},id.eq.id`);

      if (error) {
        console.warn(`Fetch stok_kayu attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) return [];
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      console.log(`✅ Fresh data fetched at ${new Date().toLocaleTimeString()}`);
      return (data || []).map(transformToLogItem);
    } catch (error) {
      console.error(`Error fetching stok_kayu (attempt ${i + 1}):`, error);
      if (i === retries - 1) return [];
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return [];
}

/**
 * Update a stok_kayu record by ID
 */
export async function updateStokKayu(
  id: string,
  updates: Partial<LogItem>
): Promise<LogItem | null> {
  const dbUpdates = transformToStokKayu(updates);

  console.log('Sending update to Supabase:', { id, dbUpdates }); // Debugging Log

  try {
    const { data, error } = await supabase
      .from('stok_kayu')
      .update(dbUpdates)
      .eq('id', id)
      .select('id, zone, wood_type, volume, log_count, grade, status, updated_by, tanggal')
      .single();

    if (error) {
      console.error('Supabase UPDATE ERROR:', error); // Supaya muncul di Console F12
      throw error;
    }

    console.log('Update success:', data);

    // 2. Simpan ke Riwayat (History) untuk Laporan Bulanan
    // Kita abaikan error jika tabel history belum dibuat agar tidak merusak flow utama
    if (data) {
      const historyData = {
        block_id: data.id,
        zone: data.zone,
        wood_type: data.wood_type,
        volume: data.volume,
        log_count: data.log_count,
        grade: data.grade,
        status: data.status,
        updated_by: data.updated_by,
        tanggal: data.tanggal
      };

      supabase.from('stok_kayu_history').insert(historyData).then(({ error: hError }) => {
        if (hError) console.warn('History table not found or error. Please run the SQL migration.', hError.message);
      });
    }

    return data ? transformToLogItem(data) : null;
  } catch (error) {
    console.error('Error updating stok_kayu:', error);
    return null;
  }
}

/**
 * Fetch historical data for reports
 */
export async function fetchStokHistory(month?: string): Promise<LogItem[]> {
  try {
    let query = supabase.from('stok_kayu_history').select('*').order('id', { ascending: false });

    if (month) {
      // month parameter expected as 'YYYY-MM'
      query = query.filter('tanggal', 'gte', `${month}-01`).filter('tanggal', 'lte', `${month}-31`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.block_id, // Map back to 'id' for consistency in UI
      zone: row.zone,
      woodType: row.wood_type,
      volume: Number(row.volume),
      logCount: row.log_count,
      grade: row.grade,
      status: row.status,
      updated_by: row.updated_by,
      tanggal: row.tanggal,
      id_history: row.id,
    }));
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

// ============================================================
// PROFILE & AUTH FUNCTIONS
// ============================================================

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'staff';
  avatar_url?: string;
}

export async function fetchUserProfile(userId: string, retries = 3): Promise<UserProfile | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn(`Profile fetch attempt ${i + 1} failed:`, error.message);
        // If it's the last attempt, return null
        if (i === retries - 1) return null;
        // Wait before retrying (exponential backoff or fixed delay)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      return data as UserProfile;
    } catch (error) {
      console.error(`Error fetching user profile (attempt ${i + 1}):`, error);
      if (i === retries - 1) return null;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return null;
}

/**
 * Get stok_kayu by zone with retry
 */
export async function fetchStokKayuByZone(zone: string, retries = 3): Promise<LogItem[]> {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .from('stok_kayu')
        .select('*')
        .eq('zone', zone);

      if (error) {
        console.warn(`Fetch zone attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) return [];
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      return (data || []).map(transformToLogItem);
    } catch (error) {
      console.error(`Error fetching zone (attempt ${i + 1}):`, error);
      if (i === retries - 1) return [];
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return [];
}

export function subscribeToStokKayu(onUpdate: (payload: any) => void) {
  return supabase
    .channel('stok_kayu_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'stok_kayu' },
      onUpdate
    )
    .subscribe((status) => {
      console.log('Realtime Stok Kayu status:', status);
    });
}

export function subscribeToSystemSettings(onUpdate: (payload: any) => void) {
  return supabase
    .channel('system_settings_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'system_settings', filter: 'id=eq.1' },
      onUpdate
    )
    .subscribe((status) => {
      console.log('Realtime Settings status:', status);
    });
}

/**
 * Fetch system settings with retry and cache-busting
 */
export async function fetchSystemSettings(retries = 3): Promise<SystemSettings | null> {
  for (let i = 0; i < retries; i++) {
    try {
      // Add timestamp to prevent caching
      const cacheBuster = Date.now();

      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 1)
        .or(`tpk_name.neq._t${cacheBuster},id.eq.1`) // Cache buster that always evaluates to get id=1
        .single();

      if (error) {
        console.warn(`Settings fetch attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) return null;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      console.log(`✅ Settings fetched fresh at ${new Date().toLocaleTimeString()}`);
      return data as SystemSettings;
    } catch (error) {
      console.error(`Error fetching settings (attempt ${i + 1}):`, error);
      if (i === retries - 1) return null;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return null;
}

/**
 * Update system settings
 */
export async function updateSystemSettings(settings: Partial<SystemSettings>, userId?: string): Promise<boolean> {
  try {
    const updatePayload: any = {
      id: 1,
      ...settings,
      updated_at: new Date().toISOString()
    };

    // Only include updated_by if we have a valid userId to avoid foreign key errors
    if (userId) {
      updatePayload.updated_by = userId;
    }

    const { error } = await supabase
      .from('system_settings')
      .upsert(updatePayload, { onConflict: 'id' });

    if (error) {
      console.error("Supabase settings update error detail:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error updating system settings crashed:", error);
    return false;
  }
}
