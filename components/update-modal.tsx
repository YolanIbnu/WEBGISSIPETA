"use client";

import React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventory } from "@/context/inventory-context";
import type { LogItem, LogStatus } from "@/lib/supabase";

interface UpdateModalProps {
  logId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const woodTypes = ["Jati", "Mahoni", "Sonokeling", "Akasia", "Pinus", "Sengon"];
const statusOptions: LogStatus[] = ["Available", "Sold"];

export function UpdateModal({ logId, isOpen, onClose }: UpdateModalProps) {
  const { getLogById, updateLog } = useInventory();
  const [formData, setFormData] = useState<Partial<LogItem>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (logId) {
      const log = getLogById(logId);
      if (log) {
        setFormData({
          woodType: log.woodType,
          volume: log.volume,
          logCount: log.logCount,
          grade: log.grade,
          status: log.status,
        });
      }
    }
  }, [logId, getLogById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logId) {
      setIsSaving(true);
      // Optimistic update happens inside updateLog
      await updateLog(logId, formData);
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
              <h2 className="text-lg font-semibold text-card-foreground">
                Update Data: {logId}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-card-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Wood Type */}
              <div className="space-y-2">
                <Label htmlFor="woodType" className="text-card-foreground">
                  Jenis Kayu
                </Label>
                <Select
                  value={formData.woodType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, woodType: value })
                  }
                >
                  <SelectTrigger id="woodType" className="bg-background">
                    <SelectValue placeholder="Pilih jenis kayu" />
                  </SelectTrigger>
                  <SelectContent>
                    {woodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <Label htmlFor="volume" className="text-card-foreground">
                  {"Volume (m\u00B3)"}
                </Label>
                <Input
                  id="volume"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.volume || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      volume: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-background"
                />
              </div>

              {/* Log Count */}
              <div className="space-y-2">
                <Label htmlFor="logCount" className="text-card-foreground">
                  Jumlah Batang (pcs)
                </Label>
                <Input
                  id="logCount"
                  type="number"
                  min="0"
                  value={formData.logCount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      logCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-background"
                />
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-card-foreground">
                  Grade
                </Label>
                <Input
                  id="grade"
                  type="text"
                  value={formData.grade || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  className="bg-background"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-card-foreground">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as LogStatus })
                  }
                >
                  <SelectTrigger id="status" className="bg-background">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 bg-transparent"
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
