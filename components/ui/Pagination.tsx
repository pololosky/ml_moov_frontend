import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ page, totalPages, total, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
      <span style={{ fontSize: 12, color: "#8A97A8" }}>
        {total.toLocaleString("fr-FR")} résultats · Page {page} / {totalPages}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={onPrev}
          disabled={page === 1}
          style={{
            padding: "5px 8px", borderRadius: 7,
            border: "1px solid #E8ECF0",
            background: "#FFF", color: "#4A5568",
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.4 : 1,
            display: "flex", alignItems: "center",
          }}
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={onNext}
          disabled={page === totalPages}
          style={{
            padding: "5px 8px", borderRadius: 7,
            border: "1px solid #E8ECF0",
            background: "#FFF", color: "#4A5568",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            opacity: page === totalPages ? 0.4 : 1,
            display: "flex", alignItems: "center",
          }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
