// src/components/invoices/InvoiceBottomSheet.jsx
// Mobile-only bottom sheet for invoice preview.
// Slides up from the bottom on mobile when a table row is tapped.
// Hidden on lg+ (desktop uses the side panel instead).

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Send, Edit, Minus } from "lucide-react";
import { Button } from "../ui";
import { calcInvoice } from "../../data/mockData";
import clsx from "clsx";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtAED = (n) => Number(n || 0).toLocaleString();
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Item type pill
const TYPE_BG = {
  car: "bg-gold/10 text-gold",
  service: "bg-sky-accent/10 text-sky-accent",
  custom: "bg-violet-400/10 text-violet-400",
};

function InvoiceBottomSheet({
  invoice,
  isOpen,
  onClose,
  onEdit,
  onDownloadPDF,
  onSend,
}) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!invoice) return null;

  const { subtotal, afterDisc, vat, total } = calcInvoice(
    invoice.items,
    invoice.discount,
    invoice.vatRate,
  );

  // Status color
  const statusColor =
    {
      paid: "text-emerald-400",
      overdue: "text-rose-400",
      sent: "text-sky-accent",
      draft: "text-text-subtle",
      partially_paid: "text-violet-400",
      cancelled: "text-text-subtle",
      refunded: "text-amber-400",
    }[invoice.status] || "text-text-muted";

  return (
    // Only renders on mobile — hidden on lg+
    <div className="lg:hidden">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50
                         bg-card border-t border-border rounded-t-3xl
                         flex flex-col shadow-glass"
              style={{ maxHeight: "90vh" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3
                              border-b border-border flex-shrink-0"
              >
                <div>
                  <p className="text-sm font-extrabold text-text-primary">
                    {invoice.invoiceId}
                  </p>
                  <p
                    className={clsx(
                      "text-[10px] font-semibold capitalize mt-0.5",
                      statusColor,
                    )}
                  >
                    {invoice.status.replace("_", " ")}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
                             text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all"
                  aria-label="Close preview"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-4">
                {/* Invoice rendered as white card */}
                <div
                  className="bg-white rounded-2xl p-4 mb-4"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "#0F172A",
                  }}
                >
                  {/* Brand header */}
                  <div
                    className="flex items-center justify-between mb-4 pb-3"
                    style={{ borderBottom: "1px solid #E2E8F0" }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 flex items-center justify-center text-[9px]
                                    font-black text-[#0B0F14]"
                        style={{
                          background: "linear-gradient(135deg,#B8931F,#D4AF37)",
                          clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
                        }}
                      >
                        GT
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#D4AF37",
                            letterSpacing: "2px",
                          }}
                        >
                          Apex DriveOS
                        </p>
                        <p
                          style={{
                            fontSize: "8px",
                            color: "#64748B",
                            letterSpacing: "1px",
                          }}
                        >
                          LUXURY AUTOMOTIVE
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "#0F172A",
                        }}
                      >
                        {invoice.invoiceId}
                      </p>
                      <p
                        style={{
                          fontSize: "9px",
                          color: "#94A3B8",
                          marginTop: "2px",
                        }}
                      >
                        Due: {fmtDate(invoice.dueDate)}
                      </p>
                    </div>
                  </div>

                  {/* Bill to */}
                  <div className="mb-4">
                    <p
                      style={{
                        fontSize: "8px",
                        fontWeight: 700,
                        color: "#94A3B8",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      Bill To
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#0F172A",
                      }}
                    >
                      {invoice.customerName}
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#64748B",
                        marginTop: "2px",
                      }}
                    >
                      {invoice.customerEmail} · {invoice.method}
                    </p>
                  </div>

                  {/* Line items */}
                  <div
                    style={{
                      borderTop: "1px solid #F1F5F9",
                      paddingTop: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    {invoice.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between mb-2"
                      >
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#1E293B",
                            }}
                          >
                            {item.desc}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              style={{
                                fontSize: "8px",
                                fontWeight: 700,
                                padding: "1px 5px",
                                borderRadius: "3px",
                                background:
                                  item.type === "car"
                                    ? "#FFF9E6"
                                    : item.type === "service"
                                      ? "#E0F2FE"
                                      : "#F3E8FF",
                                color:
                                  item.type === "car"
                                    ? "#92400E"
                                    : item.type === "service"
                                      ? "#075985"
                                      : "#6B21A8",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {item.type}
                            </span>
                            <span style={{ fontSize: "9px", color: "#94A3B8" }}>
                              Qty: {item.qty}
                            </span>
                          </div>
                        </div>
                        <p
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#1E293B",
                            flexShrink: 0,
                            marginLeft: "8px",
                          }}
                        >
                          AED {fmtAED(item.qty * item.unitPrice)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div
                    style={{
                      borderTop: "1px solid #E2E8F0",
                      paddingTop: "10px",
                    }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <span style={{ fontSize: "11px", color: "#475569" }}>
                        Subtotal
                      </span>
                      <span style={{ fontSize: "11px", color: "#1E293B" }}>
                        AED {fmtAED(subtotal)}
                      </span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontSize: "11px", color: "#059669" }}>
                          Discount
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#059669",
                            fontWeight: 600,
                          }}
                        >
                          − AED {fmtAED(invoice.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between mb-2">
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#D4AF37",
                          fontWeight: 600,
                        }}
                      >
                        VAT ({invoice.vatRate}%)
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#D4AF37",
                          fontWeight: 600,
                        }}
                      >
                        AED {fmtAED(vat)}
                      </span>
                    </div>
                    <div
                      className="flex justify-between pt-2"
                      style={{ borderTop: "1px solid #E2E8F0" }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "#0F172A",
                        }}
                      >
                        Total
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "#0F172A",
                        }}
                      >
                        AED {fmtAED(total)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "8px 10px",
                        background: "#F8FAFC",
                        borderRadius: "8px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "9px",
                          color: "#94A3B8",
                          marginBottom: "3px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        Notes
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#475569",
                          lineHeight: 1.6,
                        }}
                      >
                        {invoice.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex gap-2 px-5 py-4 border-t border-border flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => onDownloadPDF(invoice)}
                  className="!text-violet-400 !border-violet-400/30"
                >
                  <Download size={13} /> PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    onClose();
                    onEdit(invoice);
                  }}
                  className="!text-gold !border-gold/30"
                >
                  <Edit size={13} /> Edit
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    onSend(invoice);
                    onClose();
                  }}
                >
                  <Send size={13} /> Send
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InvoiceBottomSheet;
