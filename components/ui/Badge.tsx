type Variant = "blue" | "orange" | "green" | "red" | "gray" | "purple";

const VARIANTS: Record<Variant, { bg: string; color: string }> = {
  blue:   { bg: "#E6EEF7", color: "#003F80" },
  orange: { bg: "#FEF3E8", color: "#C85A04" },
  green:  { bg: "#F0FDF4", color: "#15803D" },
  red:    { bg: "#FEF2F2", color: "#DC2626" },
  gray:   { bg: "#F1F5F9", color: "#64748B" },
  purple: { bg: "#F5F3FF", color: "#7C3AED" },
};

export default function Badge({ label, variant = "gray" }: { label: string; variant?: Variant }) {
  const v = VARIANTS[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: v.bg, color: v.color,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}
