"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/context/inventory-context";
import type { LogItem, LogStatus } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface MapViewProps {
  onSelectLog: (id: string) => void;
}

function getStatusColor(status: LogStatus) {
  switch (status) {
    case "Available":
      return "bg-available";
    case "Sold":
      return "bg-sold";
    default:
      return "bg-muted";
  }
}

export function MapView({ onSelectLog }: MapViewProps) {
  const { logs, getLogsByZone, getZoneStats, isLoading } = useInventory();
  const [hoveredLog, setHoveredLog] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

  const zonaALogs = getLogsByZone("Zona A");
  const zonaBLogs = getLogsByZone("Zona B");
  const zonaAStats = getZoneStats("Zona A");
  const zonaBStats = getZoneStats("Zona B");

  const handleLogClick = (log: LogItem) => {
    setSelectedLog(log);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Map Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Visualisasi peta stok kayu TPK
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-available" />
                <span className="text-xs text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-sold" />
                <span className="text-xs text-muted-foreground">Sold</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Map */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-foreground/30" />
        </div>

        {/* Map Content */}
        <div className="relative h-full p-6">
          {/* Zone A */}
          <div
            className="absolute border-2 border-dashed border-available/70 rounded-xl bg-available/10"
            style={{
              left: "3%",
              top: "5%",
              width: "44%",
              height: "90%",
            }}
          >
            {/* Zone A Header with Stats */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-3 left-4 flex items-center gap-2"
            >
              <span className="px-4 py-1.5 bg-available text-background rounded-full text-sm font-bold shadow-lg">
                ZONA A
              </span>
              <span className="px-3 py-1.5 bg-card/95 backdrop-blur-sm text-card-foreground rounded-full text-xs font-medium shadow-lg">
                {zonaAStats.totalLogs.toLocaleString()} btg
              </span>
              <span className="px-3 py-1.5 bg-card/95 backdrop-blur-sm text-card-foreground rounded-full text-xs font-medium shadow-lg">
                {zonaAStats.totalVolume.toFixed(1)} m&sup3;
              </span>
            </motion.div>

            {/* Zone A Logs */}
            {zonaALogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                onClick={() => handleLogClick(log)}
                onMouseEnter={() => setHoveredLog(log.id)}
                onMouseLeave={() => setHoveredLog(null)}
                className={cn(
                  "absolute cursor-pointer rounded-md shadow-lg transition-all duration-200",
                  getStatusColor(log.status),
                  "hover:shadow-xl"
                )}
                style={{
                  left: `${(log.coordinates.x - 5) * 2}%`,
                  top: `${log.coordinates.y * 2}%`,
                  width: `${log.coordinates.width * 2}%`,
                  height: `${log.coordinates.height * 2}%`,
                  minWidth: "40px",
                  minHeight: "30px",
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-background drop-shadow-md">
                    {log.id}
                  </span>
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredLog === log.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-card text-card-foreground rounded-lg shadow-xl whitespace-nowrap z-20 text-xs font-medium"
                    >
                      {log.id} - {log.woodType}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Zone B */}
          <div
            className="absolute border-2 border-dashed border-primary/70 rounded-xl bg-primary/10"
            style={{
              left: "53%",
              top: "5%",
              width: "44%",
              height: "90%",
            }}
          >
            {/* Zone B Header with Stats */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-3 left-4 flex items-center gap-2"
            >
              <span className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg">
                ZONA B
              </span>
              <span className="px-3 py-1.5 bg-card/95 backdrop-blur-sm text-card-foreground rounded-full text-xs font-medium shadow-lg">
                {zonaBStats.totalLogs.toLocaleString()} btg
              </span>
              <span className="px-3 py-1.5 bg-card/95 backdrop-blur-sm text-card-foreground rounded-full text-xs font-medium shadow-lg">
                {zonaBStats.totalVolume.toFixed(1)} m&sup3;
              </span>
            </motion.div>

            {/* Zone B Logs */}
            {zonaBLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                onClick={() => handleLogClick(log)}
                onMouseEnter={() => setHoveredLog(log.id)}
                onMouseLeave={() => setHoveredLog(null)}
                className={cn(
                  "absolute cursor-pointer rounded-md shadow-lg transition-all duration-200",
                  getStatusColor(log.status),
                  "hover:shadow-xl"
                )}
                style={{
                  left: `${(log.coordinates.x - 55) * 2}%`,
                  top: `${log.coordinates.y * 2}%`,
                  width: `${log.coordinates.width * 2}%`,
                  height: `${log.coordinates.height * 2}%`,
                  minWidth: "40px",
                  minHeight: "30px",
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-bold text-background drop-shadow-md">
                    {log.id}
                  </span>
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredLog === log.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-card text-card-foreground rounded-lg shadow-xl whitespace-nowrap z-20 text-xs font-medium"
                    >
                      {log.id} - {log.woodType}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Detail Card */}
        <AnimatePresence>
          {selectedLog && (
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 20 }}
              className="absolute bottom-6 right-6 w-80 bg-card/95 backdrop-blur-xl rounded-xl shadow-2xl border border-border overflow-hidden"
            >
              {/* Card Header */}
              <div className={cn(
                "px-5 py-4 flex items-center justify-between",
                getStatusColor(selectedLog.status)
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
                    <Box className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <h3 className="font-bold text-background">{selectedLog.id}</h3>
                    <p className="text-xs text-background/80">{selectedLog.zone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg bg-background/20 hover:bg-background/30 transition-colors"
                >
                  <span className="text-background text-sm">✕</span>
                </button>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Jenis Kayu</p>
                    <p className="font-semibold text-card-foreground">{selectedLog.woodType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Grade</p>
                    <p className="font-semibold text-card-foreground">{selectedLog.grade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{"Volume (m\u00B3)"}</p>
                    <p className="font-semibold text-card-foreground">{selectedLog.volume.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Jumlah (btg)</p>
                    <p className="font-semibold text-card-foreground">{selectedLog.logCount}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium text-background",
                        getStatusColor(selectedLog.status)
                      )}
                    >
                      {selectedLog.status}
                    </span>
                  </div>
                  <Button
                    onClick={() => onSelectLog(selectedLog.id)}
                    className="w-full gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    UPDATE STOK
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
