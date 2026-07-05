import { LucideIcon } from "lucide-react";

const BLUE   = "#0693E3";
const ORANGE = "#E96805";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: "blue" | "orange";
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, icon: Icon, accent = "blue", action }: PageHeaderProps) {
  const color = accent === "blue" ? BLUE : ORANGE;
  const bg    = accent === "blue" ? "#E8F5FD" : "#FEF3E8";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={22} color={color} strokeWidth={2} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F1923", margin: 0, lineHeight: 1.2 }}>{title}</h1>
          <p style={{ fontSize: 12, color: "#8A97A8", margin: "4px 0 0" }}>{description}</p>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
