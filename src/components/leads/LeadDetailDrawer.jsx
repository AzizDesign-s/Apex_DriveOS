// src/components/leads/LeadDetailDrawer.jsx
// Right-side drawer showing full lead details.
// Same chrome pattern as CustomerDetailDrawer / UserDetailDrawer.
//
// SECTIONS:
//   — Header: name, source badge, status badge, close button
//   — KPI pills: days active, stage, assigned exec
//   — Contact info: phone, email
//   — Interested vehicle: image + details
//   — Notes
//   — Lead timeline: creation → status changes (from lead.timeline)
//   — Footer actions: Edit | Move Stage | Mark Lost
//
// STAGE QUICK-MOVE:
//   Buttons to advance or revert the lead stage without
//   opening the form — the most common action a sales exec takes.

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Phone,
  Mail,
  Calendar,
  User,
  Car,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../ui";
import { LEAD_COLUMNS } from "../../data/mockLeads";
import clsx from "clsx";

// ── Source badge colors (same as LeadCard) ────────────────────────────────────
const SOURCE_STYLE = {
  Website: "bg-sky-accent/10   text-sky-accent   border-sky-accent/20",
  "Walk-in": "bg-emerald-400/10  text-emerald-400  border-emerald-400/20",
  WhatsApp: "bg-emerald-500/10  text-emerald-400  border-emerald-500/20",
  Instagram: "bg-violet-400/10   text-violet-400   border-violet-400/20",
  Referral: "bg-gold/10         text-gold         border-gold/20",
  Phone: "bg-amber-400/10    text-amber-400    border-amber-400/20",
};

function daysSince(dateStr) {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day";
  return `${diff} days`;
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="bg-base border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={10} className="text-text-subtle" />}
        <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase">
          {label}
        </p>
      </div>
      <p className="text-xs font-semibold text-text-primary">{value || "—"}</p>
    </div>
  );
}

function KpiPill({ label, value, color = "text-text-primary" }) {
  return (
    <div className="bg-base border border-border rounded-xl p-3 text-center">
      <p
        className="text-[9px] font-bold tracking-[0.15em] text-text-subtle
                    uppercase mb-1.5"
      >
        {label}
      </p>
      <p className={clsx("text-sm font-extrabold", color)}>{value}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p
      className="text-[9px] font-bold tracking-[0.2em] text-text-subtle
                  uppercase mb-3 pb-2 border-b border-border mt-5 first:mt-0"
    >
      {children}
    </p>
  );
}

