import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { page: number; totalPages: number; total: number; pageSize: number; onPage: (p: number) => void };

export default function Pagination({ page, totalPages, total, pageSize, onPage }: Props) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="pagination">
      <span className="muted-sm">Showing {from}-{to} of {total}</span>
      <div className="pager">
        <button className="page-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="page-info">Page {page} of {totalPages}</span>
        <button className="page-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}