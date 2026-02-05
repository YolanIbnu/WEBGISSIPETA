"use client";

import { useApp } from "@/context/app-context";
import { PageType } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Map,
  Table2,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  User,
  X,
} from "lucide-react";

interface AppSidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "map", label: "Map Inventory", icon: Map },
  { id: "data", label: "Data Stok", icon: Table2 },
  { id: "laporan", label: "Laporan", icon: FileText },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export function AppSidebar({ currentPage, onPageChange, isOpen, onClose }: AppSidebarProps) {
  const { user, logout } = useApp();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`fixed left-0 top-0 h-screen w-[280px] bg-emerald-950 text-emerald-50 flex flex-col shadow-2xl z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        {/* Header */}
        <div className="p-6 border-b border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-emerald-950 p-2 rounded font-bold text-sm">
              TPK
            </div>
            <div>
              <h1 className="font-bold text-sm">SIPETA</h1>
              <p className="text-xs text-emerald-200">Perhutani Cabak</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-emerald-100 hover:bg-emerald-900"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === (item.id as PageType);
            return (
              <Button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id as PageType);
                  onClose();
                }}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 rounded-lg ${isActive
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "text-emerald-100 hover:bg-emerald-900 hover:text-white"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 pb-8 border-t border-emerald-900 space-y-3">
          <Separator className="bg-emerald-900" />
          <Card className="bg-emerald-900 border-emerald-800 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                <p className="text-xs text-emerald-200 capitalize">{user?.role}</p>
              </div>
            </div>
          </Card>

          <Button
            onClick={logout}
            variant="ghost"
            type="button"
            className="w-full justify-start gap-2 text-emerald-100 hover:bg-emerald-900 hover:text-red-300 active:scale-95 transition-transform"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
}
