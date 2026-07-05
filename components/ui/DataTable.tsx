import { Loader2 } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  rowKey: (row: T) => string | number;
}

export default function DataTable<T>({
  columns, rows, loading = false, emptyMessage = "Aucune donnée disponible.", rowKey,
}: DataTableProps<T>) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E8ECF0",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
          <Loader2 size={22} className="animate-spin" style={{ color: "#0693E3" }} />
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F7F9FC", borderBottom: "1px solid #E8ECF0" }}>
                {columns.map((col) => (
                  <th key={col.key} style={{
                    padding: "10px 16px",
                    textAlign: col.align ?? "left",
                    fontSize: 10, fontWeight: 700,
                    color: "#8A97A8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    whiteSpace: "nowrap",
                  }}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{
                    padding: "40px 16px", textAlign: "center",
                    color: "#8A97A8", fontSize: 13,
                  }}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={rowKey(row)} style={{
                    borderBottom: i < rows.length - 1 ? "1px solid #F1F5F9" : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {columns.map((col) => (
                      <td key={col.key} style={{
                        padding: "11px 16px",
                        textAlign: col.align ?? "left",
                        color: "#0F1923",
                        verticalAlign: "middle",
                      }}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
