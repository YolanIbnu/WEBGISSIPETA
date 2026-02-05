"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditModal } from "@/components/edit-modal";
import { MapPin, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MapInventoryProps {
  onEditBlock: (id: string) => void;
}

// Dynamically import the map component to avoid SSR issues
const MapContent = dynamic(() => import("@/components/map-content"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-slate-100">
      <div className="text-slate-600">Memuat peta...</div>
    </div>
  ),
});

export function MapInventory({ onEditBlock }: MapInventoryProps) {
  const { geoJsonData } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const handleSelectFeature = (id: string) => {
    setEditingId(id);
    // Find feature data based on ID
    const feature = geoJsonData.features.find((f: any) => f.properties.id === id);
    if (feature) {
      setSelectedFeature(feature.properties);
    }
  };

  // Sync selectedFeature with geoJsonData for realtime updates
  useEffect(() => {
    if (editingId) {
      const feature = geoJsonData.features.find((f: any) => f.properties.id === editingId);
      if (feature && feature.properties) {
        // Only update if data actually changed to avoid unnecessary re-renders
        if (JSON.stringify(feature.properties) !== JSON.stringify(selectedFeature)) {
          setSelectedFeature(feature.properties);
        }
      }
    }
  }, [geoJsonData, editingId, selectedFeature]);

  const handleOpenEditModal = () => {
    if (editingId) {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Kita tidak mereset editingId agar info panel tetap menampilkan data terakhir
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] lg:h-screen overflow-hidden bg-slate-100">
      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        <MapContent
          geoJsonData={geoJsonData}
          onSelectFeature={handleSelectFeature}
        />
      </div>

      {/* Legend - Responsive positioning */}
      <Card className={cn(
        "absolute transition-all duration-300 z-10 bg-white/90 backdrop-blur-md p-2 sm:p-4 shadow-md border-emerald-100 sm:w-auto overflow-hidden",
        "top-[72px] right-3 sm:top-auto sm:right-auto sm:left-6 sm:bottom-6",
        selectedFeature ? "opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto" : "opacity-100"
      )}>
        <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2">
          <p className="text-[10px] sm:text-sm font-bold text-emerald-900 uppercase tracking-wider">Legend</p>
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-500 rounded-sm shadow-sm"></div>
              <span className="text-slate-700 font-medium font-bold">A</span>
              <span className="text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-red-500 rounded-sm shadow-sm"></div>
              <span className="text-slate-700 font-medium font-bold">S</span>
              <span className="text-slate-600">Sold</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Info Panel / Bottom Sheet */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-20 sm:top-6 sm:right-6 sm:left-auto sm:bottom-auto sm:w-80"
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-t sm:border border-emerald-100 rounded-t-2xl sm:rounded-xl overflow-hidden">
              {/* Drag Handle for Mobile */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-sm sm:text-base">Detail Bidang</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">{selectedFeature.id}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-slate-100"
                    onClick={() => {
                      setSelectedFeature(null);
                      setEditingId(null);
                    }}
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Lokasi Zona</p>
                    <p className="font-semibold text-slate-900 text-sm">{selectedFeature.zone}</p>
                  </div>

                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Jenis Kayu</p>
                    <p className="font-bold text-emerald-900 text-sm">{selectedFeature.woodType}</p>
                  </div>

                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-medium mb-1">Volume Stok</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedFeature.volume} <span className="text-[10px] font-normal text-slate-500">m³</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-xs font-medium text-emerald-800">Status Saat Ini</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${selectedFeature.status === 'Available'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {selectedFeature.status.toUpperCase()}
                  </span>
                </div>

                <Button
                  onClick={handleOpenEditModal}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-6 rounded-xl shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Update Inventaris
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <EditModal
        blockId={editingId}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}
