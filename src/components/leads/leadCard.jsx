// src/components/leads/LeadCard.jsx
// Draggable lead card for the Kanban board.
// Uses @dnd-kit/sortable for drag behaviour.
//
// CARD CONTENT (per design decisions):
//   — Name + source badge
//   — Interested vehicle (name + car image)
//   — Phone + email
//   — Assigned exec (or "Unassigned" pill)
//   — Days since created
//   — Follow-up date (if set)
//   — Warning badge if car is reserved by another lead
//
// CLICK: opens LeadDetailDrawer (handled by parent via onView prop)
// DRAG:  handled by @dnd-kit — the card is the draggable item

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  Car,
  GripVertical,
} from "lucide-react";
import clsx from "clsx";

// ── Source badge colors ───────────────────────────────────────────────────────
const SOURCE_STYLE = {
  Website: "bg-sky-accent/10   text-sky-accent   border-sky-accent/20",
  "Walk-in": "bg-emerald-400/10  text-emerald-400  border-emerald-400/20",
  WhatsApp: "bg-emerald-500/10  text-emerald-400  border-emerald-500/20",
  Instagram: "bg-violet-400/10   text-violet-400   border-violet-400/20",
  Referral: "bg-gold/10         text-gold         border-gold/20",
  Phone: "bg-amber-400/10    text-amber-400    border-amber-400/20",
};

// ── Days since helper ─────────────────────────────────────────────────────────
function daysSince(dateStr) {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

function LeadCard({ lead, onView, isCarReservedByOther = false }) {
  // ── @dnd-kit sortable hook ────────────────────────────────────────────────
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(lead.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const sourceStyle =
    SOURCE_STYLE[lead.source] ||
    "bg-text-subtle/10 text-text-subtle border-border";

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        className={clsx(
          "bg-card border rounded-xl p-3 cursor-pointer",
          "hover:border-gold/30 hover:shadow-card transition-all group",
          "select-none",
          isCarReservedByOther
            ? "border-amber-400/40 bg-amber-400/[0.02]"
            : "border-border",
        )}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => onView(lead)}
        layout
      >
        {/* ── Warning banner ── */}
        {isCarReservedByOther && (
          <div
            className="flex items-center gap-1.5 mb-2.5 px-2 py-1.5
                          bg-amber-400/8 border border-amber-400/20 rounded-lg"
          >
            <AlertTriangle size={10} className="text-amber-400 flex-shrink-0" />
            <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wide">
              Car reserved by another lead
            </p>
          </div>
        )}

        {/* ── Header: name + drag handle + source badge ── */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary truncate leading-tight">
              {lead.name}
            </p>
            <span
              className={clsx(
                "inline-flex items-center text-[8px] font-bold uppercase",
                "tracking-wide px-1.5 py-0.5 rounded-full border mt-1",
                sourceStyle,
              )}
            >
              {lead.source}
            </span>
          </div>

          {/* Drag handle — separate from click area */}
          <div
            {...attributes}
            {...listeners}
            className="w-6 h-6 flex items-center justify-center rounded-lg
                       text-text-subtle/40 hover:text-text-subtle
                       hover:bg-border/50 transition-all flex-shrink-0 mt-0.5
                       cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            aria-label="Drag to reorder"
          >
            <GripVertical size={13} />
          </div>
        </div>

        {/* ── Car image + name ── */}
        {lead.interestedCarId && (
          <div
            className="flex items-center gap-2 mb-2.5 p-2
                          bg-base border border-border rounded-lg"
          >
            {lead.interestedCarImage ? (
              <img
                src={lead.interestedCarImage}
                alt={lead.interestedCarName}
                className="w-14 h-9 object-cover rounded-md flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                className="w-14 h-9 rounded-md bg-border/40 flex items-center
                              justify-center flex-shrink-0"
              >
                <Car size={14} className="text-text-subtle" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-text-muted truncate leading-tight">
                {lead.interestedCarName}
              </p>
              <p className="text-[9px] text-text-subtle mt-0.5">
                {lead.interestedCarPlate}
              </p>
            </div>
          </div>
        )}

        {/* ── Contact info ── */}
        <div className="space-y-1 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Phone size={9} className="text-text-subtle flex-shrink-0" />
            <span className="text-[10px] text-text-muted truncate">
              {lead.mobileCode} {lead.phone}
            </span>
          </div>
          {lead.email && (
            <div className="flex items-center gap-1.5">
              <Mail size={9} className="text-text-subtle flex-shrink-0" />
              <span className="text-[10px] text-text-subtle truncate">
                {lead.email}
              </span>
            </div>
          )}
        </div>

        {/* ── Footer: exec + days + follow-up ── */}
        <div
          className="flex items-center justify-between gap-2 pt-2
                        border-t border-border flex-wrap"
        >
          {/* Assigned exec */}
          <div className="flex items-center gap-1">
            <User size={9} className="text-text-subtle flex-shrink-0" />
            <span className="text-[9px] text-text-subtle truncate max-w-[90px]">
              {lead.assignedExec || (
                <span className="text-amber-400/70">Unassigned</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Follow-up date */}
            {lead.followUpDate && (
              <div className="flex items-center gap-1">
                <Calendar size={9} className="text-text-subtle" />
                <span className="text-[9px] text-text-subtle">
                  {new Date(lead.followUpDate).toLocaleDateString("en-AE", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            )}

            {/* Days since created */}
            <div className="flex items-center gap-1">
              <Clock size={9} className="text-text-subtle" />
              <span className="text-[9px] text-text-subtle">
                {daysSince(lead.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LeadCard;
