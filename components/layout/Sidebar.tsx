"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingDown, PieChart, ShieldAlert, Upload,
} from "lucide-react";

const NAV = [
  { href: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/churn",        label: "Churn",        icon: TrendingDown },
  { href: "/segmentation", label: "Segmentation", icon: PieChart },
  { href: "/fraude",       label: "Fraude",       icon: ShieldAlert },
  { href: "/import",       label: "Import",       icon: Upload },
];

const BLUE   = "#0054A6";
const ORANGE = "#E96805";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="anim-slide-left"
      style={{
        position: "fixed", top: 0, left: 0,
        width: 240, height: "100vh",
        background: "#FFFFFF",
        borderRight: "1px solid #E8ECF0",
        display: "flex", flexDirection: "column",
        zIndex: 50,
        boxShadow: "2px 0 8px rgba(0,84,166,0.04)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #E8ECF0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Icône diamant Moov */}
          <div style={{
            width: 34, height: 34,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${BLUE} 0%, ${ORANGE} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="1" width="6" height="6" rx="1" transform="rotate(45 8 8)" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0F1923", lineHeight: 1.2 }}>
              Moov Africa
            </div>
            <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 1 }}>
              ML Analytics · Togo
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "#8A97A8", textTransform: "uppercase", padding: "4px 10px 8px" }}>
          Navigation
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div
                className="nav-item"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                  background: active ? BLUE : "transparent",
                  color: active ? "#FFFFFF" : "#4A5568",
                  fontWeight: active ? 600 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: active ? "0 2px 8px rgba(0,84,166,0.25)" : "none",
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #E8ECF0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
          <span style={{ fontSize: 11, color: "#8A97A8" }}>API connectée · v1.0</span>
        </div>
      </div>
    </aside>
  );
}
