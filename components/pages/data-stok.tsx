"use client";

import { useState, useEffect } from "react";
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
import { Search, Edit2 } from "lucide-react";
import { EditModal } from "@/components/edit-modal";

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

  const filteredBlocks = woodBlocks.filter((block) => {
    const matchesSearch = block.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.woodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (block.tpkName && block.tpkName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || block.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    const data = await getHistory();
    setHistoryData(data);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

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

  // Note: Since I changed fetchStokHistory to order by id DESC, 
  // the initial data is already sorted DESC.
  // The client side sort here provides the toggle functionality.

  // Calculate totals for filtered results
  const totalVolume = filteredBlocks.reduce((sum, b) => sum + b.volume, 0);
  const totalLogs = filteredBlocks.reduce((sum, b) => sum + b.logCount, 0);
  const occupancyRate = ((totalVolume / 500) * 100).toFixed(1); // 500 = total capacity

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-emerald-950 mb-1 sm:mb-2">Data Stok</h1>
          <p className="text-sm sm:text-base text-slate-600">Manajemen inventaris dan riwayat perubahan kayu</p>
        </div>
      </div>

      {/* Tabs Switcher */}
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

      {activeTab === "current" ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-emerald-600">
              <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Total Volume</p>
              <p className="text-lg sm:text-2xl font-bold text-emerald-950">{totalVolume.toFixed(1)} m³</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-blue-600">
              <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Total Logs</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-950">{totalLogs} pcs</p>
            </Card>
            <Card className="p-3 sm:p-4 bg-white border-l-4 border-l-amber-600 col-span-2 md:col-span-1">
              <p className="text-[10px] sm:text-xs text-slate-600 mb-0.5 sm:mb-1">Occupancy Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-amber-950">{occupancyRate}%</p>
            </Card>
          </div>

          {/* Filters */}
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

          {/* Current Data Table */}
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
                    <TableRow
                      key={block.id}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      ) : (
        /* History Log Table */
        <Card className="bg-white overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <p className="text-sm text-slate-600">Catatan setiap perubahan data (paling baru di atas)</p>
            <Button size="sm" variant="outline" onClick={fetchHistory} disabled={isLoadingHistory}>
              {isLoadingHistory ? "Memuat..." : "Refresh Riwayat"}
            </Button>
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
                    <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
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
