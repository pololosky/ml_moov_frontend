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
    <div
      className="anim-fade-up"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8ECF0",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {loading ? (
        <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8, opacity: 1 - i * 0.12 }} />
          ))}
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
                  <tr
                    key={rowKey(row)}
                    className="table-row-hover"
                    style={{
                      borderBottom: i < rows.length - 1 ? "1px solid #F1F5F9" : "none",
                      animation: `fadeIn 0.2s ease both`,
                      animationDelay: `${Math.min(i * 0.025, 0.3)}s`,
                    }}
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
