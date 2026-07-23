import { LucideIcon } from "lucide-react";

type Accent = "blue" | "orange" | "green" | "red" | "gray";

const ACCENTS: Record<Accent, { bg: string; icon: string; value: string; border: string }> = {
  blue:   { bg: "#E6EEF7", icon: "#0054A6", value: "#0054A6", border: "#C5D9EF" },
  orange: { bg: "#FEF3E8", icon: "#E96805", value: "#E96805", border: "#FDDCC0" },
  green:  { bg: "#F0FDF4", icon: "#16A34A", value: "#16A34A", border: "#BBF7D0" },
  red:    { bg: "#FEF2F2", icon: "#DC2626", value: "#DC2626", border: "#FECACA" },
  gray:   { bg: "#F7F9FC", icon: "#8A97A8", value: "#4A5568", border: "#E8ECF0" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: Accent;
}

export default function StatCard({ title, value, subtitle, icon: Icon, accent = "blue" }: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <div
      className="card-hover anim-fade-up"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8ECF0",
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{
        width: 40, height: 40,
        borderRadius: 10,
        background: a.bg,
        border: `1px solid ${a.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} color={a.icon} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#8A97A8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: a.value, lineHeight: 1.2, marginTop: 3 }}>
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
