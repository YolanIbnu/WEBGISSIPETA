"use client";

import { useApp } from "@/context/app-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Info, AlertCircle, User, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function StaffRegistrationForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Create a secondary client specifically for registration 
      // to avoid logging out the currently logged-in admin.
      const { createClient } = await import('@supabase/supabase-js');
      const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        }
      );

      const { data, error } = await authClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'staff'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setMessage({
          type: 'success',
          text: 'Akun Staff berhasil dibuat! Sesi Admin Anda tetap aktif. Staff baru dapat login menggunakan kredensial yang Anda berikan.'
        });
        // Reset form
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Gagal membuat akun." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 bg-white p-4 rounded-lg border border-purple-100">
      <div className="grid gap-2">
        <Label htmlFor="staff-name">Nama Lengkap</Label>
        <Input
          id="staff-name"
          placeholder="Nama Staff"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="staff-email">Email Staff</Label>
        <Input
          id="staff-email"
          type="email"
          placeholder="staff@perhutani.co.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="staff-password">Password Sementara</Label>
        <Input
          id="staff-password"
          type="password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-amber-50 p-3 rounded text-xs text-amber-800 border border-amber-200">
        <strong>Catatan Penting:</strong> Membuat akun baru akan otomatis logout dari sesi Admin saat ini.
      </div>

      <Button type="submit" disabled={isLoading} className="w-full bg-purple-700 hover:bg-purple-800">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Buat Akun Staff
      </Button>
    </form>
  );
}

export function Settings() {
  const { user, settings, updateSettings, isLoading: globalLoading } = useApp();
  const canEditSettings = user?.role === "admin";

  // Edit State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Sync editForm with global settings when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setEditForm(settings);
    }
  }, [isDialogOpen, settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const success = await updateSettings(editForm);
    if (success) {
      setIsDialogOpen(false);
    } else {
      alert("Gagal menyimpan pengaturan.");
    }
    setIsSaving(false);
  };

  if (globalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-2" />
        <span className="text-emerald-950 font-medium">Memuat Pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-emerald-950 mb-2">Settings</h1>
        <p className="text-slate-600">Pengaturan sistem dan preferensi pengguna</p>
      </div>

      {/* Permission Warning */}
      {!canEditSettings && (
        <Card className="bg-amber-50 border-amber-200 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">Akses Terbatas</p>
            <p className="text-sm text-amber-800">
              Hanya Admin yang dapat mengubah pengaturan sistem. Anda saat ini login sebagai{" "}
              <span className="font-semibold capitalize">{user?.role}</span>.
            </p>
          </div>
        </Card>
      )}

      {/* User Account */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-emerald-950 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Akun Pengguna
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Username</p>
            <p className="text-lg font-semibold text-slate-900 capitalize">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Role</p>
            <div>
              <Badge
                className={
                  user?.role === "admin"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }
              >
                {user?.role === "admin" ? "Administrator" : "Staff"}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Permissions</p>
            <div className="text-sm text-slate-700 space-y-1">
              {user?.role === "admin" ? (
                <>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Full Access
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Edit All Data
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Access Settings
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> View Dashboard
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> Update Data
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-slate-400">✗</span> Edit Settings
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* System Settings */}
      {canEditSettings && (
        <Card className="p-6 border-emerald-200 bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-950 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Pengaturan Sistem
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Nama TPK</p>
              <p className="text-lg font-semibold text-slate-900">{globalLoading ? "Loading..." : settings.tpk_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Lokasi</p>
              <p className="text-lg font-semibold text-slate-900">{globalLoading ? "Loading..." : settings.location}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Kapasitas Total</p>
              <p className="text-lg font-semibold text-slate-900">{globalLoading ? "Loading..." : settings.capacity}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Luas Area</p>
              <p className="text-lg font-semibold text-slate-900">{globalLoading ? "Loading..." : settings.total_area}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Zona</p>
              <p className="text-lg font-semibold text-slate-900">{globalLoading ? "Loading..." : settings.zones}</p>
            </div>


            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => setEditForm(settings)}
                >
                  Edit System Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit System Settings</DialogTitle>
                  <DialogDescription>
                    Ubah informasi dasar TPK yang ditampilkan di dashboard.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tpk-name">Nama TPK</Label>
                    <Input
                      id="tpk-name"
                      value={editForm.tpk_name}
                      onChange={(e) => setEditForm({ ...editForm, tpk_name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="total-area">Luas Area (Isi angka & satuan)</Label>
                    <Input
                      id="total-area"
                      value={editForm.total_area}
                      onChange={(e) => setEditForm({ ...editForm, total_area: e.target.value })}
                      placeholder="Contoh: 250 Hektar"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Kapasitas Total (Isi angka & satuan)</Label>
                    <Input
                      id="capacity"
                      value={editForm.capacity}
                      onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                      placeholder="Contoh: 500 m³"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zones">Zona (Pisahkan dengan koma)</Label>
                    <Input
                      id="zones"
                      value={editForm.zones}
                      onChange={(e) => setEditForm({ ...editForm, zones: e.target.value })}
                      placeholder="Contoh: Zona A, Zona B"
                    />
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                  <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Simpan Perubahan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      )}

      {/* Map Configuration */}
      {canEditSettings && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h2 className="text-xl font-bold text-blue-950 mb-4">Konfigurasi Peta</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Map Source</p>
              <p className="text-lg font-semibold text-slate-900">Esri Satellite (JOSM)</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Default Zoom</p>
              <p className="text-lg font-semibold text-slate-900">15</p>
            </div>
            <Button disabled className="mt-4 bg-blue-600 text-white">
              Configure Map
            </Button>
          </div>
        </Card>
      )}

      {/* Staff Management (Admin Only) */}
      {canEditSettings && (
        <Card className="p-6 border-purple-200 bg-purple-50">
          <h2 className="text-xl font-bold text-purple-950 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Manajemen Staff
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Tambahkan akun staff baru untuk mengakses sistem.
            </p>

            <StaffRegistrationForm />

          </div>
        </Card>
      )}

      {/* About */}
      <Card className="p-6 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Tentang Sistem</h2>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Nama Sistem:</span> SIPETA TPK v1.0
          </p>
          <p>
            <span className="font-semibold">Deskripsi:</span> Sistem Informasi Peta TPK
            (Taman Produksi Kayu) dengan fitur GIS terintegrasi untuk manajemen persediaan
            kayu di Perhutani Cabak.
          </p>
          <p>
            <span className="font-semibold">Teknologi:</span> Next.js 14, React Leaflet, Tailwind CSS, Recharts
          </p>
          <p className="pt-2 text-xs text-slate-600">
            © 2024 Perhutani Cabak. All rights reserved.
          </p>
        </div>
      </Card>
    </div>
  );
}
