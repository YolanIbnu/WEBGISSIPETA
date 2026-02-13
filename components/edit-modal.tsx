"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/app-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";

interface EditModalProps {
  blockId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const WOOD_TYPES = ["Jati", "Mahoni", "Pinus", "Sengon", "Meranti", "Kayu Putih"];
const GRADES = ["A.I", "A.II", "B.I", "B.II", "C.I", "C.II"];

export function EditModal({ blockId, isOpen, onClose }: EditModalProps) {
  const { woodBlocks, updateWoodBlock } = useApp();
  const [formData, setFormData] = useState({
    tpkName: "",
    woodType: "",
    volume: "",
    logCount: "",
    grade: "",
    status: "Available" as "Available" | "Sold",
  });

  const currentBlock = woodBlocks.find((b) => b.id === blockId);

  // Initialize form when modal opens or blockId changes
  useEffect(() => {
    if (currentBlock && isOpen) {
      setFormData({
        tpkName: currentBlock.tpkName || "",
        woodType: currentBlock.woodType,
        volume: currentBlock.volume.toString(),
        logCount: currentBlock.logCount.toString(),
        grade: currentBlock.grade,
        status: currentBlock.status,
      });
    }
  }, [currentBlock, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!blockId) return;

    // Close modal immediately for better UX (as we have optimistic UI)
    onClose();

    // Use toast.promise for better visibility of background progress
    const updatePromise = updateWoodBlock(blockId, {
      tpkName: formData.tpkName || undefined,
      woodType: formData.woodType,
      volume: parseFloat(formData.volume),
      logCount: parseInt(formData.logCount),
      grade: formData.grade,
      status: formData.status,
    });

    toast.promise(updatePromise, {
      loading: `Sedang menyimpan perubahan ${blockId}...`,
      success: `Data ${blockId} berhasil diperbarui`,
      error: `Gagal memperbarui data ${blockId}.`
    });
  };

  if (!currentBlock) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-emerald-950">Update Data Stok</DialogTitle>
          <DialogDescription>
            Mengubah data untuk Block {blockId} di {currentBlock?.zone}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama TPK */}
          <div className="space-y-2">
            <Label htmlFor="tpkName" className="text-slate-700">
              Nama TPK
            </Label>
            <Input
              id="tpkName"
              type="text"
              value={formData.tpkName}
              onChange={(e) => handleChange("tpkName", e.target.value)}
              placeholder="Contoh: TPK 40"
              className="bg-slate-50"
            />
          </div>

          {/* Jenis Kayu */}
          <div className="space-y-2">
            <Label htmlFor="woodType" className="text-slate-700">
              Jenis Kayu
            </Label>
            <Select
              value={formData.woodType}
              onValueChange={(value) => handleChange("woodType", value)}
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Pilih jenis kayu" />
              </SelectTrigger>
              <SelectContent>
                {WOOD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <Label htmlFor="volume" className="text-slate-700">
              Volume m³
            </Label>
            <Input
              id="volume"
              type="number"
              step="0.1"
              value={formData.volume}
              onChange={(e) => handleChange("volume", e.target.value)}
              className="bg-slate-50"
            />
          </div>

          {/* Jumlah Batang */}
          <div className="space-y-2">
            <Label htmlFor="logCount" className="text-slate-700">
              Jumlah Batang
            </Label>
            <Input
              id="logCount"
              type="number"
              value={formData.logCount}
              onChange={(e) => handleChange("logCount", e.target.value)}
              className="bg-slate-50"
            />
          </div>

          {/* Grade */}
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-slate-700">
              Grade
            </Label>
            <Select
              value={formData.grade}
              onValueChange={(value) => handleChange("grade", value)}
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Pilih grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-slate-700">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent >
    </Dialog >
  );
}
