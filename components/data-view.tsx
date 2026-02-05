"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Pencil,
  Package,
  TreePine,
  TrendingUp,
  Filter,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/context/inventory-context";
import type { LogStatus } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface DataViewProps {
  onSelectLog: (id: string) => void;
}

function getStatusColor(status: LogStatus) {
  switch (status) {
    case "Available":
      return "bg-available/10 text-available";
    case "Sold":
      return "bg-sold/10 text-sold";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function DataView({ onSelectLog }: DataViewProps) {
  const { logs, getTotalVolume, getTotalLogCount, getAvailableRate, isLoading } =
    useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || log.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, statusFilter]);

  const totalVolume = getTotalVolume();
  const totalLogs = getTotalLogCount();
  const availableRate = getAvailableRate();

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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <h1 className="text-2xl font-bold text-card-foreground">
          Manajemen Data Stok Kayu
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola dan pantau inventaris kayu TPK
        </p>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-5 border border-border shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold text-card-foreground">
                {totalVolume.toFixed(1)} m&sup3;
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-5 border border-border shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-available/10 flex items-center justify-center">
              <TreePine className="w-6 h-6 text-available" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Batang</p>
              <p className="text-2xl font-bold text-card-foreground">
                {totalLogs.toLocaleString()} btg
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-5 border border-border shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Rate</p>
              <p className="text-2xl font-bold text-card-foreground">
                {availableRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="px-6 pb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Jenis Kayu
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {"Volume (m\u00B3)"}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Log Count (btg)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                      index % 2 === 0 ? "bg-card" : "bg-muted/20"
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-card-foreground">
                      {log.id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.zone}
                    </td>
                    <td className="px-4 py-3 text-card-foreground">
                      {log.woodType}
                    </td>
                    <td className="px-4 py-3 text-card-foreground">
                      {log.volume.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-card-foreground">
                      {log.logCount}
                    </td>
                    <td className="px-4 py-3 text-card-foreground">
                      {log.grade}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium",
                          getStatusColor(log.status)
                        )}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectLog(log.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="sr-only">Edit {log.id}</span>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">
                Tidak ada data yang ditemukan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