function LeadDetailDrawer({
  lead,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onMarkLost,
}) {
  if (!lead) return null;

  const currentCol = LEAD_COLUMNS.find((c) => c.id === lead.status);
  const currentIdx = LEAD_COLUMNS.findIndex((c) => c.id === lead.status);
  const nextCol = LEAD_COLUMNS[currentIdx + 1];
  const sourceStyle =
    SOURCE_STYLE[lead.source] || "bg-border text-text-muted border-border";

  const isTerminal = lead.status === "won" || lead.status === "lost";

  // ── Stage pipeline visual ─────────────────────────────────────────────────
  const PipelineTrack = () => (
    <div className="flex items-center gap-1 mb-4 flex-wrap">
      {LEAD_COLUMNS.map((col, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isFuture = i > currentIdx;
        return (
          <div key={col.id} className="flex items-center gap-1">
            <div
              className={clsx(
                "flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-bold",
                "uppercase tracking-wide border transition-all",
                isCurrent && "border-current",
                isPast &&
                  "border-emerald-400/30 text-emerald-400 bg-emerald-400/8",
                isCurrent && "text-white",
                isFuture && "border-border text-text-subtle/40 bg-transparent",
              )}
              style={
                isCurrent
                  ? {
                      borderColor: col.color,
                      background: `${col.color}20`,
                      color: col.color,
                    }
                  : {}
              }
            >
              {isPast && <CheckCircle2 size={8} />}
              {col.label}
            </div>
            {i < LEAD_COLUMNS.length - 1 && (
              <ArrowRight
                size={8}
                className="text-text-subtle/30 flex-shrink-0"
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 lg:w-[420px] w-11/12 z-40
                       bg-card border-l border-border flex flex-col shadow-glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* ── Drawer header ── */}
            <div
              className="flex items-start gap-3 px-4 py-4 border-b
                            border-border flex-shrink-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-text-primary truncate">
                    {lead.name}
                  </h3>
                  <span
                    className={clsx(
                      "text-[9px] font-bold uppercase tracking-wide px-2 py-0.5",
                      "rounded-full border flex-shrink-0",
                      sourceStyle,
                    )}
                  >
                    {lead.source}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-text-subtle">
                    {lead.leadId}
                  </span>
                  <span className="text-text-subtle/40">·</span>
                  {/* Current stage badge */}
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide
                               px-2 py-0.5 rounded-full border"
                    style={{
                      borderColor: `${currentCol?.color}40`,
                      color: currentCol?.color,
                      background: `${currentCol?.color}15`,
                    }}
                  >
                    {currentCol?.label || lead.status}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-border flex items-center
                           justify-center text-text-muted hover:text-rose-400
                           hover:border-rose-400/40 transition-all flex-shrink-0"
                aria-label="Close drawer"
              >
                <X size={13} />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
              {/* Pipeline track */}
              <PipelineTrack />

              {/* KPI pills */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <KpiPill
                  label="Age"
                  value={daysSince(lead.createdAt)}
                  color="text-text-primary"
                />
                <KpiPill
                  label="Stage"
                  value={currentCol?.label || "—"}
                  color="text-gold"
                />
                <KpiPill
                  label="Exec"
                  value={lead.assignedExec || "None"}
                  color={
                    lead.assignedExec ? "text-text-primary" : "text-amber-400"
                  }
                />
              </div>

              {/* Contact info */}
              <SectionTitle>Contact Information</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <DetailRow
                  label="Phone"
                  value={`${lead.mobileCode} ${lead.phone}`}
                  icon={Phone}
                />
                <DetailRow
                  label="Email"
                  value={lead.email || "—"}
                  icon={Mail}
                />
                <DetailRow
                  label="Follow-up"
                  value={
                    lead.followUpDate
                      ? new Date(lead.followUpDate).toLocaleDateString(
                          "en-AE",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "Not set"
                  }
                  icon={Calendar}
                />
                <DetailRow
                  label="Assigned"
                  value={lead.assignedExec || "Unassigned"}
                  icon={User}
                />
              </div>

              {/* Interested vehicle */}
              {lead.interestedCarId && (
                <>
                  <SectionTitle>Interested Vehicle</SectionTitle>
                  <div className="border border-border rounded-xl overflow-hidden mb-2">
                    {lead.interestedCarImage && (
                      <img
                        src={lead.interestedCarImage}
                        alt={lead.interestedCarName}
                        className="w-full h-36 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div className="p-3 flex items-center gap-2">
                      <Car size={14} className="text-gold flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-text-primary">
                          {lead.interestedCarName}
                        </p>
                        <p className="text-[10px] text-text-subtle mt-0.5">
                          {lead.interestedCarPlate}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {lead.notes && (
                <>
                  <SectionTitle>Notes</SectionTitle>
                  <div className="bg-base border border-border rounded-xl p-3 mb-2">
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {lead.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Dates */}
              <SectionTitle>Timeline</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <DetailRow
                  label="Created"
                  value={new Date(lead.createdAt).toLocaleDateString("en-AE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  icon={Clock}
                />
                {lead.convertedAt && (
                  <DetailRow
                    label="Converted"
                    value={new Date(lead.convertedAt).toLocaleDateString(
                      "en-AE",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                    icon={CheckCircle2}
                  />
                )}
              </div>
            </div>

            {/* ── Footer actions ── */}
            <div className="flex-shrink-0 border-t border-border px-4 py-4">
              {isTerminal ? (
                // Won or Lost — only edit available
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={onClose} fullWidth>
                    <X size={13} /> Close
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    className="!border-gold/30 !text-gold hover:!bg-gold/5"
                    onClick={() => {
                      onClose();
                      onEdit(lead);
                    }}
                  >
                    <Edit size={13} /> Edit
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Advance to next stage */}
                  {nextCol && nextCol.id !== "lost" && (
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        onStatusChange(lead, lead.status, nextCol.id);
                        onClose();
                      }}
                    >
                      <TrendingUp size={13} />
                      Move to {nextCol.label}
                    </Button>
                  )}

                  {/* Edit + Mark Lost row */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      fullWidth
                    >
                      <X size={13} /> Close
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      className="!border-gold/30 !text-gold hover:!bg-gold/5"
                      onClick={() => {
                        onClose();
                        onEdit(lead);
                      }}
                    >
                      <Edit size={13} /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        onMarkLost(lead);
                        onClose();
                      }}
                    >
                      <XCircle size={13} /> Lost
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default LeadDetailDrawer;
