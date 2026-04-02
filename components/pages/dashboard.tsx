"use client";

import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TreePine, Package, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AnimatedNumber, AnimatedSection } from "@/components/ui/animations";

export function Dashboard() {
  const { woodBlocks, settings, isLoading, refreshData } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);

  // Delay chart animation slightly so it feels sequential
  useEffect(() => {
    if (!isLoading) {
      const timeout = setTimeout(() => setChartsReady(true), 600);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setChartsReady(false);
    await refreshData();
    setIsRefreshing(false);
    setTimeout(() => setChartsReady(true), 600);
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-950 font-medium animate-pulse">Memuat Data Dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalVolume = woodBlocks.reduce((sum, block) => sum + block.volume, 0);
  const totalLogs = woodBlocks.reduce((sum, block) => sum + block.logCount, 0);

  // Status distribution
  const haraBlocks = woodBlocks.filter((b) => b.status === "HARA").length;
  const lokalBlocks = woodBlocks.filter((b) => b.status === "LOKAL").length;
  const industriBlocks = woodBlocks.filter((b) => b.status === "INDUSTRI").length;
  const vinirBlocks = woodBlocks.filter((b) => b.status === "VINIR").length;

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

  // Status distribution chart data
  const statusData = [
    { name: "HARA", value: haraBlocks },
    { name: "LOKAL", value: lokalBlocks },
    { name: "INDUSTRI", value: industriBlocks },
    { name: "VINIR", value: vinirBlocks },
  ];

  const STATUS_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#a855f7"];

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header - fade in from left */}
      <AnimatedSection delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-emerald-950 mb-1 sm:mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-slate-600">TPK Cabak - Sistem Informasi Peta TPK</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50 self-start sm:self-center"
          >
            <div className={`mr-2 h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''}`}></div>
            {isRefreshing ? "Menyegarkan..." : "Segarkan Data"}
          </Button>
        </div>
      </AnimatedSection>

      {/* TPK Profile Card - fade in */}
      <AnimatedSection delay={150}>
        <Card className="bg-gradient-to-r from-emerald-50 to-white p-6 border-emerald-200 overflow-hidden">
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
      </AnimatedSection>

      {/* Stat Cards - staggered entrance with count-up numbers */}
      <div className="grid md:grid-cols-3 gap-6">
        <AnimatedSection delay={300}>
          <Card className="p-6 border-l-4 border-l-emerald-600 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Volume</p>
                <AnimatedNumber
                  value={totalVolume}
                  decimals={1}
                  delay={600}
                  className="text-3xl font-bold text-emerald-950"
                />
                <p className="text-xs text-slate-500 mt-1">m³</p>
              </div>
              <TreePine className="h-12 w-12 text-emerald-100" />
            </div>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={450}>
          <Card className="p-6 border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Logs</p>
                <AnimatedNumber
                  value={totalLogs}
                  delay={750}
                  className="text-3xl font-bold text-blue-950"
                />
                <p className="text-xs text-slate-500 mt-1">Batang</p>
              </div>
              <Package className="h-12 w-12 text-blue-100" />
            </div>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={600}>
          <Card className="p-6 border-l-4 border-l-amber-600 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Blocks</p>
                <AnimatedNumber
                  value={woodBlocks.length}
                  delay={900}
                  className="text-3xl font-bold text-amber-950"
                />
                <p className="text-xs text-slate-500 mt-1">Bidang</p>
              </div>
              <Scale className="h-12 w-12 text-amber-100" />
            </div>
          </Card>
        </AnimatedSection>
      </div>

      {/* Charts - staggered with animation */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Wood Species Distribution */}
        <AnimatedSection delay={750}>
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
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
                  isAnimationActive={chartsReady}
                  animationBegin={200}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </AnimatedSection>

        {/* Status Distribution */}
        <AnimatedSection delay={900}>
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-emerald-950 mb-4">Distribusi Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  isAnimationActive={chartsReady}
                  animationBegin={400}
                  animationDuration={1400}
                  animationEasing="ease-out"
                  radius={[6, 6, 0, 0]}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
}
