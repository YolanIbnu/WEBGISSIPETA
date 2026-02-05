"use client";

import React from "react"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useApp } from "@/context/app-context";
import { AlertCircle } from "lucide-react";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || "Login gagal. Periksa email dan password.");
        setIsLoading(false);
      }
      // Jika success, state user berubah di context -> redirect otomatis terjadi
    } catch {
      setError("Terjadi kesalahan sistem.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background forest pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl relative z-10">
        <div className="p-8">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-emerald-950 text-white p-3 rounded-lg mb-4">
              <div className="text-2xl font-bold">TPK</div>
            </div>
            <h1 className="text-2xl font-bold text-emerald-950">SIPETA TPK</h1>
            <p className="text-sm text-slate-600 mt-1">
              Sistem Informasi Peta TPK - Perhutani Cabak
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="nama@perhutani.co.id"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-950 hover:bg-emerald-900 text-white"
            >
              {isLoading ? "Memproses..." : "Masuk ke Sistem"}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Belum punya akun? Hubungi Administrator TPK.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
