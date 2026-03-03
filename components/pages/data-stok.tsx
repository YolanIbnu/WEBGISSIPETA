"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/context/app-context";
import { LogItem } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Edit2, CalendarDays, Filter } from "lucide-react";
import { EditModal } from "@/components/edit-modal";
import { AnimatedSection, AnimatedNumber, AnimatedTableRow } from "@/components/ui/animations";

interface DataStokProps {
  onEditBlock: (id: string) => void;
}

export function DataStok({ onEditBlock }: DataStokProps) {
  const { woodBlocks, getHistory } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Available" | "Sold">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [historyData, setHistoryData] = useState<LogItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySortOrder, setHistorySortOrder] = useState<"desc" | "asc">("desc");
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>("all");

  // Generate daftar bulan (12 bulan terakhir)
  const monthOptions = useMemo(() => {
    const months: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
      months.push({ value, label });
    }
    return months;
  }, []);

  const filteredBlocks = woodBlocks.filter((block) => {
    const matchesSearch = block.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.woodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (block.tpkName && block.tpkName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || block.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchHistory = async (month?: string) => {
    setIsLoadingHistory(true);
    const filterMonth = month !== undefined ? month : historyMonthFilter;
    const data = await getHistory(filterMonth === "all" ? undefined : filterMonth);
    setHistoryData(data);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory(historyMonthFilter);
    }
  }, [activeTab, historyMonthFilter]);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const sortedHistory = [...historyData].sort((a, b) => {
    const idA = a.id_history || 0;
    const idB = b.id_history || 0;
    const dateA = a.tanggal || "";
    const dateB = b.tanggal || "";

    if (historySortOrder === "desc") {
      return idB - idA || dateB.localeCompare(dateA);
    } else {
      return idA - idB || dateA.localeCompare(dateB);
    }
  });

  // Calculate totals for filtered results
  const totalVolume = filteredBlocks.reduce((sum, b) => sum + b.volume, 0);
  const totalLogs = filteredBlocks.reduce((sum, b) => sum + b.logCount, 0);
  const occupancyRate = parseFloat(((totalVolume / 500) * 100).toFixed(1)); // 500 = total capacity

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-emerald-950 mb-1 sm:mb-2">Data Stok</h1>
            <p className="text-sm sm:text-base text-slate-600">Manajemen inventaris dan riwayat perubahan kayu</p>
          </div>
        </div>
      </AnimatedSection>

      {/* Tabs Switcher */}
      <AnimatedSection delay={100}>
        <div className="flex p-1 bg-slate-200 rounded-lg w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("current")}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "current"
              ? "bg-white text-emerald-950 shadow-sm"
              : "text-slate-600 hover:text-emerald-900"
              }`}
          >
            Stok Saat Ini
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "history"
              ? "bg-white text-emerald-950 shadow-sm"
              : "text-slate-600 hover:text-emerald-900"
              }`}
          >
            Riwayat Update
          </button>
        </div>
      </AnimatedSection>

      {activeTab === "current" ? (
        <>
          {/* Stats Cards with count-up animation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <AnimatedSection delay={200}>
              <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-emerald-600 hover:shadow-lg transition-shadow duration-300">
                <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Total Volume</p>
                <p className="text-lg sm:text-2xl font-bold text-emerald-950">
                  <AnimatedNumber value={totalVolume} decimals={1} delay={400} className="" /> m³
                </p>
              </Card>
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow duration-300">
                <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Total Logs</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-950">
                  <AnimatedNumber value={totalLogs} delay={500} className="" /> pcs
                </p>
              </Card>
            </AnimatedSection>
            <AnimatedSection delay={400}>
              <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-amber-600 col-span-2 md:col-span-1 hover:shadow-lg transition-shadow duration-300">
                <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Occupancy Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-amber-950">
                  <AnimatedNumber value={occupancyRate} decimals={1} delay={600} className="" />%
                </p>
              </Card>
            </AnimatedSection>
          </div>

          {/* Filters */}
          <AnimatedSection delay={500}>
            <Card className="p-4 sm:p-6 bg-white">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-slate-400" />
                  <input
                    placeholder="Cari ID, jenis, atau zona..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-slate-50 border rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full sm:w-48 bg-slate-50 h-9 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </AnimatedSection>

          {/* Current Data Table */}
          <AnimatedSection delay={650}>
            <Card className="bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-emerald-950">
                    <TableRow className="border-0 hover:bg-emerald-950">
                      <TableHead className="text-white">ID</TableHead>
                      <TableHead className="text-white">Terakhir Update</TableHead>
                      <TableHead className="text-white">TPK / Zona</TableHead>
                      <TableHead className="text-white">Jenis Kayu</TableHead>
                      <TableHead className="text-white text-right">Volume (m³)</TableHead>
                      <TableHead className="text-white text-right">Jumlah Batang</TableHead>
                      <TableHead className="text-white">Grade</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlocks.map((block, index) => (
                      <AnimatedTableRow
                        key={block.id}
                        index={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                      >
                        <TableCell className="font-semibold text-emerald-950">{block.id}</TableCell>
                        <TableCell className="text-slate-700">{block.tanggal || "-"}</TableCell>
                        <TableCell className="text-slate-700 font-medium">{block.tpkName || block.zone}</TableCell>
                        <TableCell className="text-slate-700">{block.woodType}</TableCell>
                        <TableCell className="text-right text-slate-700">{block.volume.toFixed(1)}</TableCell>
                        <TableCell className="text-right text-slate-700">{block.logCount}</TableCell>
                        <TableCell className="text-slate-700">{block.grade}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              block.status === "Available"
                                ? "bg-green-100 text-green-800 border-none"
                                : "bg-red-100 text-red-800 border-none"
                            }
                          >
                            {block.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(block.id)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </AnimatedTableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </AnimatedSection>
        </>
      ) : (
        /* History Log Table */
        <AnimatedSection delay={200}>
          <Card className="bg-white overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <p className="text-sm text-slate-600">Catatan setiap perubahan data (paling baru di atas)</p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Filter Bulan */}
                  <div className="relative flex-1 sm:flex-none">
                    <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      value={historyMonthFilter}
                      onChange={(e) => setHistoryMonthFilter(e.target.value)}
                      className="w-full sm:w-52 pl-8 pr-3 py-2 bg-white border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="all">📅 Semua Bulan</option>
                      {monthOptions.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => fetchHistory()} disabled={isLoadingHistory}>
                    {isLoadingHistory ? "Memuat..." : "Refresh"}
                  </Button>
                </div>
              </div>
              {historyMonthFilter !== "all" && (
                <div className="mt-2 flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">
                    Filter aktif: {monthOptions.find(m => m.value === historyMonthFilter)?.label || historyMonthFilter}
                  </span>
                  <button
                    onClick={() => setHistoryMonthFilter("all")}
                    className="text-xs text-red-500 hover:text-red-700 underline ml-1"
                  >
                    Hapus filter
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-blue-950">
                  <TableRow className="border-0 hover:bg-blue-950">
                    <TableHead className="text-white">ID Blok</TableHead>
                    <TableHead
                      className="text-white cursor-pointer hover:bg-blue-900 transition-colors"
                      onClick={() => setHistorySortOrder(prev => prev === "desc" ? "asc" : "desc")}
                    >
                      <div className="flex items-center gap-2">
                        Tanggal Record
                        <span className="text-[10px] opacity-70">
                          {historySortOrder === "desc" ? "▼ (Terbaru)" : "▲ (Terlama)"}
                        </span>
                      </div>
                    </TableHead>
                    <TableHead className="text-white text-right">Volume (m³)</TableHead>
                    <TableHead className="text-white text-right">Jumlah Batang</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Jenis</TableHead>
                    <TableHead className="text-white">TPK / Zone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingHistory ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        Mengambil data riwayat...
                      </TableCell>
                    </TableRow>
                  ) : historyData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                        Belum ada riwayat perubahan yang tercatat.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedHistory.map((record, index) => (
                      <AnimatedTableRow key={index} index={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <TableCell className="font-semibold text-blue-900">{record.id}</TableCell>
                        <TableCell className="text-slate-700">{record.tanggal}</TableCell>
                        <TableCell className="text-right text-slate-700">{record.volume.toFixed(1)}</TableCell>
                        <TableCell className="text-right text-slate-700 font-medium">{record.logCount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              record.status === "Available"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{record.woodType}</TableCell>
                        <TableCell className="text-slate-600">{record.tpkName || record.zone}</TableCell>
                      </AnimatedTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </AnimatedSection>
      )}

      {/* Edit Modal */}
      <EditModal
        blockId={editingId}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}

