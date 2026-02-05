"use client";

import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function Laporan() {
  const { woodBlocks, settings } = useApp();

  const handleExportExcel = () => {
    // 1. Prepare data for Excel
    const dataToExport = woodBlocks.map((block) => ({
      "ID": block.id,
      "Tanggal": block.tanggal || "-",
      "Zona": block.zone,
      "Jenis Kayu": block.woodType,
      "Volume (m³)": block.volume,
      "Jumlah Batang": block.logCount,
      "Grade": block.grade,
      "Status": block.status,
    }));

    // 2. Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Format width (Optional but good for "rapih")
    const wscols = [
      { wch: 10 }, // ID
      { wch: 15 }, // Tanggal
      { wch: 20 }, // Zona
      { wch: 15 }, // Jenis Kayu
      { wch: 12 }, // Volume
      { wch: 15 }, // Jumlah Batang
      { wch: 10 }, // Grade
      { wch: 10 }, // Status
    ];
    worksheet['!cols'] = wscols;

    // 4. Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Stok");

    // 5. Generate Buffer and Download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });

    saveAs(data, `Laporan_Stok_TPK_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const totalVolume = woodBlocks.reduce((sum, b) => sum + b.volume, 0);
  const totalLogs = woodBlocks.reduce((sum, b) => sum + b.logCount, 0);
  const availableCount = woodBlocks.filter((b) => b.status === "Available").length;
  const soldCount = woodBlocks.filter((b) => b.status === "Sold").length;

  // Extract numeric capacity for percentage calculation (e.g., "750 m3" -> 750)
  const capacityValue = parseFloat(settings.capacity) || 500;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-emerald-950 mb-2">Laporan</h1>
        <p className="text-slate-600">Export dan kelola laporan persediaan kayu</p>
      </div>

      {/* Report Summary */}
      <Card className="bg-gradient-to-r from-emerald-50 to-white p-6 border-emerald-200">
        <h2 className="text-2xl font-bold text-emerald-950 mb-4">Ringkasan Laporan</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Volume</p>
            <p className="text-2xl font-bold text-emerald-950">{totalVolume.toFixed(1)} m³</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Batang</p>
            <p className="text-2xl font-bold text-blue-950">{totalLogs}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Tersedia</p>
            <p className="text-2xl font-bold text-green-950">{availableCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Terjual</p>
            <p className="text-2xl font-bold text-red-950">{soldCount}</p>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Excel Export */}
        <Card className="p-6 border-2 border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-emerald-950 mb-1">Export to Excel</h3>
              <p className="text-sm text-slate-600">
                Unduh data dalam format Excel (.xlsx) yang rapih
              </p>
            </div>
            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
          </div>
          <Button
            onClick={handleExportExcel}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
        </Card>

        {/* Monthly Report */}
        <Card className="p-6 border-2 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-950 mb-1">Laporan Bulanan</h3>
              <p className="text-sm text-slate-600">
                Laporan persediaan bulan ini ({new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long" })})
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled>
            <Calendar className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Fitur ini akan segera tersedia
          </p>
        </Card>
      </div>

      {/* Report Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-emerald-950 mb-4">Detail Laporan</h3>
        <div className="space-y-3 text-slate-700">
          <div className="flex justify-between pb-2 border-b">
            <span>Tanggal Laporan:</span>
            <span className="font-semibold">{new Date().toLocaleDateString("id-ID")}</span>
          </div>
          <div className="flex justify-between pb-2 border-b">
            <span>Total Bidang:</span>
            <span className="font-semibold">{woodBlocks.length}</span>
          </div>
          <div className="flex justify-between pb-2 border-b">
            <span>Kapasitas Total:</span>
            <span className="font-semibold">{settings.capacity}</span>
          </div>
          <div className="flex justify-between pb-2 border-b">
            <span>Penggunaan Kapasitas:</span>
            <span className="font-semibold">{((totalVolume / capacityValue) * 100).toFixed(1)}%</span>
          </div>

          <div className="flex justify-between">
            <span>Status Sistem:</span>
            <span className="font-semibold text-green-600">Online</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
