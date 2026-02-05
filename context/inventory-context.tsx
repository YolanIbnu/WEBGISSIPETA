"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  fetchAllStokKayu,
  updateStokKayu,
  calculateZoneStats,
  type LogItem,
  type LogStatus,
} from "@/lib/supabase";

export type { LogItem, LogStatus };

interface ZoneStats {
  totalLogs: number;
  totalVolume: number;
  stackCount: number;
}

interface InventoryContextType {
  logs: LogItem[];
  isLoading: boolean;
  error: string | null;
  updateLog: (id: string, updates: Partial<LogItem>) => Promise<void>;
  getLogById: (id: string) => LogItem | undefined;
  getLogsByZone: (zone: "Zona A" | "Zona B") => LogItem[];
  getZoneStats: (zone: "Zona A" | "Zona B") => ZoneStats;
  getTotalVolume: () => number;
  getTotalLogCount: () => number;
  getAvailableRate: () => number;
  refetch: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount using useEffect
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllStokKayu();
      setLogs(data);
    } catch (err) {
      setError("Failed to fetch inventory data");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optimistic update: update UI immediately, then sync with backend
  const updateLog = useCallback(async (id: string, updates: Partial<LogItem>) => {
    // Store previous state for rollback
    const previousLogs = [...logs];
    
    // Optimistic update - update UI immediately
    setLogs((prev) =>
      prev.map((log) =>
        log.id === id ? { ...log, ...updates } : log
      )
    );

    try {
      // Call Supabase update in background
      const result = await updateStokKayu(id, updates);
      
      if (!result) {
        // Rollback if update failed
        setLogs(previousLogs);
        setError("Failed to update record");
      }
    } catch (err) {
      // Rollback on error
      setLogs(previousLogs);
      setError("Failed to update record");
      console.error("Update error:", err);
    }
  }, [logs]);

  const getLogById = useCallback(
    (id: string) => logs.find((log) => log.id === id),
    [logs]
  );

  const getLogsByZone = useCallback(
    (zone: "Zona A" | "Zona B") => logs.filter((log) => log.zone === zone),
    [logs]
  );

  const getZoneStats = useCallback(
    (zone: "Zona A" | "Zona B") => calculateZoneStats(logs, zone),
    [logs]
  );

  const getTotalVolume = useCallback(
    () => logs.reduce((sum, log) => sum + log.volume, 0),
    [logs]
  );

  const getTotalLogCount = useCallback(
    () => logs.reduce((sum, log) => sum + log.logCount, 0),
    [logs]
  );

  const getAvailableRate = useCallback(() => {
    if (logs.length === 0) return 0;
    const available = logs.filter((l) => l.status === "Available").length;
    return (available / logs.length) * 100;
  }, [logs]);

  return (
    <InventoryContext.Provider
      value={{
        logs,
        isLoading,
        error,
        updateLog,
        getLogById,
        getLogsByZone,
        getZoneStats,
        getTotalVolume,
        getTotalLogCount,
        getAvailableRate,
        refetch: fetchData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
}
