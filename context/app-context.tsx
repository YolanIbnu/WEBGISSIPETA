"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { TPK_GEOJSON_DATA, WoodBlock, GeoJSONCollection } from "@/lib/geojson-data";
import {
  fetchAllStokKayu,
  updateStokKayu,
  subscribeToStokKayu,
  fetchUserProfile,
  fetchSystemSettings,
  updateSystemSettings,
  fetchStokHistory,
  SystemSettings,
  LogItem,
  supabase
} from "@/lib/supabase";

export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  username: string; // Email actually
  role: UserRole;
  full_name?: string;
}

interface AppContextType {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Data
  woodBlocks: WoodBlock[];
  geoJsonData: GeoJSONCollection;
  updateWoodBlock: (id: string, updates: Partial<WoodBlock>) => Promise<boolean>;
  isLoading: boolean;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  refreshData: () => Promise<void>;
  getHistory: (month?: string) => Promise<LogItem[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize woodBlocks with GeoJSON properties as fallback/initial state
  const [woodBlocks, setWoodBlocks] = useState<WoodBlock[]>(
    TPK_GEOJSON_DATA.features.map((f) => f.properties)
  );

  const [settings, setSettings] = useState<SystemSettings>({
    tpk_name: "TPK Cabak",
    location: "Desa Cabak, Jawa Tengah",
    capacity: "500 m³",
    total_area: "250 Hektar",
    zones: "Zona A, Zona B"
  });

  // ============================================================
  // LOGIN & LOGOUT ACTIONS
  // ============================================================

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // State user akan diupdate otomatis oleh onAuthStateChange
        return { success: true };
      }

      return { success: false, error: "Login failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear user state immediately for best UX, especially on mobile
      setUser(null);
      await supabase.auth.signOut();
      // Optional: force reload to clear all states if needed, 
      // but setUser(null) should be enough given the current app structure.
    } catch (err) {
      console.error("Logout error:", err);
      // Ensure user is still cleared even on error
      setUser(null);
    }
  }, []);

  const updateWoodBlock = useCallback(
    async (id: string, updates: Partial<WoodBlock>) => {
      // Optimistic Update (Update UI dulu)
      setWoodBlocks((prev) =>
        prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
      );

      // Send to Database with user tracking
      const updatesWithUser = { ...updates, updated_by: user?.id };
      const result = await updateStokKayu(id, updatesWithUser);
      return !!result;
    },
    [user] // Add user dependency
  );

  const refreshSettings = useCallback(async () => {
    const data = await fetchSystemSettings();
    if (data) {
      setSettings(data);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<SystemSettings>) => {
    const success = await updateSystemSettings(newSettings, user?.id);
    if (success) {
      await refreshSettings();
    }
    return success;
  }, [user, refreshSettings]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dbData, settingsData] = await Promise.all([
        fetchAllStokKayu(),
        fetchSystemSettings()
      ]);

      if (dbData && dbData.length > 0) {
        setWoodBlocks((prevBlocks) => {
          return prevBlocks.map(block => {
            const dbItem = dbData.find(d => d.id === block.id);
            return dbItem ? { ...block, ...dbItem } : block;
          });
        });
      }

      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (err) {
      console.error("Refresh data failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (month?: string) => {
    return await fetchStokHistory(month);
  }, []);

  const handleUserSession = async (userId: string, email: string) => {
    // 1. Set preliminary user immediately to allow navigation if not already set
    // This fixes the "stuck on login screen" issue while waiting for profile fetch.
    setUser(prev => {
      if (prev && prev.id === userId) return prev;
      return {
        id: userId,
        username: email,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'staff' as UserRole,
        full_name: email.split('@')[0]
      };
    });

    const profile = await fetchUserProfile(userId);

    if (profile) {
      setUser({
        id: userId,
        username: email,
        role: profile.role as UserRole,
        full_name: profile.full_name
      });
    }
  };

  // ============================================================
  // LOAD DATA & AUTH STATE ON MOUNT
  // ============================================================
  useEffect(() => {
    // 1. Consolidate Initial Data Fetch (Stocks & Settings)
    const loadInitialData = async () => {
      setIsLoading(true);
      console.log("AppProvider: Starting initial data load...");

      try {
        // Fetch stocks and settings in parallel, but handle them as they arrive
        const [dbData, settingsData] = await Promise.all([
          fetchAllStokKayu().catch(e => { console.error("Stocks fetch failed", e); return null; }),
          fetchSystemSettings().catch(e => { console.error("Settings fetch failed", e); return null; })
        ]);

        if (dbData && dbData.length > 0) {
          console.log("AppProvider: Stocks loaded", dbData.length);
          setWoodBlocks((prevBlocks) => {
            return prevBlocks.map(block => {
              const dbItem = dbData.find(d => d.id === block.id);
              return dbItem ? { ...block, ...dbItem } : block;
            });
          });
        }

        if (settingsData) {
          console.log("AppProvider: Settings loaded", settingsData.tpk_name);
          setSettings(settingsData);
        }
      } catch (err) {
        console.error("AppProvider: Error during initial load", err);
      } finally {
        // Always finish loading even if things failed
        setIsLoading(false);
        console.log("AppProvider: Initial load finished");
      }
    };

    loadInitialData();

    // 2. Subscribe to Realtime Changes for Stok Kayu
    const subscription = subscribeToStokKayu((payload) => {
      console.log('Realtime update received:', payload);
      if (payload.new && payload.new.id) {
        setWoodBlocks((prev) =>
          prev.map((block) =>
            block.id === payload.new.id ? { ...block, ...payload.new } : block
          )
        );
      }
    });

    // 3. Check Active Session & Listen to Auth Changes
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleUserSession(session.user.id, session.user.email!);
      }
    };
    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleUserSession(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ============================================================
  // INACTIVITY LOGOUT (30 MINUTES)
  // ============================================================
  useEffect(() => {
    if (!user) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);

      // Logout setelah 30 menit tidak ada aktivitas
      inactivityTimer = setTimeout(async () => {
        console.log("Inactivity detected, logging out automatically.");
        await logout();
        // Optional: you can add a toast notification here if you have a toast system
      }, 30 * 60 * 1000);
    };

    // Events that count as activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click'
    ];

    // Add listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Initial start
    resetInactivityTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [user, logout]);

  // Update GeoJSON when wood blocks change (Reactive)
  const geoJsonData: GeoJSONCollection = {
    type: "FeatureCollection",
    features: TPK_GEOJSON_DATA.features.map((feature) => {
      const updatedBlock = woodBlocks.find((b) => b.id === feature.properties.id);
      return {
        ...feature,
        properties: updatedBlock || feature.properties,
      };
    }),
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        woodBlocks,
        geoJsonData,
        updateWoodBlock,
        isLoading,
        settings,
        updateSettings,
        refreshSettings,
        refreshData,
        getHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
