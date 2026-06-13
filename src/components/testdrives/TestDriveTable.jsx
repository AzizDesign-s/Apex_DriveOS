// src/components/testdrives/TestDriveTable.jsx

import { motion } from "framer-motion";
import {
  CalendarCheck,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X as XIcon,
} from "lucide-react";
import { Badge, EmptyState, Button } from "../ui";
import clsx from "clsx";

// ── Column widths ─────────────────────────────────────────────────────────────
const COL_WIDTH = {
  bookingId: "110px",
  customer: undefined,
  car: "180px",
  datetime: "140px",
  exec: "130px",
  location: "160px",
  duration: "90px",
  status: "115px",
};

function SortIcon({ active, dir }) {
  if (!active)
    return <span className="ml-1 text-text-subtle/25 text-[10px]">↕</span>;
  return dir === "asc" ? (
    <ChevronUp size={11} className="ml-0.5 text-gold inline" />
  ) : (
    <ChevronDown size={11} className="ml-0.5 text-gold inline" />
  );
}

function Pagination({ page, totalPages, total, perPage, onPage }) {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0">
      <p className="text-[10px] text-text-subtle">
        {total === 0
          ? "No bookings found"
          : `Showing ${start}–${end} of ${total} bookings`}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                     text-text-muted hover:text-gold hover:border-gold/30 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`e${i}`}
              className="w-7 h-7 flex items-center justify-center text-text-subtle text-xs"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              aria-current={page === p ? "page" : undefined}
              className={clsx(
                "w-7 h-7 rounded-lg border text-[11px] font-semibold transition-all",
                page === p
                  ? "border-gold/40 text-gold bg-gold/8"
                  : "border-border text-text-muted hover:border-gold/30 hover:text-gold",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                     text-text-muted hover:text-gold hover:border-gold/30 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function TestDriveTable({
  data = [],
  columns = [],
  total = 0,
  page = 1,
  onPage,
  perPage = 10,
  selected,
  onToggleSelect,
  onSelectAll,
  sortField,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onClearFilters,
}) {
  const visibleCols = columns.filter((c) => c.visible);
  const allSelected = data.length > 0 && data.every((b) => selected.has(b.id));
  const totalPages = Math.ceil(total / perPage);

  const formatDateTime = (booking) => {
    if (!booking.date) return "—";
    const d = new Date(booking.date + "T00:00:00");
    return d.toLocaleDateString("en-AE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden
                    flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-auto scrollbar-none">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed", minWidth: "750px" }}
        >
          <colgroup>
            <col style={{ width: "44px" }} />
            {visibleCols.map((col) => (
              <col key={col.id} style={{ width: COL_WIDTH[col.id] }} />
            ))}
            <col style={{ width: "110px" }} />
          </colgroup>

          {/* Header */}
          <thead>
            <tr className="bg-[rgba(212,175,55,0.02)] border-b border-border">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="appearance-none w-3.5 h-3.5 rounded border border-border
                             bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-3 text-left text-[9px] font-bold tracking-[0.2em]
                             text-text-subtle uppercase whitespace-nowrap select-none
                             cursor-pointer hover:text-text-muted"
                  onClick={() => onSort(col.id)}
                >
                  {col.label}
                  <SortIcon active={sortField === col.id} dir={sortDir} />
                </th>
              ))}
              <th
                className="px-4 py-3 text-right text-[9px] font-bold tracking-[0.2em]
                             text-text-subtle uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2}>
                  <EmptyState
                    icon={CalendarCheck}
                    title="No bookings found"
                    subtitle="Try adjusting your search or filters"
                    action={
                      onClearFilters && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={onClearFilters}
                        >
                          Clear Filters
                        </Button>
                      )
                    }
                  />
                </td>
              </tr>
            ) : (
              data.map((booking, i) => (
                <motion.tr
                  key={booking.id}
                  className={clsx(
                    "border-b border-border/50 last:border-0 cursor-pointer",
                    "hover:bg-gold/[0.02] transition-colors",
                    selected.has(booking.id) && "bg-gold/[0.04]",
                  )}
                  style={
                    selected.has(booking.id)
                      ? { borderLeft: "2px solid #D4AF37" }
                      : {}
                  }
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  onClick={() => onView(booking)}
                >
                  {/* Checkbox */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="appearance-none w-3.5 h-3.5 rounded border border-border
                               bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors"
                      checked={selected.has(booking.id)}
                      onChange={() => onToggleSelect(booking.id)}
                      aria-label={`Select ${booking.bookingId}`}
                    />
                  </td>

                  {/* Dynamic columns */}
                  {visibleCols.map((col) => (
                    <td
                      key={col.id}
                      className="px-4 py-3 text-xs text-text-muted align-middle"
                    >
                      {col.id === "bookingId" && (
                        <span className="font-bold text-gold text-[11px]">
                          {booking.bookingId}
                        </span>
                      )}

                      {col.id === "customer" && (
                        <div>
                          <p className="text-xs font-bold text-text-primary leading-tight">
                            {booking.customerName}
                          </p>
                          <p className="text-[10px] text-text-subtle mt-0.5">
                            {booking.customerMobile}
                          </p>
                        </div>
                      )}

                      {col.id === "car" && (
                        <div>
                          <p className="text-xs font-semibold text-text-primary">
                            {booking.carName}
                          </p>
                          <p className="text-[10px] text-text-subtle mt-0.5">
                            {booking.carPlate}
                          </p>
                        </div>
                      )}

                      {col.id === "datetime" && (
                        <div>
                          <p className="text-xs font-semibold text-text-primary">
                            {formatDateTime(booking)}
                          </p>
                          <p className="text-[10px] text-text-subtle mt-0.5">
                            {booking.time}
                          </p>
                        </div>
                      )}

                      {col.id === "exec" && (booking.exec || "—")}
                      {col.id === "location" && (booking.location || "—")}
                      {col.id === "duration" && (booking.duration || "—")}
                      {col.id === "status" && <Badge status={booking.status} />}
                    </td>
                  ))}

                  {/* Actions */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {/* Approve — only for pending */}
                      {booking.status === "pending" && (
                        <button
                          onClick={() => onApprove(booking)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-emerald-400 hover:border-emerald-400/40
                                   hover:bg-emerald-400/8 transition-all"
                          title="Approve"
                          aria-label={`Approve ${booking.bookingId}`}
                        >
                          <Check size={12} />
                        </button>
                      )}
                      {/* Reject — only for pending */}
                      {booking.status === "pending" && (
                        <button
                          onClick={() => onReject(booking)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-rose-400 hover:border-rose-400/40
                                   hover:bg-rose-400/8 transition-all"
                          title="Reject"
                          aria-label={`Reject ${booking.bookingId}`}
                        >
                          <XIcon size={12} />
                        </button>
                      )}
                      {/* View */}
                      <button
                        onClick={() => onView(booking)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                 text-text-subtle hover:text-sky-accent hover:border-sky-accent/40
                                 hover:bg-sky-accent/8 transition-all"
                        title="View"
                        aria-label={`View ${booking.bookingId}`}
                      >
                        <Eye size={12} />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => onEdit(booking)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                 text-text-subtle hover:text-gold hover:border-gold/40
                                 hover:bg-gold/8 transition-all"
                        title="Edit"
                        aria-label={`Edit ${booking.bookingId}`}
                      >
                        <Edit size={12} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => onDelete(booking)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                 text-text-subtle hover:text-rose-400 hover:border-rose-400/40
                                 hover:bg-rose-400/8 transition-all"
                        title="Delete"
                        aria-label={`Delete ${booking.bookingId}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        onPage={onPage}
      />
    </div>
  );
}

export default TestDriveTable;
