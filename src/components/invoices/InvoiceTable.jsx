// src/components/invoices/InvoiceTable.jsx

import { motion } from "framer-motion";
import {
  FileText,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Download,
  Send,
} from "lucide-react";
import { Badge, EmptyState, Button } from "../ui";
import clsx from "clsx";

const COL_WIDTH = {
  invoiceId: "90px",
  customer: "180px",
  amount: "140px",
  status: "180px",
  method: "110px",
  dueDate: "110px",
  issuedDate: "110px",
  car: "160px",
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
          ? "No invoices found"
          : `Showing ${start}–${end} of ${total} invoices`}
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

function InvoiceTable({
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
  onDownloadPDF,
  onSend,
  activeInvoiceId,
  onClearFilters,
}) {
  const visibleCols = columns.filter((c) => c.visible);
  const allSelected =
    data.length > 0 && data.every((inv) => selected.has(inv.id));
  const totalPages = Math.ceil(total / perPage);

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d + "T00:00:00").toLocaleDateString("en-AE", {
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
          style={{ tableLayout: "fixed", minWidth: "650px" }}
        >
          <colgroup>
            <col style={{ width: "50px" }} />
            {visibleCols.map((col) => (
              <col key={col.id} style={{ width: COL_WIDTH[col.id] }} />
            ))}
            <col style={{ width: "140px" }} />
          </colgroup>

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

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2}>
                  <EmptyState
                    icon={FileText}
                    title="No invoices found"
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
              data.map((inv, i) => {
                const isActive = inv.id === activeInvoiceId;
                const isOverdue = inv.status === "overdue";

                return (
                  <motion.tr
                    key={inv.id}
                    className={clsx(
                      "border-b border-border last:border-0 cursor-pointer transition-colors",
                      isActive ? "bg-gold/[0.05]" : "hover:bg-gold/[0.02]",
                      selected.has(inv.id) && "bg-gold/[0.04]",
                    )}
                    style={{
                      borderLeft: isActive
                        ? "2px solid #D4AF37"
                        : selected.has(inv.id)
                          ? "2px solid #D4AF37"
                          : undefined,
                    }}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025 }}
                    onClick={() => onView(inv)}
                  >
                    <td
                      className="px-4 py-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="appearance-none w-3.5 h-3.5 rounded border border-border
                                 bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors"
                        checked={selected.has(inv.id)}
                        onChange={() => onToggleSelect(inv.id)}
                        aria-label={`Select ${inv.invoiceId}`}
                      />
                    </td>

                    {visibleCols.map((col) => (
                      <td
                        key={col.id}
                        className="px-4 py-3 text-xs text-text-muted align-middle"
                      >
                        {col.id === "invoiceId" && (
                          <span className="font-bold text-gold text-[11px]">
                            {inv.invoiceId}
                          </span>
                        )}

                        {col.id === "customer" && (
                          <div>
                            <p className="text-xs font-bold text-text-primary leading-tight">
                              {inv.customerName}
                            </p>
                            <p className="text-[10px] text-text-subtle mt-0.5">
                              {inv.customerEmail}
                            </p>
                          </div>
                        )}

                        {col.id === "amount" &&
                          (() => {
                            const subtotal = inv.items.reduce(
                              (s, item) => s + item.qty * item.unitPrice,
                              0,
                            );
                            const vat = Math.round(
                              ((subtotal - inv.discount) * inv.vatRate) / 100,
                            );
                            const total = subtotal - inv.discount + vat;
                            return (
                              <div>
                                <p className="font-bold text-text-primary">
                                  {total.toLocaleString()}
                                  <span className="text-[10px] text-text-subtle ml-1">
                                    AED
                                  </span>
                                </p>
                                {inv.discount > 0 && (
                                  <p className="text-[10px] text-emerald-400 mt-0.5">
                                    −{inv.discount.toLocaleString()} disc.
                                  </p>
                                )}
                              </div>
                            );
                          })()}

                        {col.id === "status" && <Badge status={inv.status} />}

                        {col.id === "method" && inv.method}

                        {col.id === "dueDate" && (
                          <span
                            className={clsx(
                              "text-xs",
                              isOverdue
                                ? "text-rose-400 font-semibold"
                                : "text-text-muted",
                            )}
                          >
                            {fmtDate(inv.dueDate)}
                          </span>
                        )}

                        {col.id === "issuedDate" && fmtDate(inv.issuedDate)}

                        {col.id === "car" && (
                          <div>
                            <p className="text-xs text-text-primary">
                              {inv.carName}
                            </p>
                            <p className="text-[10px] text-text-subtle mt-0.5">
                              {inv.carPlate}
                            </p>
                          </div>
                        )}
                      </td>
                    ))}

                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Download PDF */}
                        <button
                          onClick={() => onDownloadPDF(inv)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-violet-400 hover:border-violet-400/40
                                   hover:bg-violet-400/8 transition-all"
                          title="Download PDF"
                          aria-label={`Download PDF ${inv.invoiceId}`}
                        >
                          <Download size={12} />
                        </button>
                        {/* Send */}
                        <button
                          onClick={() => onSend(inv)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-sky-accent hover:border-sky-accent/40
                                   hover:bg-sky-accent/8 transition-all"
                          title="Send invoice"
                          aria-label={`Send ${inv.invoiceId}`}
                        >
                          <Send size={12} />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => onEdit(inv)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-gold hover:border-gold/40
                                   hover:bg-gold/8 transition-all"
                          title="Edit invoice"
                          aria-label={`Edit ${inv.invoiceId}`}
                        >
                          <Edit size={12} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => onDelete(inv)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-rose-400 hover:border-rose-400/40
                                   hover:bg-rose-400/8 transition-all"
                          title="Delete invoice"
                          aria-label={`Delete ${inv.invoiceId}`}
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

export default InvoiceTable;
