// src/pages/Promotions.jsx
// Sprint 4 Phase 6 — Promotions & Discounts management page.
//
// LAYOUT: Stats strip + promotion cards grid (not a table —
// promotions are few enough that cards read better than rows)
//
// PROMOTION STATUS displayed via badge:
//   active   — within date range (usable on invoices)
//   upcoming — start date in future
//   expired  — end date in past

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Tag,
  Percent,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  Car,
} from "lucide-react";
import {
  promotions as initialPromotions,
  generatePromotionId,
  PROMOTION_TYPES,
  APPLICABILITY_OPTIONS,
  getPromotionStatus,
  computeDiscount,
} from "../data/mockPromotion";
import { BRAND_MODELS as BRANDS } from "../data/mockData";
import { DeleteConfirm, Button } from "../components/ui";
import apexToast from "../utils/toast";
import clsx from "clsx";

const LS_KEY = "apex-gt-promotions";

const loadPromotions = () => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : initialPromotions;
  } catch {
    return initialPromotions;
  }
};

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
  percentage: "text-gold       bg-gold/10       border-gold/20",
  flat: "text-sky-accent bg-sky-accent/10 border-sky-accent/20",
  festival: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  trade_in: "text-amber-400  bg-amber-400/10  border-amber-400/20",
  finance: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  loyalty: "text-rose-400   bg-rose-400/10   border-rose-400/20",
  employee: "text-text-muted bg-border/30     border-border",
};

