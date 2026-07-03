// src/components/service/ServiceTable.jsx
// Service work order table.
// Same architectural pattern as InventoryTable/CustomerTable.
// Columns: WO ID, Vehicle, Type, Technician, Status, Cost, Start Date, Actions

import { motion } from "framer-motion";
import {
  Wrench,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Car,
} from "lucide-react";
import { EmptyState, Button } from "../ui";
import clsx from "clsx";

// ── Status styles ─────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  pending: "text-amber-400   bg-amber-400/10   border-amber-400/20",
  in_progress: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelled: "text-text-subtle bg-text-subtle/10 border-border",
};

const STATUS_LABEL = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ── Type badge colors ─────────────────────────────────────────────────────────
const TYPE_COLOR = {
  "Routine Maintenance": "text-gold        bg-gold/10        border-gold/20",
  Repair: "text-rose-400    bg-rose-400/10    border-rose-400/20",
  Inspection: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  Detailing: "text-violet-400  bg-violet-400/10  border-violet-400/20",
  "Tyre Change": "text-amber-400   bg-amber-400/10   border-amber-400/20",
  "Oil Change": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Custom: "text-text-muted  bg-border/30      border-border",
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
    <div
      className="flex items-center justify-between px-4 py-3
                    border-t border-border flex-shrink-0"
    >
      <p className="text-[10px] text-text-subtle">
        {total === 0
          ? "No work orders found"
          : `Showing ${start}–${end} of ${total} orders`}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg border border-border flex items-center
                     justify-center text-text-muted hover:text-gold
                     hover:border-gold/30 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`e${i}`}
              className="w-7 h-7 flex items-center justify-center
                         text-text-subtle text-xs"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
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
          className="w-7 h-7 rounded-lg border border-border flex items-center
                     justify-center text-text-muted hover:text-gold
                     hover:border-gold/30 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function ServiceTable({
  data = [],
  total = 0,
  page = 1,
  perPage = 10,
  onPage,
  sortField,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete,
  onClearFilters,
}) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden
                    flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-auto scrollbar-none">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed", minWidth: "860px" }}
        >
          <colgroup>
            <col style={{ width: "120px", minWidth: "120px" }} /> {/* sticky */}
            <col style={{ width: "220px", minWidth: "180px" }} />
            <col style={{ width: "160px", minWidth: "130px" }} />
            <col style={{ width: "160px", minWidth: "130px" }} />
            <col style={{ width: "120px", minWidth: "100px" }} />
            <col style={{ width: "130px", minWidth: "110px" }} />
            <col style={{ width: "110px", minWidth: "100px" }} />
            <col style={{ width: "120px", minWidth: "100px" }} />
          </colgroup>

          <thead>
            <tr className="bg-[rgba(212,175,55,0.02)] border-b border-border">
              {/* Work Order ID — STICKY on mobile horizontal scroll */}
              <th
                onClick={() => onSort("workOrderId")}
                className="px-4 py-3 text-left text-[9px] font-bold
                           tracking-[0.2em] text-text-subtle uppercase
                           whitespace-nowrap select-none cursor-pointer
                           hover:text-text-muted
                           sticky left-0 z-10
                           bg-[rgba(13,21,38,0.98)]
                           border-r border-border"
              >
                Work Order
                <SortIcon active={sortField === "workOrderId"} dir={sortDir} />
              </th>
              {[
                { id: "vehicleName", label: "Vehicle" },
                { id: "type", label: "Type" },
                { id: "technicianName", label: "Technician" },
                { id: "status", label: "Status" },
                { id: "estimatedCost", label: "Est. Cost" },
                { id: "startDate", label: "Start Date" },
              ].map((col) => (
                <th
                  key={col.id}
                  onClick={() => onSort(col.id)}
                  className="px-4 py-3 text-left text-[9px] font-bold
                             tracking-[0.2em] text-text-subtle uppercase
                             whitespace-nowrap select-none cursor-pointer
                             hover:text-text-muted"
                >
                  {col.label}
                  <SortIcon active={sortField === col.id} dir={sortDir} />
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

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={Wrench}
                    title="No work orders found"
                    subtitle="Try adjusting your filters or create a new work order"
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
              data.map((order, i) => (
                <motion.tr
                  key={order.id}
                  className="border-b border-border last:border-0 cursor-pointer
                             hover:bg-gold/[0.02] transition-colors"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onView(order)}
                >
                  {/* Work Order ID */}
                  <td
                    className="px-4 py-3 sticky left-0 z-10
                               bg-card border-r border-border"
                  >
                    <span className="text-xs font-bold text-gold font-mono">
                      {order.workOrderId}
                    </span>
                  </td>

                  {/* Vehicle */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {order.vehicleImage ? (
                        <img
                          src={order.vehicleImage}
                          alt={order.vehicleName}
                          className="w-10 h-7 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="w-10 h-7 rounded-lg bg-border/40
                                        flex items-center justify-center flex-shrink-0"
                        >
                          <Car size={12} className="text-text-subtle" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {order.vehicleName}
                        </p>
                        <p className="text-[10px] text-text-subtle">
                          {order.vehiclePlate}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "text-[10px] font-bold px-2 py-1 rounded-full border",
                        TYPE_COLOR[order.type] || TYPE_COLOR["Custom"],
                      )}
                    >
                      {order.type}
                    </span>
                  </td>

                  {/* Technician */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-muted">
                      {order.technicianName || (
                        <span className="text-amber-400/70 text-[10px]">
                          Unassigned
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "text-[10px] font-bold uppercase tracking-wide",
                        "px-2 py-1 rounded-full border",
                        STATUS_STYLE[order.status],
                      )}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>

                  {/* Estimated cost */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-text-muted">
                      AED {Number(order.estimatedCost || 0).toLocaleString()}
                    </span>
                    {order.actualCost != null && (
                      <p className="text-[9px] text-emerald-400 mt-0.5">
                        Actual: AED {Number(order.actualCost).toLocaleString()}
                      </p>
                    )}
                  </td>

                  {/* Start date */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-subtle">
                      {order.startDate
                        ? new Date(order.startDate).toLocaleDateString(
                            "en-AE",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView(order)}
                        className="w-7 h-7 rounded-lg border border-border
                                   flex items-center justify-center text-text-subtle
                                   hover:text-sky-accent hover:border-sky-accent/40
                                   hover:bg-sky-accent/8 transition-all"
                        title="View details"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => onEdit(order)}
                        className="w-7 h-7 rounded-lg border border-border
                                   flex items-center justify-center text-text-subtle
                                   hover:text-gold hover:border-gold/40
                                   hover:bg-gold/8 transition-all"
                        title="Edit work order"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => onDelete(order)}
                        className="w-7 h-7 rounded-lg border border-border
                                   flex items-center justify-center text-text-subtle
                                   hover:text-rose-400 hover:border-rose-400/40
                                   hover:bg-rose-400/8 transition-all"
                        title="Delete work order"
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

export default ServiceTable;
