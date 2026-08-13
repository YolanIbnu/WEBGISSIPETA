"use client";

import { useApp } from "@/context/app-context";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar, FileSpreadsheet, FileText, CalendarDays, Filter, Lock } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function Laporan() {
  const { woodBlocks, settings, getHistory, user } = useApp();
  const isAdmin = user?.role === "admin";
  const [isExportingHistory, setIsExportingHistory] = useState(false);
  const [reportMonthFilter, setReportMonthFilter] = useState<string>("all");

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

  const getMonthLabel = (val: string) => {
    if (val === "all") return "Semua Bulan";
    return monthOptions.find(m => m.value === val)?.label || val;
  };

  const getFileSuffix = (val: string) => {
    if (val === "all") return "Lengkap";
    return monthOptions.find(m => m.value === val)?.label.replace(/ /g, "_") || val;
  };

  const handleExportExcel = () => {
    // 1. Prepare data for Excel
    const dataToExport = woodBlocks.map((block) => ({
      "ID": block.id,
      "Tanggal": block.tanggal || "-",
      "TPK / Zona": block.tpkName || block.zone,
      "Jenis Kayu": block.woodType,
      "Sortimen": block.grade,
      "Volume (m³)": block.volume,
      "Jumlah Batang": block.logCount,
      "Panjang (m)": block.panjang1 != null && block.panjang2 != null ? `${block.panjang1}-${block.panjang2}` : "-",
      "Diameter (cm)": block.diameter1 != null && block.diameter2 != null ? `${block.diameter1}-${block.diameter2}` : "-",
      "Grade": block.grade,
      "Cacat Kayu": block.cacatKayu || "-",
      "Status": block.status,
      "Tahun Produksi": block.tahunProduksi || "-",
    }));

    // 2. Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Format width
    const wscols = [
      { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
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
      const filterMonth = reportMonthFilter === "all" ? undefined : reportMonthFilter;
      const history = await getHistory(filterMonth);

      if (history.length === 0) {
        alert(filterMonth
          ? `Tidak ada data riwayat di bulan ${getMonthLabel(reportMonthFilter)}. Coba pilih bulan lain.`
          : "Belum ada data riwayat yang tersimpan. Lakukan update data stok terlebih dahulu."
        );
        return;
      }

      const dataToExport = history.map((h) => ({
        "ID Blok": h.id,
        "Tanggal Record": h.tanggal,
        "TPK / Zona": h.tpkName || h.zone,
        "Jenis Kayu": h.woodType,
        "Sortimen": h.grade,
        "Volume (m³)": h.volume,
        "Batang": h.logCount,
        "Panjang (m)": h.panjang1 != null && h.panjang2 != null ? `${h.panjang1}-${h.panjang2}` : "-",
        "Diameter (cm)": h.diameter1 != null && h.diameter2 != null ? `${h.diameter1}-${h.diameter2}` : "-",
        "Grade": h.grade,
        "Cacat Kayu": h.cacatKayu || "-",
        "Status": h.status,
        "Tahun Produksi": h.tahunProduksi || "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      worksheet['!cols'] = [
        { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
      ];

      const workbook = XLSX.utils.book_new();
      const sheetName = filterMonth ? `Riwayat ${getMonthLabel(reportMonthFilter)}` : "Riwayat Stok";
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
      saveAs(data, `Riwayat_Stok_${getFileSuffix(reportMonthFilter)}_${new Date().toISOString().split("T")[0]}.xlsx`);
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
      block.grade,
      block.volume.toFixed(1),
      block.logCount.toString(),
      block.grade,
      block.cacatKayu || "-",
      block.status,
      block.tahunProduksi?.toString() || "-",
    ]);

    autoTable(doc, {
      head: [["ID", "Tanggal", "TPK / Zona", "Jenis", "Sortimen", "Volume", "Batang", "Grade", "Cacat", "Status", "Thn"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [5, 89, 65] },
    });

    doc.save(`Laporan_Stok_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleExportHistoryPDF = async () => {
    setIsExportingHistory(true);
    try {
      const filterMonth = reportMonthFilter === "all" ? undefined : reportMonthFilter;
      const history = await getHistory(filterMonth);

      if (history.length === 0) {
        alert(filterMonth
          ? `Tidak ada data riwayat di bulan ${getMonthLabel(reportMonthFilter)}.`
          : "Belum ada data riwayat yang tersimpan."
        );
        return;
      }

      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text("Laporan Riwayat Stok Kayu", 14, 20);
      doc.setFontSize(11);
      doc.text(`${settings.tpk_name || "SIPETA"}`, 14, 28);
      const periodText = filterMonth
        ? `Periode: ${getMonthLabel(reportMonthFilter)}`
        : `Tanggal: ${new Date().toLocaleDateString("id-ID")}`;
      doc.text(periodText, 14, 34);

      // Table data
      const tableData = history.map((h) => [
        h.id || "-",
        h.tanggal || "-",
        h.tpkName || h.zone || "-",
        h.woodType || "-",
        h.grade || "-",
        h.volume.toFixed(1),
        h.logCount.toString(),
        h.grade || "-",
        h.cacatKayu || "-",
        h.status || "-",
        h.tahunProduksi?.toString() || "-",
      ]);

      autoTable(doc, {
        head: [["ID", "Tanggal", "TPK / Zona", "Jenis", "Sortimen", "Volume", "Batang", "Grade", "Cacat", "Status", "Thn"]],
        body: tableData,
        startY: 40,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 58, 138] },
      });

      doc.save(`Riwayat_Stok_${getFileSuffix(reportMonthFilter)}_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Export history PDF failed:", err);
    } finally {
      setIsExportingHistory(false);
    }
  };

  const totalVolume = woodBlocks.reduce((sum, b) => sum + b.volume, 0);
  const totalLogs = woodBlocks.reduce((sum, b) => sum + b.logCount, 0);
  const haraCount = woodBlocks.filter((b) => b.status?.includes("HARA")).length;
  const lokalCount = woodBlocks.filter((b) => b.status?.includes("LOKAL")).length;
  const industriCount = woodBlocks.filter((b) => b.status?.includes("INDUSTRI")).length;
  const vinirCount = woodBlocks.filter((b) => b.status?.includes("VINIR")).length;

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Volume</p>
            <p className="text-2xl font-bold text-emerald-950">{totalVolume.toFixed(1)} m³</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Batang</p>
            <p className="text-2xl font-bold text-blue-950">{totalLogs}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">HARA</p>
            <p className="text-2xl font-bold text-amber-600">{haraCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">LOKAL</p>
            <p className="text-2xl font-bold text-green-600">{lokalCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">INDUSTRI</p>
            <p className="text-2xl font-bold text-blue-600">{industriCount}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">VINIR</p>
            <p className="text-2xl font-bold text-purple-600">{vinirCount}</p>
          </div>
        </div>
      </Card>

      {/* Staff Role Restriction Notice */}
      {!isAdmin && (
        <Card className="p-4 bg-amber-50 border-2 border-amber-300 flex items-center gap-3">
          <Lock className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Akses Export Dibatasi</p>
            <p className="text-xs text-amber-700">Anda login sebagai <strong>Staff</strong>. Hanya Admin yang dapat mengunduh laporan dalam format PDF dan Excel. Hubungi administrator untuk mendapatkan akses export.</p>
          </div>
        </Card>
      )}

      {/* Export Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Excel Export */}
        <Card className={`p-6 border-2 border-emerald-200 transition-shadow ${isAdmin ? 'hover:shadow-lg' : 'opacity-60 cursor-not-allowed'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-emerald-950 mb-1">Export Stok Saat Ini</h3>
              <p className="text-sm text-slate-600">
                Unduh status persediaan terbaru dalam format Excel atau PDF
              </p>
            </div>
            {isAdmin ? (
              <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
            ) : (
              <Lock className="h-8 w-8 text-slate-400" />
            )}
          </div>
          <div className="space-y-2">
            <Button
              onClick={handleExportExcel}
              disabled={!isAdmin}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isAdmin && <Lock className="h-4 w-4 mr-2" />}
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download Excel (.xlsx)
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={!isAdmin}
              variant="outline"
              className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isAdmin && <Lock className="h-4 w-4 mr-2" />}
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          {!isAdmin && (
            <p className="text-xs text-red-500 mt-2 text-center font-medium">🔒 Hanya Admin yang bisa export</p>
          )}
        </Card>

        {/* Historical Export */}
        <Card className={`p-6 border-2 border-blue-200 transition-shadow ${isAdmin ? 'hover:shadow-lg' : 'opacity-60 cursor-not-allowed'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-950 mb-1">Riwayat Perubahan (History)</h3>
              <p className="text-sm text-slate-600">
                Laporan catatan perubahan stok dari waktu ke waktu
              </p>
            </div>
            {isAdmin ? (
              <Calendar className="h-8 w-8 text-blue-600" />
            ) : (
              <Lock className="h-8 w-8 text-slate-400" />
            )}
          </div>

          {/* Month Filter for Report */}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Filter Periode Laporan:</label>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={reportMonthFilter}
                onChange={(e) => setReportMonthFilter(e.target.value)}
                disabled={!isAdmin}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">📅 Semua Bulan (Lengkap)</option>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {reportMonthFilter !== "all" && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium">
                  Laporan untuk: {getMonthLabel(reportMonthFilter)}
                </span>
                <button
                  onClick={() => setReportMonthFilter("all")}
                  className="text-xs text-red-500 hover:text-red-700 underline ml-1"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleExportHistory}
              disabled={isExportingHistory || !isAdmin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isAdmin && <Lock className="h-4 w-4 mr-2" />}
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {isExportingHistory ? "Memproses..." : `Download Excel${reportMonthFilter !== "all" ? " (" + getMonthLabel(reportMonthFilter) + ")" : ""}`}
            </Button>
            <Button
              onClick={handleExportHistoryPDF}
              disabled={isExportingHistory || !isAdmin}
              variant="outline"
              className="w-full border-blue-600 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isAdmin && <Lock className="h-4 w-4 mr-2" />}
              <FileText className="h-4 w-4 mr-2" />
              {isExportingHistory ? "Memproses..." : `Download PDF${reportMonthFilter !== "all" ? " (" + getMonthLabel(reportMonthFilter) + ")" : ""}`}
            </Button>
          </div>
          {!isAdmin ? (
            <p className="text-xs text-red-500 mt-2 text-center font-medium">🔒 Hanya Admin yang bisa export</p>
          ) : (
            <p className="text-xs text-slate-500 mt-2 text-center">
              {isExportingHistory ? "Mengambil data dari database..." : "Pilih bulan di atas untuk cetak laporan per bulan."}
            </p>
          )}
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