// ── Promotion form (inline — no separate FormPage needed for simple fields) ───
function PromotionForm({ editPromotion, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: editPromotion?.name || "",
    description: editPromotion?.description || "",
    type: editPromotion?.type || "percentage",
    discountType: editPromotion?.discountType || "percentage",
    discountValue: editPromotion?.discountValue || "",
    appliesTo: editPromotion?.appliesTo || "all",
    brandFilter: editPromotion?.brandFilter || "",
    modelFilter: editPromotion?.modelFilter || "",
    startDate:
      editPromotion?.startDate || new Date().toISOString().split("T")[0],
    endDate: editPromotion?.endDate || "",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Sync discountType when type changes
  const handleTypeChange = (type) => {
    set("type", type);
    // flat and trade_in are always flat AED amounts
    if (type === "flat" || type === "trade_in") {
      set("discountType", "flat");
    } else {
      set("discountType", "percentage");
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.discountValue) e.discountValue = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    if (form.appliesTo === "brand" && !form.brandFilter)
      e.brandFilter = "Select a brand";
    if (form.appliesTo === "model" && (!form.brandFilter || !form.modelFilter))
      e.modelFilter = "Select brand and model";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...form,
      discountValue: Number(form.discountValue),
      id: editPromotion?.id || null,
      promotionId: editPromotion?.promotionId || null,
      createdAt: editPromotion?.createdAt || new Date().toISOString(),
    });
  };

  const brandList = Object.keys(BRANDS);
  const modelList = form.brandFilter ? BRANDS[form.brandFilter] || [] : [];

  const Field = ({ label, required, error, children }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-border rounded-2xl p-5 mb-4"
    >
      <p
        className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase
                    mb-4 pb-2.5 border-b border-border"
      >
        {editPromotion ? "Edit Promotion" : "New Promotion"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <Field label="Promotion Name" required error={errors.name}>
          <input
            className="input-luxury text-xs py-2.5"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Eid Al-Adha Special"
          />
        </Field>

        {/* Type */}
        <Field label="Promotion Type" required>
          <select
            className="input-luxury text-xs py-2.5"
            value={form.type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {PROMOTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Discount value */}
        <Field
          label={
            form.discountType === "percentage"
              ? "Discount (%)"
              : "Discount (AED)"
          }
          required
          error={errors.discountValue}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-text-subtle w-10 flex-shrink-0">
              {form.discountType === "percentage" ? "%" : "AED"}
            </span>
            <input
              type="number"
              className="input-luxury text-xs py-2.5 flex-1"
              value={form.discountValue}
              onChange={(e) => set("discountValue", e.target.value)}
              placeholder={
                form.discountType === "percentage" ? "e.g. 10" : "e.g. 25000"
              }
              min="0"
              max={form.discountType === "percentage" ? "100" : undefined}
            />
          </div>
        </Field>

        {/* Applies to */}
        <Field label="Applies To" required>
          <select
            className="input-luxury text-xs py-2.5"
            value={form.appliesTo}
            onChange={(e) => {
              set("appliesTo", e.target.value);
              set("brandFilter", "");
              set("modelFilter", "");
            }}
          >
            {APPLICABILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Brand filter — shown when appliesTo = brand or model */}
        {(form.appliesTo === "brand" || form.appliesTo === "model") && (
          <Field label="Brand" required error={errors.brandFilter}>
            <select
              className="input-luxury text-xs py-2.5"
              value={form.brandFilter}
              onChange={(e) => {
                set("brandFilter", e.target.value);
                set("modelFilter", "");
              }}
            >
              <option value="">Select Brand</option>
              {brandList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
        )}

        {/* Model filter — shown when appliesTo = model */}
        {form.appliesTo === "model" && (
          <Field label="Model" required error={errors.modelFilter}>
            <select
              className="input-luxury text-xs py-2.5"
              value={form.modelFilter}
              onChange={(e) => set("modelFilter", e.target.value)}
              disabled={!form.brandFilter}
            >
              <option value="">Select Model</option>
              {modelList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        )}

        {/* Start date */}
        <Field label="Start Date" required error={errors.startDate}>
          <input
            type="date"
            className="input-luxury text-xs py-2.5"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </Field>

        {/* End date */}
        <Field label="End Date" required error={errors.endDate}>
          <input
            type="date"
            className="input-luxury text-xs py-2.5"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            min={form.startDate}
          />
        </Field>

        {/* Description */}
        <Field label="Description" className="sm:col-span-2">
          <textarea
            className="input-luxury text-xs py-2.5 resize-none"
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Optional — describe the promotion terms"
          />
        </Field>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="md" onClick={handleSave}>
          {editPromotion ? "Update Promotion" : "Create Promotion"}
        </Button>
      </div>
    </motion.div>
  );
}

// ── Promotion card ────────────────────────────────────────────────────────────
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

  const daysLeft = () => {
    if (status !== "active") return null;
    const diff = Math.ceil(
      (new Date(promotion.endDate) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };
  const days = daysLeft();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "bg-card border rounded-2xl p-4 flex flex-col gap-3 group",
        status === "active"
          ? "border-emerald-400/20 hover:border-emerald-400/40"
          : status === "upcoming"
            ? "border-sky-accent/20 hover:border-sky-accent/30"
            : "border-border opacity-70",
      )}
    >
      {/* Top: name + status + type */}
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

      {/* Discount value — hero number */}
      <div
        className="flex items-center justify-center py-3 rounded-xl"
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

      {/* Meta: applicability + dates */}
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
          {days !== null && (
            <span className="text-[9px] font-bold text-emerald-400 ml-auto">
              {days}d left
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {promotion.description && (
        <p className="text-[10px] text-text-subtle leading-relaxed line-clamp-2">
          {promotion.description}
        </p>
      )}

      {/* Actions */}
      <div
        className="flex gap-2 pt-2 border-t border-border
                      opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={() => onEdit(promotion)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5
                     text-[10px] font-semibold text-text-subtle hover:text-gold
                     border border-border hover:border-gold/30 rounded-lg transition-all"
        >
          <Edit size={11} /> Edit
        </button>
        <button
          onClick={() => onDelete(promotion)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5
                     text-[10px] font-semibold text-text-subtle hover:text-rose-400
                     border border-border hover:border-rose-400/30 rounded-lg transition-all"
        >
          <Trash2 size={11} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function PromotionStats({ promotions }) {
  const active = promotions.filter(
    (p) => getPromotionStatus(p) === "active",
  ).length;
  const upcoming = promotions.filter(
    (p) => getPromotionStatus(p) === "upcoming",
  ).length;
  const expired = promotions.filter(
    (p) => getPromotionStatus(p) === "expired",
  ).length;

  const stats = [
    { label: "Total", value: promotions.length, color: "text-text-primary" },
    { label: "Active", value: active, color: "text-emerald-400" },
    { label: "Upcoming", value: upcoming, color: "text-sky-accent" },
    { label: "Expired", value: expired, color: "text-text-subtle" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bg-card border border-border rounded-xl px-4 py-3
                     flex items-center justify-between"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
            {s.label}
          </p>
          <p className={clsx("text-xl font-extrabold", s.color)}>{s.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function Promotions() {
  const [promotions, setPromotions] = useState(() => loadPromotions());
  const [formOpen, setFormOpen] = useState(false);
  const [editPromo, setEditPromo] = useState(null);
  const [deletePromo, setDeletePromo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Persist on change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(promotions));
    window.dispatchEvent(
      new CustomEvent("apex-gt-promotions-updated", { detail: { promotions } }),
    );
  }, [promotions]);

  const handleSave = useCallback((data) => {
    setPromotions((prev) => {
      if (data.id) {
        apexToast.success(
          "Promotion Updated",
          `${data.name} has been updated.`,
        );
        return prev.map((p) => (p.id === data.id ? { ...data } : p));
      }
      const newPromo = {
        ...data,
        id: Date.now(),
        promotionId: generatePromotionId(prev),
        createdAt: new Date().toISOString(),
      };
      apexToast.success("Promotion Created", `${newPromo.name} is now active.`);
      return [newPromo, ...prev];
    });
    setFormOpen(false);
    setEditPromo(null);
  }, []);

  const handleDelete = useCallback((promo) => {
    setPromotions((prev) => prev.filter((p) => p.id !== promo.id));
    setDeletePromo(null);
    apexToast.info("Promotion Deleted", `${promo.name} removed.`);
  }, []);

  const filtered = useMemo(() => {
    if (filterStatus === "all") return promotions;
    return promotions.filter((p) => getPromotionStatus(p) === filterStatus);
  }, [promotions, filterStatus]);

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6">
      {/* Page header */}
      <motion.div
        className="flex items-start justify-between flex-shrink-0"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-text-primary">
              Promotions & Discounts
            </h1>
            <span
              className="text-[10px] font-bold bg-gold/15 text-gold
                             px-2.5 py-1 rounded-full border border-gold/25"
            >
              {
                promotions.filter((p) => getPromotionStatus(p) === "active")
                  .length
              }{" "}
              active
            </span>
          </div>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            Manage pricing rules · Apply to invoices during creation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditPromo(null);
              setFormOpen(true);
            }}
          >
            <span className="hidden sm:inline">New Promotion</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <PromotionStats promotions={promotions} />

      {/* Inline form */}
      <AnimatePresence>
        {formOpen && (
          <PromotionForm
            editPromotion={editPromo}
            onSave={handleSave}
            onCancel={() => {
              setFormOpen(false);
              setEditPromo(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {["all", "active", "upcoming", "expired"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={clsx(
              "px-3 py-1.5 rounded-xl border text-[11px] font-semibold",
              "transition-all capitalize",
              filterStatus === s
                ? "border-gold/50 text-gold bg-gold/8"
                : "border-border text-text-subtle hover:text-text-muted hover:border-gold/25",
            )}
          >
            {s}
          </button>
        ))}
        <span className="text-[10px] text-text-subtle ml-auto">
          {filtered.length} promotion{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Promotion cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Tag size={32} className="text-text-subtle/30 mb-3" />
          <p className="text-sm font-bold text-text-primary mb-1">
            No promotions found
          </p>
          <p className="text-[11px] text-text-subtle">
            {filterStatus === "all"
              ? "Create your first promotion to get started"
              : `No ${filterStatus} promotions`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((promo) => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onEdit={(p) => {
                  setEditPromo(p);
                  setFormOpen(true);
                }}
                onDelete={setDeletePromo}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm */}
      <DeleteConfirm
        isOpen={!!deletePromo}
        onClose={() => setDeletePromo(null)}
        onConfirm={() => handleDelete(deletePromo)}
        title="Delete Promotion?"
        itemName={deletePromo?.name}
        confirmText={deletePromo?.name}
      />
    </div>
  );
}

export default Promotions;
