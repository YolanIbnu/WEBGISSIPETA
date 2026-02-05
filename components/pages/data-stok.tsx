"use client";

import { useState } from "react";
import { useApp } from "@/context/app-context";
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
  const { woodBlocks } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Available" | "Sold">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredBlocks = woodBlocks.filter((block) => {
    const matchesSearch = block.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.woodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || block.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  // Calculate totals for filtered results
  const totalVolume = filteredBlocks.reduce((sum, b) => sum + b.volume, 0);
  const totalLogs = filteredBlocks.reduce((sum, b) => sum + b.logCount, 0);
  const occupancyRate = ((totalVolume / 500) * 100).toFixed(1); // 500 = total capacity

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-emerald-950 mb-1 sm:mb-2">Data Stok</h1>
        <p className="text-sm sm:text-base text-slate-600">Tabel lengkap inventaris kayu TPK Cabak</p>
      </div>

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
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-slate-400" />
            <input
              placeholder="Cari ID, jenis, atau zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-slate-50 border rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
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

      {/* Data Table */}
      <Card className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-emerald-950">
              <TableRow className="border-0">
                <TableHead className="text-white">ID</TableHead>
                <TableHead className="text-white">Tanggal</TableHead>
                <TableHead className="text-white">Zona</TableHead>
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
                  <TableCell className="text-slate-700">{block.zone}</TableCell>
                  <TableCell className="text-slate-700">{block.woodType}</TableCell>
                  <TableCell className="text-right text-slate-700">{block.volume.toFixed(1)}</TableCell>
                  <TableCell className="text-right text-slate-700">{block.logCount}</TableCell>
                  <TableCell className="text-slate-700">{block.grade}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        block.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
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

      {/* Edit Modal */}
      <EditModal
        blockId={editingId}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}
