// src/components/promotions/PromotionCard.jsx
// Individual promotion card for the grid.
// Shows: name, status badge, type badge, discount hero value,
// applicability, date range, days remaining, description.
// Actions: Edit + Delete (visible on hover).

import { motion } from "framer-motion";
import {
  Calendar,
  Car,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { getPromotionStatus, PROMOTION_TYPES } from "../../data/mockPromotion";
import clsx from "clsx";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  expired: "text-text-subtle bg-text-subtle/10 border-border",
  upcoming: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
};

const STATUS_ICON = {
  active: CheckCircle2,
  expired: XCircle,
  upcoming: Clock,
};

// ── Type badge colors ─────────────────────────────────────────────────────────
const TYPE_STYLE = {
  percentage: "text-gold        bg-gold/10        border-gold/20",
  flat: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  festival: "text-violet-400  bg-violet-400/10  border-violet-400/20",
  trade_in: "text-amber-400   bg-amber-400/10   border-amber-400/20",
  finance: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  loyalty: "text-rose-400    bg-rose-400/10    border-rose-400/20",
  employee: "text-text-muted  bg-border/30      border-border",
};

function PromotionCard({ promotion, onEdit, onDelete }) {
  const status = getPromotionStatus(promotion);
  const StatusIcon = STATUS_ICON[status];
  const typeLabel =
    PROMOTION_TYPES.find((t) => t.value === promotion.type)?.label ||
    promotion.type;

  const discountLabel =
    promotion.discountType === "percentage"
      ? `${promotion.discountValue}% off`
      : `AED ${Number(promotion.discountValue).toLocaleString()} off`;

  const applicabilityLabel =
    promotion.appliesTo === "all"
      ? "All Vehicles"
      : promotion.appliesTo === "brand"
        ? promotion.brandFilter
        : `${promotion.brandFilter} ${promotion.modelFilter}`;

  // Days remaining for active promotions
  const daysLeft =
    status === "active"
      ? Math.ceil(
          (new Date(promotion.endDate) - new Date()) / (1000 * 60 * 60 * 24),
        )
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={clsx(
        "bg-card border rounded-2xl p-4 flex flex-col gap-3 group",
        "transition-all duration-200",
        status === "active"
          ? "border-emerald-400/20 hover:border-emerald-400/40"
          : status === "upcoming"
            ? "border-sky-accent/20 hover:border-sky-accent/30"
            : "border-border opacity-60 hover:opacity-80",
      )}
    >
      {/* ── Top: name + badges ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-text-primary truncate">
            {promotion.name}
          </p>
          <p className="text-[10px] text-text-subtle mt-0.5">
            {promotion.promotionId}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className={clsx(
              "flex items-center gap-1 text-[9px] font-bold uppercase",
              "tracking-wide px-2 py-0.5 rounded-full border",
              STATUS_STYLE[status],
            )}
          >
            <StatusIcon size={9} />
            {status}
          </span>
          <span
            className={clsx(
              "text-[8px] font-bold uppercase tracking-wide",
              "px-1.5 py-0.5 rounded-full border",
              TYPE_STYLE[promotion.type] || TYPE_STYLE.employee,
            )}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      {/* ── Hero discount value ── */}
      <div
        className="flex items-center justify-center py-4 rounded-xl"
        style={{
          background:
            status === "active"
              ? "rgba(16,185,129,0.06)"
              : "rgba(148,163,184,0.06)",
        }}
      >
        <p
          className={clsx(
            "text-2xl font-extrabold",
            status === "active" ? "text-emerald-400" : "text-text-subtle",
          )}
        >
          {discountLabel}
        </p>
      </div>

      {/* ── Meta rows ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Car size={10} className="text-text-subtle flex-shrink-0" />
          <span className="text-[10px] text-text-muted">
            {applicabilityLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={10} className="text-text-subtle flex-shrink-0" />
          <span className="text-[10px] text-text-subtle">
            {new Date(promotion.startDate).toLocaleDateString("en-AE", {
              day: "numeric",
              month: "short",
            })}
            {" → "}
            {new Date(promotion.endDate).toLocaleDateString("en-AE", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {daysLeft !== null && (
            <span className="text-[9px] font-bold text-emerald-400 ml-auto flex-shrink-0">
              {daysLeft}d left
            </span>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      {promotion.description && (
        <p className="text-[10px] text-text-subtle leading-relaxed line-clamp-2">
          {promotion.description}
        </p>
      )}

      {/* ── Actions — visible on hover ── */}
      <div
        className="flex gap-2 pt-2 border-t border-border
                   opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={() => onEdit(promotion)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5
                     text-[10px] font-semibold text-text-subtle hover:text-gold
                     border border-border hover:border-gold/30 rounded-lg
                     transition-all"
        >
          <Edit size={11} /> Edit
        </button>
        <button
          onClick={() => onDelete(promotion)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5
                     text-[10px] font-semibold text-text-subtle hover:text-rose-400
                     border border-border hover:border-rose-400/30 rounded-lg
                     transition-all"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

export default PromotionCard;
