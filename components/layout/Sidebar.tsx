"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingDown,
  PieChart,
  ShieldAlert,
  Upload,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/churn", label: "Churn", icon: TrendingDown },
  { href: "/segmentation", label: "Segmentation", icon: PieChart },
  { href: "/fraude", label: "Fraude", icon: ShieldAlert },
  { href: "/import", label: "Import Excel", icon: Upload },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-60 flex flex-col z-40" style={{ backgroundColor: "#ffffff", borderRight: "1px solid #EAECF0", boxShadow: "1px 0 4px rgba(0,0,0,0.04)" }}>
      {/* Logo Moov */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid #EAECF0" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: "#004B8D" }}
          >
            M
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight" style={{ color: "#1C1C2E" }}>Moov Africa</p>
            <p className="text-xs" style={{ color: "#9CA3AF" }}>ML Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: "#9CA3AF" }}>
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={
                isActive
                  ? { backgroundColor: "#004B8D", color: "#ffffff" }
                  : { color: "#6B7280" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#F4F6FA";
                  e.currentTarget.style.color = "#1C1C2E";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6B7280";
                }
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid #EAECF0" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#F15A24" }}
          />
          <p className="text-xs" style={{ color: "#9CA3AF" }}>Togo — v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
