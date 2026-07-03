import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "blue" | "orange" | "green" | "red";
}

const accentConfig = {
  blue:   { bg: "#E8F0F9", icon: "#004B8D", value: "#004B8D" },
  orange: { bg: "#FEF0EA", icon: "#F15A24", value: "#F15A24" },
  green:  { bg: "#ECFDF5", icon: "#059669", value: "#047857" },
  red:    { bg: "#FEF2F2", icon: "#EF4444", value: "#DC2626" },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "blue",
}: StatCardProps) {
  const cfg = accentConfig[accent];

  return (
    <div
      className="rounded-xl p-5 flex items-start gap-4"
      style={{ backgroundColor: "#ffffff", border: "1px solid #EAECF0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <div
        className="p-2.5 rounded-lg shrink-0"
        style={{ backgroundColor: cfg.bg }}
      >
        <Icon size={20} color={cfg.icon} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: "#9CA3AF" }}>{title}</p>
        <p className="mt-0.5 text-2xl font-bold leading-tight" style={{ color: cfg.value }}>
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-xs truncate" style={{ color: "#9CA3AF" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
