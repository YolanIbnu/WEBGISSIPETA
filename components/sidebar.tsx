"use client";

import {
  LayoutDashboard,
  Map,
  Database,
  FileText,
  User,
  TreePine,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewType = "map" | "data";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard Overview",
    icon: LayoutDashboard,
    disabled: true,
  },
  {
    id: "map",
    label: "Map Inventory",
    icon: Map,
    disabled: false,
  },
  {
    id: "data",
    label: "Data Stok",
    icon: Database,
    disabled: false,
  },
  {
    id: "reports",
    label: "Laporan",
    icon: FileText,
    disabled: true,
  },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <TreePine className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">
              SIPETA TPK
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Perhutani Cabak
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              (item.id === "map" && activeView === "map") ||
              (item.id === "data" && activeView === "data");

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!item.disabled && (item.id === "map" || item.id === "data")) {
                      onViewChange(item.id as ViewType);
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    item.disabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="w-5 h-5 text-sidebar-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">
              Admin TPK
            </p>
            <p className="text-xs text-sidebar-foreground/60">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
