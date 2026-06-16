// src/components/inventory/InventoryTable.jsx
//
// The main data table for inventory.
// Handles: column rendering, sort headers, row selection,
//          action buttons, empty state, and pagination.
//
// Props:
//   data          → array of car objects to display
//   columns       → visible column config from ColumnManager
//   total         → total filtered count (for pagination info)
//   page, onPage  → current page + setter
//   perPage       → rows per page
//   selected      → Set of selected car IDs
//   onToggleSelect, onSelectAll
//   sortField, sortDir, onSort
//   onView, onEdit, onDelete

import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Eye, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Badge, EmptyState, Button } from "../ui";
import clsx from "clsx";

// ── Column width map ─────────────────────────────────────────────────────────
const COL_WIDTH = {
  image: "80px",
  car: "290px", // flex — takes remaining space
  status: "160px",
  price: "160px",
  fuel: "100px",
  mileage: "100px",
  transmission: "160px",
  plate: "110px",
  year: "100px",
  category: "100px",
};

// ── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ active, dir }) {
  if (!active)
    return <span className="ml-1 text-text-subtle/25 text-[10px]">↕</span>;
  return dir === "asc" ? (
    <ChevronUp size={11} className="ml-0.5 text-gold inline" />
  ) : (
    <ChevronDown size={11} className="ml-0.5 text-gold inline" />
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
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
          ? "No cars found"
          : `Showing ${start}–${end} of ${total} cars`}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                     text-text-muted hover:text-gold hover:border-gold/30 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="w-7 h-7 flex items-center justify-center
                                                    text-text-subtle text-xs"
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
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function CarThumbnail({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className="w-11 h-10 rounded-lg bg-base border border-border
                      flex items-center justify-center text-xl flex-shrink-0"
      >
        🚗
      </div>
    );
  }

  return (
    <div className="w-11 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// ── Main Table ────────────────────────────────────────────────────────────────
function InventoryTable({
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
  onClearFilters,
}) {
  const visibleCols = columns.filter((c) => c.visible);
  const allSelected = data.length > 0 && data.every((c) => selected.has(c.id));
  const totalPages = Math.ceil(total / perPage);

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden
                    flex flex-col flex-1 min-h-0"
    >
      {/* ── Scrollable table area ── */}
      <div className="flex-1 overflow-auto scrollbar-none ">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed", minWidth: "680px" }}
        >
          {/* Column widths */}
          <colgroup>
            <col style={{ width: "50px" }} />
            {visibleCols.map((col) => (
              <col key={col.id} style={{ width: COL_WIDTH[col.id] }} />
            ))}
            <col style={{ width: "140px" }} />
          </colgroup>

          {/* ── Header ── */}
          <thead>
            <tr className="bg-[rgba(212,175,55,0.02)] border-b border-border">
              {/* Select-all checkbox */}
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="appearance-none w-3.5 h-3.5 rounded border border-border bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors  "
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  aria-label="Select all rows"
                />
              </th>

              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  className={clsx(
                    "px-4 py-3 text-left text-[9px] font-bold tracking-[0.2em]",
                    "text-text-subtle uppercase whitespace-nowrap select-none",
                    col.id !== "image" &&
                      "cursor-pointer hover:text-text-muted",
                  )}
                  onClick={() => col.id !== "image" && onSort(col.id)}
                >
                  {col.label}
                  {col.id !== "image" && (
                    <SortIcon active={sortField === col.id} dir={sortDir} />
                  )}
                </th>
              ))}

              <th
                className="px-4 py-3 text-right text-[9px] font-bold
                             tracking-[0.2em] text-text-subtle uppercase"
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2}>
                  <EmptyState
                    icon={Car}
                    title="No cars found"
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
              data.map((car, i) => (
                <motion.tr
                  key={car.id}
                  className={clsx(
                    "border-b border-border last:border-0 cursor-pointer ",
                    "hover:bg-gold/[0.02] transition-colors ",
                    selected.has(car.id) && "bg-gold/[0.04]",
                  )}
                  style={
                    selected.has(car.id)
                      ? { borderLeft: "2px solid #D4AF37" }
                      : {}
                  }
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  onClick={() => onView(car)}
                >
                  {/* Row checkbox */}
                  <td
                    className="px-4 py-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="appearance-none w-3.5 h-3.5 rounded border border-border bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors "
                      checked={selected.has(car.id)}
                      onChange={() => onToggleSelect(car.id)}
                      aria-label={`Select ${car.brand} ${car.model}`}
                    />
                  </td>

                  {/* Dynamic columns */}
                  {visibleCols.map((col) => (
                    <td
                      key={col.id}
                      className="px-4 py-3 text-xs text-text-muted align-middle"
                    >
                      {/* Image thumbnail */}

                      {col.id === "image" && (
                        <CarThumbnail
                          src={(car.images?.[0] || car.photos?.[0])?.url}
                          alt={`${car.brand} ${car.model}`}
                        />
                      )}

                      {/* Car name + meta */}
                      {col.id === "car" && (
                        <div>
                          <p className="text-xs font-bold text-text-primary  ">
                            {car.brand} {car.model}
                          </p>
                          <p className="text-[12px] text-text-subtle mt-1.5 ">
                            {car.year} · {car.bodyType} · {car.plate}
                          </p>
                        </div>
                      )}

                      {/* Status badge */}
                      {col.id === "status" && <Badge status={car.status} />}

                      {/* Price with discount */}
                      {col.id === "price" && (
                        <div>
                          <p className="font-bold text-text-primary">
                            {Number(car.price).toLocaleString()}
                            <span className="text-[10px] text-text-subtle ml-1">
                              {car.currency || "AED"}
                            </span>
                          </p>
                          {Number(car.discount) > 0 && (
                            <p className="text-[10px] text-emerald-400 mt-1.5">
                              −{Number(car.discount).toLocaleString()} off
                            </p>
                          )}
                        </div>
                      )}

                      {col.id === "fuel" && (car.fuel || car.fuelType || "—")}
                      {col.id === "mileage" &&
                        `${Number(car.mileage || 0).toLocaleString()} km`}
                      {col.id === "transmission" && (car.transmission || "—")}
                      {col.id === "plate" && (car.plate || "—")}
                      {col.id === "year" && (car.year || "—")}
                      {col.id === "category" &&
                        (car.bodyType || car.category || "—")}
                    </td>
                  ))}

                  {/* Row action buttons */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {/* View — blue */}
                      <button
                        onClick={() => onView(car)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-sky-accent hover:border-sky-accent/40
                                   hover:bg-sky-accent/8 transition-all"
                        title="View details"
                        aria-label={`View ${car.brand} ${car.model}`}
                      >
                        <Eye size={12} />
                      </button>

                      {/* Edit — gold */}
                      <button
                        onClick={() => onEdit(car)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-gold hover:border-gold/40
                                   hover:bg-gold/8 transition-all"
                        title="Edit car"
                        aria-label={`Edit ${car.brand} ${car.model}`}
                      >
                        <Edit size={12} />
                      </button>

                      {/* Delete — red */}
                      <button
                        onClick={() => onDelete(car)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-rose-400 hover:border-rose-400/40
                                   hover:bg-rose-400/8 transition-all"
                        title="Delete car"
                        aria-label={`Delete ${car.brand} ${car.model}`}
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

      {/* ── Pagination ── */}
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

export default InventoryTable;
