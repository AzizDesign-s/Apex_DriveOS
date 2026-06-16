// src/components/customers/CustomerTable.jsx
// Same architecture as InventoryTable — columns, sort, select, actions

import { motion } from "framer-motion";
import {
  Users,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Crown,
} from "lucide-react";
import { Badge, EmptyState, Button } from "../ui";
import { AVATAR_PALETTE } from "../../data/mockData";
import clsx from "clsx";

const COL_WIDTH = {
  customer: "290px",
  status: "120px",
  mobile: "160px",
  source: "120px",
  purchases: "120px",
  spent: "120px",
  dob: "120px",
  instagram: "120px",
};

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ name, index }) {
  const { bg, text } = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center
                 text-xs font-bold flex-shrink-0 tracking-wide"
      style={{ background: bg, color: text }}
    >
      {initials}
    </div>
  );
}

// ── Sort icon ─────────────────────────────────────────────────────────────────
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
          ? "No customers found"
          : `Showing ${start}–${end} of ${total} customers`}
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

// ── Main table ────────────────────────────────────────────────────────────────
function CustomerTable({
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

  const totalSpent = (customer) =>
    customer.purchases?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const fmtDob = (dob) => {
    if (!dob) return "—";
    return new Date(dob).toLocaleDateString("en-AE", {
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
          style={{ tableLayout: "fixed", minWidth: "680px" }}
        >
          <colgroup>
            <col style={{ width: "50px" }} />
            {visibleCols.map((col) => (
              <col key={col.id} style={{ width: COL_WIDTH[col.id] }} />
            ))}
            <col style={{ width: "140px" }} />
          </colgroup>

          {/* Header */}
          <thead>
            <tr className="bg-[rgba(212,175,55,0.02)] border-b border-border">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="appearance-none w-3.5 h-3.5 rounded border border-border bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors  "
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-3 text-left text-[9px] font-bold tracking-[0.2em]
                             text-text-subtle uppercase whitespace-nowrap select-none cursor-pointer
                             hover:text-text-muted"
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
                    icon={Users}
                    title="No customers found"
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
              data.map((customer, i) => {
                const spent = totalSpent(customer);
                return (
                  <motion.tr
                    key={customer.id}
                    className={clsx(
                      "border-b border-border last:border-0 cursor-pointer",
                      "hover:bg-gold/[0.02] transition-colors",
                      selected.has(customer.id) && "bg-gold/[0.04]",
                    )}
                    style={
                      selected.has(customer.id)
                        ? { borderLeft: "2px solid #D4AF37" }
                        : {}
                    }
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onView(customer)}
                  >
                    {/* Checkbox */}
                    <td
                      className="px-4 py-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="appearance-none w-3.5 h-3.5 rounded border border-border bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors "
                        checked={selected.has(customer.id)}
                        onChange={() => onToggleSelect(customer.id)}
                        aria-label={`Select ${customer.name}`}
                      />
                    </td>

                    {/* Customer name + ID */}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar name={customer.name} index={i} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-text-primary">
                              {customer.name}
                            </p>
                            {customer.status === "vip" && (
                              <Crown
                                size={11}
                                className="text-gold flex-shrink-0"
                              />
                            )}
                          </div>
                          <p className="text-[10px] text-text-subtle mt-1.5">
                            {customer.customerId} · {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 align-middle">
                      <Badge status={customer.status} />
                    </td>

                    {/* Mobile */}
                    <td className="px-4 py-3 text-xs text-text-muted align-middle">
                      {customer.mobileCode} {customer.mobile}
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 text-xs text-text-muted align-middle">
                      {customer.source}
                    </td>

                    {/* Purchases count */}
                    <td className="px-4 py-3 text-xs align-middle">
                      {customer.purchases?.length > 0 ? (
                        <span className="font-semibold text-text-primary">
                          {customer.purchases.length}
                        </span>
                      ) : (
                        <span className="text-text-subtle">—</span>
                      )}
                    </td>

                    {/* Total spent */}
                    <td className="px-4 py-3 align-middle">
                      {spent > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-text-primary">
                            {spent >= 1000000
                              ? `${(spent / 1000000).toFixed(2)}M`
                              : spent.toLocaleString()}
                            <span className="text-[10px] text-text-subtle ml-1">
                              AED
                            </span>
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-text-subtle">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-text-muted align-middle">
                      {customer.dob}
                    </td>

                    <td className="px-4 py-3 text-xs text-text-muted align-middle">
                      {customer.instagram}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(customer)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-sky-accent hover:border-sky-accent/40
                                   hover:bg-sky-accent/8 transition-all"
                          title="View profile"
                          aria-label={`View ${customer.name}`}
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => onEdit(customer)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-gold hover:border-gold/40
                                   hover:bg-gold/8 transition-all"
                          title="Edit customer"
                          aria-label={`Edit ${customer.name}`}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => onDelete(customer)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-rose-400 hover:border-rose-400/40
                                   hover:bg-rose-400/8 transition-all"
                          title="Delete customer"
                          aria-label={`Delete ${customer.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
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

export default CustomerTable;
