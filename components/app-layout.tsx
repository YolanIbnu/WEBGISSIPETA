"use client";

import { useState } from "react";
import { useApp } from "@/context/app-context";
import { AppSidebar } from "@/components/app-sidebar";
import { Dashboard } from "@/components/pages/dashboard";
import { MapInventory } from "@/components/pages/map-inventory";
import { DataStok } from "@/components/pages/data-stok";
import { Laporan } from "@/components/pages/laporan";
import { Settings } from "@/components/pages/settings";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PageType = "dashboard" | "map" | "data" | "laporan" | "settings";

export function AppLayout() {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleEditBlock = (id: string) => {
    setEditingBlockId(id);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingBlockId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-emerald-950 text-white flex items-center px-4 lg:hidden z-30 shadow-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="text-white hover:bg-emerald-900"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="ml-4 font-bold tracking-tight">SIPETA TPK</div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-[280px] min-h-screen pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === "dashboard" && <Dashboard />}
            {currentPage === "map" && (
              <MapInventory onEditBlock={handleEditBlock} />
            )}
            {currentPage === "data" && (
              <DataStok onEditBlock={handleEditBlock} />
            )}
            {currentPage === "laporan" && <Laporan />}
            {currentPage === "settings" && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
