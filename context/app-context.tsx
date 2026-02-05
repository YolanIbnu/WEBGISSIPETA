"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { TPK_GEOJSON_DATA, WoodBlock, GeoJSONCollection } from "@/lib/geojson-data";
import {
  fetchAllStokKayu,
  updateStokKayu,
  subscribeToStokKayu,
  fetchUserProfile,
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize woodBlocks with GeoJSON properties as fallback/initial state
  const [woodBlocks, setWoodBlocks] = useState<WoodBlock[]>(
    TPK_GEOJSON_DATA.features.map((f) => f.properties)
  );

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
    await supabase.auth.signOut();
    setUser(null);
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

  // Helper to fetch profile and set user state
  const handleUserSession = async (userId: string, email: string) => {
    const profile = await fetchUserProfile(userId);

    // Default fallback if profile missing (waiting for trigger)
    const role = profile?.role || 'staff';
    const fullName = profile?.full_name || email.split('@')[0];

    setUser({
      id: userId,
      username: email,
      role: role,
      full_name: fullName
    });
  };

  // ============================================================
  // LOAD DATA & AUTH STATE ON MOUNT
  // ============================================================
  useEffect(() => {
    // 1. Fetch Stok Kayu Data
    const loadData = async () => {
      setIsLoading(true);
      const dbData = await fetchAllStokKayu();

      if (dbData && dbData.length > 0) {
        // Merge DB data with local GeoJSON properties structure
        setWoodBlocks((prevBlocks) => {
          return prevBlocks.map(block => {
            const dbItem = dbData.find(d => d.id === block.id);
            if (dbItem) {
              return { ...block, ...dbItem };
            }
            return block;
          });
        });
      }
      setIsLoading(false);
    };

    loadData();

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

  // Auto-logout removed as it was too aggressive and caused issues on mobile/Netlify
  // when browsers momentarily hide the tab during redirects or system dialogs.

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
