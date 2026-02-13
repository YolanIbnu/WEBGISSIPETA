"use client";

import { useApp } from "@/context/app-context";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Laporan() {
  const { woodBlocks, settings, getHistory } = useApp();
  const [isExportingHistory, setIsExportingHistory] = useState(false);

  const handleExportExcel = () => {
    // 1. Prepare data for Excel
    const dataToExport = woodBlocks.map((block) => ({
      "ID": block.id,
      "Tanggal": block.tanggal || "-",
      "TPK / Zona": block.tpkName || block.zone,
      "Jenis Kayu": block.woodType,
      "Volume (m³)": block.volume,
      "Jumlah Batang": block.logCount,
      "Grade": block.grade,
      "Status": block.status,
    }));

    // 2. Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Format width
    const wscols = [
      { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Stok Saat Ini");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(data, `Laporan_Stok_Sekarang_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleExportHistory = async () => {
    setIsExportingHistory(true);
    try {
      const history = await getHistory();

      if (history.length === 0) {
        alert("Belum ada data riwayat yang tersimpan. Lakukan update data stok terlebih dahulu.");
        return;
      }

      const dataToExport = history.map((h) => ({
        "ID Blok": h.id,
        "Tanggal Record": h.tanggal,
        "TPK / Zona": h.tpkName || h.zone,
        "Jenis Kayu": h.woodType,
        "Volume (m³)": h.volume,
        "Batang": h.logCount,
        "Grade": h.grade,
        "Status": h.status
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      worksheet['!cols'] = [
        { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Stok");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
      saveAs(data, `Riwayat_Stok_Lengkap_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (err) {
      console.error("Export history failed:", err);
    } finally {
      setIsExportingHistory(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Laporan Stok Kayu - Saat Ini", 14, 20);
    doc.setFontSize(11);
    doc.text(`${settings.tpk_name || "SIPETA"}`, 14, 28);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 34);

    // Table data
    const tableData = woodBlocks.map((block) => [
      block.id,
      block.tanggal || "-",
      block.tpkName || block.zone || "-",
      block.woodType,
      block.volume.toFixed(1),
      block.logCount.toString(),
      block.grade,
      block.status
    ]);

    autoTable(doc, {
      head: [["ID", "Tanggal", "TPK / Zona", "Jenis", "Volume (m³)", "Batang", "Grade", "Status"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [5, 89, 65] },
    });

    doc.save(`Laporan_Stok_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleExportHistoryPDF = async () => {
    setIsExportingHistory(true);
    try {
      const history = await getHistory();

      if (history.length === 0) {
        alert("Belum ada data riwayat yang tersimpan.");
        return;
      }

      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text("Laporan Riwayat Stok Kayu", 14, 20);
      doc.setFontSize(11);
      doc.text(`${settings.tpk_name || "SIPETA"}`, 14, 28);
      doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 34);

      // Table data
      const tableData = history.map((h) => [
        h.id || "-",
        h.tanggal || "-",
        h.tpkName || h.zone || "-",
        h.woodType || "-",
        h.volume.toFixed(1),
        h.logCount.toString(),
        h.grade || "-",
        h.status || "-"
      ]);

      autoTable(doc, {
        head: [["ID", "Tanggal", "TPK / Zona", "Jenis", "Volume (m³)", "Batang", "Grade", "Status"]],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 58, 138] },
      });

      doc.save(`Riwayat_Stok_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Export history PDF failed:", err);
    } finally {
      setIsExportingHistory(false);
    }
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
              <h3 className="text-lg font-semibold text-emerald-950 mb-1">Export Stok Saat Ini</h3>
              <p className="text-sm text-slate-600">
                Unduh status persediaan terbaru dalam format Excel atau PDF
              </p>
            </div>
            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleExportExcel}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download Excel (.xlsx)
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </Card>

        {/* Historical Export */}
        <Card className="p-6 border-2 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-950 mb-1">Riwayat Perubahan (History)</h3>
              <p className="text-sm text-slate-600">
                Laporan catatan perubahan stok dari waktu ke waktu
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleExportHistory}
              disabled={isExportingHistory}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {isExportingHistory ? "Memproses..." : "Download Excel (.xlsx)"}
            </Button>
            <Button
              onClick={handleExportHistoryPDF}
              disabled={isExportingHistory}
              variant="outline"
              className="w-full border-blue-600 text-blue-700 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExportingHistory ? "Memproses..." : "Download PDF"}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {isExportingHistory ? "Mengambil data dari database..." : "Data riwayat akan diakumulasi setiap kali ada update."}
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
