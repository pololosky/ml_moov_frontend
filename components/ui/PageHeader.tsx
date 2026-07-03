import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: "blue" | "orange";
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  accent = "blue",
  action,
}: PageHeaderProps) {
  const color = accent === "blue" ? "#004B8D" : "#F15A24";
  const bg = accent === "blue" ? "#E8F0F9" : "#FEF0EA";

  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: bg }}>
          <Icon size={22} color={color} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1C1C2E" }}>{title}</h1>
          <p className="text-sm mt-0.5" style={{ color: "#9CA3AF" }}>{description}</p>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
