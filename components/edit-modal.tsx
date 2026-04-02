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
import {
  SORTIMEN_GRADE_OPTIONS,
  STATUS_OPTIONS,
  CACAT_KAYU_OPTIONS,
  WOOD_TYPES,
  StatusType,
  CacatKayuType,
} from "@/lib/geojson-data";

interface EditModalProps {
  blockId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function MultiSelectGroup({
  options,
  selectedValues,
  onChange,
}: {
  options: string[];
  selectedValues: string;
  onChange: (val: string) => void;
}) {
  const selectedList = selectedValues ? selectedValues.split(', ').filter(Boolean) : [];

  const toggleOption = (option: string) => {
    if (selectedList.includes(option)) {
      onChange(selectedList.filter((o) => o !== option).join(', '));
    } else {
      onChange([...selectedList, option].join(', '));
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selectedList.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
              isSelected
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function EditModal({ blockId, isOpen, onClose }: EditModalProps) {
  const { woodBlocks, updateWoodBlock } = useApp();
  const [formData, setFormData] = useState({
    tpkName: "",
    woodType: "",
    volume: "",
    logCount: "",
    grade: "",
    status: "HARA" as StatusType,
    cacatKayu: "" as string,
    panjang1: "",
    panjang2: "",
    diameter1: "",
    diameter2: "",
    tahunProduksi: "",
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
        cacatKayu: currentBlock.cacatKayu || "",
        panjang1: currentBlock.panjang1?.toString() || "",
        panjang2: currentBlock.panjang2?.toString() || "",
        diameter1: currentBlock.diameter1?.toString() || "",
        diameter2: currentBlock.diameter2?.toString() || "",
        tahunProduksi: currentBlock.tahunProduksi?.toString() || "",
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
      volume: parseFloat(formData.volume) || 0,
      logCount: parseInt(formData.logCount) || 0,
      grade: formData.grade,
      status: formData.status,
      cacatKayu: (formData.cacatKayu as CacatKayuType) || undefined,
      panjang1: formData.panjang1 ? parseFloat(formData.panjang1) : undefined,
      panjang2: formData.panjang2 ? parseFloat(formData.panjang2) : undefined,
      diameter1: formData.diameter1 ? parseFloat(formData.diameter1) : undefined,
      diameter2: formData.diameter2 ? parseFloat(formData.diameter2) : undefined,
      tahunProduksi: formData.tahunProduksi ? parseInt(formData.tahunProduksi) : undefined,
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
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
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

          {/* Volume & Jumlah Batang side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="volume" className="text-slate-700">
                Volume (m³)
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
          </div>

          {/* Panjang (2 kolom) */}
          <div className="space-y-2">
            <Label className="text-slate-700">Panjang (meter)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="panjang1"
                type="number"
                step="0.01"
                value={formData.panjang1}
                onChange={(e) => handleChange("panjang1", e.target.value)}
                placeholder="0,90"
                className="bg-slate-50 flex-1"
              />
              <span className="text-slate-400 font-bold text-lg">—</span>
              <Input
                id="panjang2"
                type="number"
                step="0.01"
                value={formData.panjang2}
                onChange={(e) => handleChange("panjang2", e.target.value)}
                placeholder="0,90"
                className="bg-slate-50 flex-1"
              />
            </div>
          </div>

          {/* Tebal / Diameter (2 kolom) */}
          <div className="space-y-2">
            <Label className="text-slate-700">Tebal / Diameter (cm)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="diameter1"
                type="number"
                step="1"
                value={formData.diameter1}
                onChange={(e) => handleChange("diameter1", e.target.value)}
                placeholder="63"
                className="bg-slate-50 flex-1"
              />
              <span className="text-slate-400 font-bold text-lg">—</span>
              <Input
                id="diameter2"
                type="number"
                step="1"
                value={formData.diameter2}
                onChange={(e) => handleChange("diameter2", e.target.value)}
                placeholder="63"
                className="bg-slate-50 flex-1"
              />
            </div>
          </div>

          {/* Sortimen (was Grade) */}
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-slate-700">
              Sortimen
            </Label>
            <MultiSelectGroup
              options={SORTIMEN_GRADE_OPTIONS}
              selectedValues={formData.grade}
              onChange={(value) => handleChange("grade", value)}
            />
          </div>

          {/* Cacat Kayu */}
          <div className="space-y-2">
            <Label htmlFor="cacatKayu" className="text-slate-700">
              Cacat Kayu
            </Label>
            <MultiSelectGroup
              options={CACAT_KAYU_OPTIONS}
              selectedValues={formData.cacatKayu}
              onChange={(value) => handleChange("cacatKayu", value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-slate-700">
              Status
            </Label>
            <MultiSelectGroup
              options={STATUS_OPTIONS}
              selectedValues={formData.status}
              onChange={(value) => handleChange("status", value)}
            />
          </div>

          {/* Tahun Produksi */}
          <div className="space-y-2">
            <Label htmlFor="tahunProduksi" className="text-slate-700">
              Tahun Produksi
            </Label>
            <Input
              id="tahunProduksi"
              type="number"
              min="1900"
              max="2100"
              value={formData.tahunProduksi}
              onChange={(e) => handleChange("tahunProduksi", e.target.value)}
              placeholder="Contoh: 2024"
              className="bg-slate-50"
            />
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
