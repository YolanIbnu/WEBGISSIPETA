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
import { STATUS_OPTIONS, CACAT_KAYU_OPTIONS, WOOD_TYPES, SORTIMEN_GRADE_OPTIONS } from "@/lib/geojson-data";

interface DataStokProps {
  onEditBlock: (id: string) => void;
}

// Helper: status badge color
function getStatusBadgeClass(status: string) {
  switch (status) {
    case "HARA": return "bg-amber-100 text-amber-800 border-none";
    case "LOKAL": return "bg-green-100 text-green-800 border-none";
    case "INDUSTRI": return "bg-blue-100 text-blue-800 border-none";
    case "VINIR": return "bg-purple-100 text-purple-800 border-none";
    default: return "bg-slate-100 text-slate-800 border-none";
  }
}

export function DataStok({ onEditBlock }: DataStokProps) {
  const { woodBlocks, getHistory } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cacatKayuFilter, setCacatKayuFilter] = useState<string>("all");
  const [jenisKayuFilter, setJenisKayuFilter] = useState<string>("all");
  const [sortimenFilter, setSortimenFilter] = useState<string>("all");
  const [tahunProduksiFilter, setTahunProduksiFilter] = useState<string>("all");
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
    const matchesStatus = statusFilter === "all" || (block.status && block.status.includes(statusFilter));
    const matchesCacatKayu = cacatKayuFilter === "all" || (block.cacatKayu && block.cacatKayu.includes(cacatKayuFilter));
    const matchesJenisKayu = jenisKayuFilter === "all" || block.woodType === jenisKayuFilter;
    const matchesSortimen = sortimenFilter === "all" || (block.grade && block.grade.includes(sortimenFilter));
    const matchesTahun = tahunProduksiFilter === "all" || (block.tahunProduksi && block.tahunProduksi.toString() === tahunProduksiFilter);
    return matchesSearch && matchesStatus && matchesCacatKayu && matchesJenisKayu && matchesSortimen && matchesTahun;
  });

  const availableTahun = useMemo(() => {
    const years = woodBlocks.map(b => b.tahunProduksi).filter(Boolean) as number[];
    return Array.from(new Set(years)).sort((a, b) => b - a); // descending
  }, [woodBlocks]);

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

  // Helper: format panjang
  const formatPanjang = (p1?: number, p2?: number) => {
    if (p1 == null && p2 == null) return "-";
    return `${p1 ?? "-"} — ${p2 ?? "-"}`;
  };

  // Helper: format diameter
  const formatDiameter = (d1?: number, d2?: number) => {
    if (d1 == null && d2 == null) return "-";
    return `${d1 ?? "-"} — ${d2 ?? "-"}`;
  };

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
              <div className="flex flex-col gap-3">
                {/* Search bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-slate-400" />
                  <input
                    placeholder="Cari ID, jenis, atau zona..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-slate-50 border rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Status filter */}
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="bg-slate-50 h-9 sm:h-10">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Jenis Kayu filter */}
                  <Select value={jenisKayuFilter} onValueChange={(value: any) => setJenisKayuFilter(value)}>
                    <SelectTrigger className="bg-slate-50 h-9 sm:h-10">
                      <SelectValue placeholder="Pilih Jenis Kayu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sem. Jenis Kayu</SelectItem>
                      {WOOD_TYPES.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sortimen filter */}
                  <Select value={sortimenFilter} onValueChange={(value: any) => setSortimenFilter(value)}>
                    <SelectTrigger className="bg-slate-50 h-9 sm:h-10">
                      <SelectValue placeholder="Pilih Sortimen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Sortimen</SelectItem>
                      {SORTIMEN_GRADE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Cacat Kayu filter */}
                  <Select value={cacatKayuFilter} onValueChange={(value: any) => setCacatKayuFilter(value)}>
                    <SelectTrigger className="bg-slate-50 h-9 sm:h-10">
                      <SelectValue placeholder="Pilih Cacat Kayu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sem. Cacat Kayu</SelectItem>
                      {CACAT_KAYU_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tahun Produksi filter */}
                  <Select value={tahunProduksiFilter} onValueChange={(value: any) => setTahunProduksiFilter(value)}>
                    <SelectTrigger className="bg-slate-50 h-9 sm:h-10">
                      <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      {availableTahun.map((t) => (
                        <SelectItem key={t} value={t.toString()}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      <TableHead className="text-white text-right">Jml Batang</TableHead>
                      <TableHead className="text-white">Panjang (m)</TableHead>
                      <TableHead className="text-white">Diameter (cm)</TableHead>
                      <TableHead className="text-white">Sortimen</TableHead>
                      <TableHead className="text-white">Cacat Kayu</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Thn Produksi</TableHead>
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
                        <TableCell className="text-slate-700 whitespace-nowrap">{formatPanjang(block.panjang1, block.panjang2)}</TableCell>
                        <TableCell className="text-slate-700 whitespace-nowrap">{formatDiameter(block.diameter1, block.diameter2)}</TableCell>
                        <TableCell className="text-slate-700">{block.grade}</TableCell>
                        <TableCell className="text-slate-700">{block.cacatKayu || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(block.status || "").split(", ").map((statusStr) => (
                              <Badge key={statusStr} className={getStatusBadgeClass(statusStr)}>
                                {statusStr}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700">{block.tahunProduksi || "-"}</TableCell>
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
                    <TableHead className="text-white">Sortimen</TableHead>
                    <TableHead className="text-white text-right">Volume (m³)</TableHead>
                    <TableHead className="text-white text-right">Jml Batang</TableHead>
                    <TableHead className="text-white">Panjang (m)</TableHead>
                    <TableHead className="text-white">Diameter (cm)</TableHead>
                    <TableHead className="text-white">Cacat Kayu</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Jenis</TableHead>
                    <TableHead className="text-white">Thn Produksi</TableHead>
                    <TableHead className="text-white">TPK / Zone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingHistory ? (
                    <TableRow>
                      <TableCell colSpan={12} className="h-32 text-center text-slate-500">
                        Mengambil data riwayat...
                      </TableCell>
                    </TableRow>
                  ) : historyData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="h-32 text-center text-slate-500">
                        Belum ada riwayat perubahan yang tercatat.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedHistory.map((record, index) => (
                      <AnimatedTableRow key={index} index={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <TableCell className="font-semibold text-blue-900">{record.id}</TableCell>
                        <TableCell className="text-slate-700">{record.tanggal}</TableCell>
                        <TableCell className="text-slate-700">{record.grade}</TableCell>
                        <TableCell className="text-right text-slate-700">{record.volume.toFixed(1)}</TableCell>
                        <TableCell className="text-right text-slate-700 font-medium">{record.logCount}</TableCell>
                        <TableCell className="text-slate-700 whitespace-nowrap">{formatPanjang(record.panjang1, record.panjang2)}</TableCell>
                        <TableCell className="text-slate-700 whitespace-nowrap">{formatDiameter(record.diameter1, record.diameter2)}</TableCell>
                        <TableCell className="text-slate-700">{record.cacatKayu || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(record.status || "").split(", ").map((statusStr) => (
                              <Badge key={statusStr} className={getStatusBadgeClass(statusStr)}>
                                {statusStr}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{record.woodType}</TableCell>
                        <TableCell className="text-slate-700">{record.tahunProduksi || "-"}</TableCell>
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
