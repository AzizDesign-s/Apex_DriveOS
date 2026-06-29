// src/components/invoices/InvoicePreview.jsx
//
// The PDF-style invoice preview panel — shown on the right side.
// NOTE: Built with clean data/layout separation so future
//       customizable styles can be plugged in by changing only
//       the inner template, not the data logic.

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Send, Edit, Printer, FileText } from "lucide-react";
import { Badge, Button } from "../ui";
import { calcInvoice } from "../../data/mockData";
import clsx from "clsx";

// ── Format helpers ────────────────────────────────────────────────────────────
const fmtAED = (n) => Number(n || 0).toLocaleString();
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-AE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ── Item type badge ───────────────────────────────────────────────────────────
const TYPE_STYLES = {
  car: "bg-gold/10 text-gold border-gold/20",
  service: "bg-sky-accent/10 text-sky-accent border-sky-accent/20",
  custom: "bg-violet-400/10 text-violet-400 border-violet-400/20",
};

function ItemTypeBadge({ type }) {
  return (
    <span
      className={clsx(
        "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border",
        TYPE_STYLES[type] || TYPE_STYLES.custom,
      )}
    >
      {type}
    </span>
  );
}

// ── The printable invoice template ───────────────────────────────────────────
// This is the part that will be swappable for future style variants.
// Data flows in as `invoice` prop — layout is fully decoupled.
function InvoiceTemplate({ invoice }) {
  const { subtotal, afterDisc, vat, total } = calcInvoice(
    invoice.items,
    invoice.discount,
    invoice.vatRate,
  );

  return (
    <div
      id="invoice-print-area"
      className="bg-white rounded-2xl p-6 text-[#0F172A]"
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-start justify-between mb-5 pb-4
                      border-b border-[#E2E8F0]"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center
                        text-[10px] font-black text-[#0B0F14]"
            style={{
              background: "linear-gradient(135deg,#B8931F,#D4AF37,#E8C84A)",
              clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
            }}
          >
            GT
          </div>
          <div>
            <p className="text-sm font-black tracking-[0.25em] text-[#D4AF37]">
              Apex DriveOS
            </p>
            <p className="text-[9px] tracking-[0.2em] text-[#64748B]">
              LUXURY AUTOMOTIVE · DUBAI
            </p>
          </div>
        </div>

        {/* Invoice meta */}
        <div className="text-right w-fit">
          <p className="text-xl font-extrabold text-[#0F172A]">
            {invoice.invoiceId}
          </p>
          <div className="mt-1">
            <span
              className={clsx(
                "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                invoice.status === "paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : invoice.status === "overdue"
                    ? "bg-rose-100 text-rose-800"
                    : invoice.status === "sent"
                      ? "bg-sky-100 text-sky-800"
                      : invoice.status === "draft"
                        ? "bg-slate-100 text-slate-600"
                        : invoice.status === "partially_paid"
                          ? "bg-violet-100 text-violet-800"
                          : invoice.status === "refunded"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600",
              )}
            >
              {invoice.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-[9px] text-[#94A3B8] mt-1.5">
            Issued: {fmtDate(invoice.issuedDate)}
          </p>
          <p
            className={clsx(
              "text-[9px] font-semibold mt-0.5",
              invoice.status === "overdue" ? "text-rose-600" : "text-[#64748B]",
            )}
          >
            Due: {fmtDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      {/* ── Bill From / To ── */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] text-[#94A3B8] uppercase mb-2">
            From
          </p>
          <p className="text-sm font-bold text-[#0F172A]">
            Apex DriveOS Cars LLC
          </p>
          <p className="text-[10px] text-[#64748B] leading-relaxed mt-1">
            Sheikh Zayed Road, Dubai
            <br />
            United Arab Emirates
            <br />
            TRN: 100432687000003
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] text-[#94A3B8] uppercase mb-2">
            Bill To
          </p>
          <p className="text-sm font-bold text-[#0F172A]">
            {invoice.customerName}
          </p>
          <p className="text-[10px] text-[#64748B] leading-relaxed mt-1">
            {invoice.customerEmail}
            <br />
            {invoice.customerId}
            <br />
            Payment: {invoice.method}
          </p>
        </div>
      </div>

      {/* ── Line Items ── */}
      <table
        className="w-full border-collapse mb-4"
        style={{ fontSize: "11px" }}
      >
        <thead>
          <tr
            style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}
          >
            {[
              "Description",
              "Type",
              "Qty",
              "Unit Price (AED)",
              "Total (AED)",
            ].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "7px 8px",
                  textAlign: i >= 2 ? "right" : "left",
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "#64748B",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
              <td style={{ padding: "8px", fontWeight: 600, color: "#1E293B" }}>
                {item.desc}
              </td>
              <td style={{ padding: "8px" }}>
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "2px 6px",
                    borderRadius: "4px",
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
                  }}
                >
                  {item.type}
                </span>
              </td>
              <td
                style={{ padding: "8px", textAlign: "right", color: "#475569" }}
              >
                {item.qty}
              </td>
              <td
                style={{ padding: "8px", textAlign: "right", color: "#475569" }}
              >
                {fmtAED(item.unitPrice)}
              </td>
              <td
                style={{
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: 700,
                  color: "#1E293B",
                }}
              >
                {fmtAED(item.qty * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(invoice.promotionLabel || invoice.discount > 0) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            marginBottom: "12px",
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.15)",
            borderRadius: "8px",
            fontSize: "10px",
            color: "#059669",
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: "12px" }}>🏷</span>
          <span>
            {invoice.promotionLabel || "Discount Applied"}
            {" — "}
            AED {fmtAED(invoice.promotionValue || invoice.discount)} off your
            total
          </span>
        </div>
      )}

      {/* ── Totals ── */}
      <div className="flex justify-end mb-5">
        <div className="w-52">
          <div className="border-t border-[#E2E8F0] pt-3 space-y-2">
            <div className="flex justify-between text-[11px] text-[#475569]">
              <span>Subtotal</span>
              <span>AED {fmtAED(subtotal)}</span>
            </div>
            {(invoice.discount > 0 || invoice.promotionValue > 0) && (
              <div className="flex justify-between text-[11px] text-emerald-600 font-semibold">
                <span className="flex items-center gap-1">
                  {/* Show promotion name if available, otherwise generic "Discount" */}
                  {invoice.promotionLabel
                    ? `🏷 ${invoice.promotionLabel}`
                    : "Discount"}
                </span>
                <span>
                  − AED {fmtAED(invoice.promotionValue || invoice.discount)}
                </span>
              </div>
            )}
            <div
              className="flex justify-between text-[11px] font-semibold"
              style={{ color: "#D4AF37" }}
            >
              <span>VAT ({invoice.vatRate}%)</span>
              <span>AED {fmtAED(vat)}</span>
            </div>
            <div
              className="flex justify-between text-sm font-extrabold text-[#0F172A]
                            border-t border-[#E2E8F0] pt-2 mt-2"
            >
              <span>Total</span>
              <span>AED {fmtAED(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer: Bank + QR ── */}
      <div
        className="flex items-end justify-between pt-3
                      border-t border-[#E2E8F0]"
      >
        <div className="flex items-start gap-3">
          {/* QR placeholder */}
          <div
            className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center
                          justify-center flex-shrink-0"
          >
            <FileText size={20} className="text-[#94A3B8]" />
          </div>
          <div style={{ fontSize: "9px", color: "#94A3B8", lineHeight: 1.7 }}>
            <p
              style={{ fontWeight: 700, color: "#64748B", marginBottom: "2px" }}
            >
              Bank Details
            </p>
            <p>Emirates NBD · IBAN: AE07 0260 0010 0246 8003 6</p>
            <p>SWIFT: EBILAEAD · Account: 1002468003-6</p>
          </div>
        </div>
        <div className="text-right">
          <p
            style={{
              fontSize: "10px",
              color: "#D4AF37",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            Thank you for your business
          </p>
          <p style={{ fontSize: "9px", color: "#94A3B8", marginTop: "2px" }}>
            Apex DriveOS Cars LLC · apexdriveos.ae
          </p>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <p
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: "4px",
            }}
          >
            Notes
          </p>
          <p style={{ fontSize: "10px", color: "#475569", lineHeight: 1.6 }}>
            {invoice.notes}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main InvoicePreview panel ─────────────────────────────────────────────────
function InvoicePreview({ invoice, onEdit, onDownloadPDF, onSend }) {
  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden
                    flex flex-col h-full"
    >
      {/* Preview header */}
      <div
        className="flex items-center justify-between px-4 py-3
                      border-b border-border flex-shrink-0"
      >
        <p className="text-xs font-bold text-text-primary flex items-center gap-2">
          <FileText size={14} className="text-gold" />
          {invoice ? invoice.invoiceId : "Invoice Preview"}
        </p>
        {invoice && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDownloadPDF(invoice)}
              className="!px-2.5 !py-1.5 !text-[10px]"
            >
              <Download size={12} /> PDF
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSend(invoice)}
              className="!px-2.5 !py-1.5 !text-[10px]"
            >
              <Send size={12} /> Send
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(invoice)}
              className="!px-2.5 !py-1.5 !text-[10px] !border-gold/30 !text-gold"
            >
              <Edit size={12} /> Edit
            </Button>
          </div>
        )}
      </div>

      {/* Scrollable invoice */}
      <div className="flex-1 overflow-y-auto scrollbar-none p-3">
        <AnimatePresence mode="wait">
          {invoice ? (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <InvoiceTemplate invoice={invoice} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div
                className="w-14 h-14 rounded-2xl bg-gold/5 border border-gold/10
                              flex items-center justify-center mb-4"
              >
                <FileText size={22} className="text-text-subtle/30" />
              </div>
              <p className="text-sm font-semibold text-text-muted">
                Select an invoice
              </p>
              <p className="text-xs text-text-subtle mt-1">
                Click any row to preview
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InvoicePreview;
