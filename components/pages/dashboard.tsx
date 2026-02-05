"use client";

import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TreePine, Package, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function Dashboard() {
  const { woodBlocks } = useApp();

  const [settings, setSettings] = useState({
    tpk_name: "TPK Cabak",
    location: "Desa Cabak, Jawa Tengah",
    capacity: "500 m³",
    total_area: "250 Hektar",
    zones: "Zona A, Zona B"
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await supabase.from('system_settings').select('*').single();
        if (data) {
          setSettings({
            tpk_name: data.tpk_name,
            location: data.location,
            capacity: data.capacity,
            total_area: data.total_area || "250 Hektar",
            zones: data.zones || "Zona A, Zona B"
          });
        }
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }
    fetchSettings();
  }, []);

  // Calculate metrics
  const totalVolume = woodBlocks.reduce((sum, block) => sum + block.volume, 0);
  const totalLogs = woodBlocks.reduce((sum, block) => sum + block.logCount, 0);
  const availableBlocks = woodBlocks.filter((b) => b.status === "Available").length;
  const soldBlocks = woodBlocks.filter((b) => b.status === "Sold").length;

  // Wood species distribution
  const speciesData = woodBlocks.reduce(
    (acc, block) => {
      const existing = acc.find((item) => item.name === block.woodType);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: block.woodType, value: 1 });
      }
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  // Sales performance
  const salesData = [
    { name: "Available", value: availableBlocks },
    { name: "Sold", value: soldBlocks },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-emerald-950 mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-600">TPK Cabak - Sistem Informasi Peta TPK</p>
      </div>

      {/* TPK Profile Card */}
      <Card className="bg-gradient-to-r from-emerald-50 to-white p-6 border-emerald-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-emerald-950 mb-4">{settings.tpk_name}</h2>
            <div className="space-y-3 text-slate-700">
              <p>
                <span className="font-semibold">Lokasi:</span> {settings.location}
              </p>
              <p>
                <span className="font-semibold">Luas Area:</span> {settings.total_area}
              </p>
              <p>
                <span className="font-semibold">Kapasitas Total:</span> {settings.capacity}
              </p>
              <p>
                <span className="font-semibold">Zona:</span> {settings.zones}
              </p>
            </div>
          </div>
          <div className="bg-emerald-950 text-white p-6 rounded-lg">
            <p className="text-sm text-emerald-200 mb-2">Informasi Lanjutan</p>
            <p className="text-2xl font-bold mb-4">Perhutani Cabak</p>
            <p className="text-emerald-200 text-sm">
              Sistem Manajemen Persediaan Kayu terpadu untuk monitoring dan kontrol stok real-time dengan teknologi GIS terkini.
            </p>
          </div>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Volume</p>
              <p className="text-3xl font-bold text-emerald-950">{totalVolume.toFixed(1)}</p>
              <p className="text-xs text-slate-500 mt-1">m³</p>
            </div>
            <TreePine className="h-12 w-12 text-emerald-100" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Logs</p>
              <p className="text-3xl font-bold text-blue-950">{totalLogs}</p>
              <p className="text-xs text-slate-500 mt-1">Batang</p>
            </div>
            <Package className="h-12 w-12 text-blue-100" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Blocks</p>
              <p className="text-3xl font-bold text-amber-950">{woodBlocks.length}</p>
              <p className="text-xs text-slate-500 mt-1">Bidang</p>
            </div>
            <Scale className="h-12 w-12 text-amber-100" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Wood Species Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-emerald-950 mb-4">Distribusi Jenis Kayu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={speciesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {speciesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-emerald-950 mb-4">Performa Penjualan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
