interface BadgeProps {
  label: string;
  variant?: "blue" | "orange" | "green" | "red" | "gray";
}

const variants: Record<string, { bg: string; color: string }> = {
  blue:   { bg: "#E8F0F9", color: "#004B8D" },
  orange: { bg: "#FEF0EA", color: "#F15A24" },
  green:  { bg: "#ECFDF5", color: "#047857" },
  red:    { bg: "#FEF2F2", color: "#DC2626" },
  gray:   { bg: "#F3F4F6", color: "#6B7280" },
};

export default function Badge({ label, variant = "gray" }: BadgeProps) {
  const { bg, color } = variants[variant];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}
