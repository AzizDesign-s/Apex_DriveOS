// src/components/promotions/PromotionFormPage.jsx
// Full-screen slide-up form for creating and editing promotions.
// Single page (no tabs) — all fields fit comfortably on one screen.
// Same pattern as LeadFormPage, ServiceFormPage, UserFormPage.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button, Input, Select } from "../ui";
import {
  PROMOTION_TYPES,
  APPLICABILITY_OPTIONS,
} from "../../data/mockPromotion";
import { BRAND_MODELS } from "../../data/mockData";
import apexToast from "../../utils/toast";
import clsx from "clsx";

const EMPTY = {
  name: "",
  description: "",
  type: "percentage",
  discountType: "percentage",
  discountValue: "",
  appliesTo: "all",
  brandFilter: "",
  modelFilter: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
};

function Field({ label, required, error, children, span = "" }) {
  return (
    <div className={clsx("flex flex-col gap-1.5", span)}>
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4">
      <p
        className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase
                    mb-4 pb-2.5 border-b border-border"
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function PromotionFormPage({ isOpen, onClose, onSave, editPromotion = null }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // ── Populate on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (editPromotion) {
      setForm({
        ...EMPTY,
        ...editPromotion,
        discountValue: editPromotion.discountValue ?? "",
      });
    } else {
      setForm({ ...EMPTY });
    }
    setErrors({});
  }, [isOpen, editPromotion]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Sync discountType when promotion type changes
  // flat and trade_in = always AED flat amount
  const handleTypeChange = (type) => {
    set("type", type);
    if (type === "flat" || type === "trade_in") {
      set("discountType", "flat");
    } else {
      set("discountType", "percentage");
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.discountValue) e.discountValue = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    if (form.endDate && form.startDate && form.endDate < form.startDate)
      e.endDate = "End date must be after start date";
    if (form.appliesTo === "brand" && !form.brandFilter)
      e.brandFilter = "Select a brand";
    if (form.appliesTo === "model" && !form.brandFilter)
      e.brandFilter = "Select a brand";
    if (form.appliesTo === "model" && !form.modelFilter)
      e.modelFilter = "Select a model";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      return;
    }
    onSave({
      ...form,
      discountValue: Number(form.discountValue),
      id: editPromotion?.id || null,
      promotionId: editPromotion?.promotionId || null,
      createdAt: editPromotion?.createdAt || new Date().toISOString(),
    });
  };

  const brandList = Object.keys(BRAND_MODELS);
  const modelList = form.brandFilter
    ? BRAND_MODELS[form.brandFilter] || []
    : [];

  // Live discount preview
  const previewAmount =
    form.discountValue && form.discountType === "percentage"
      ? `${form.discountValue}% off the invoice subtotal`
      : form.discountValue
        ? `AED ${Number(form.discountValue).toLocaleString()} off`
        : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-base flex flex-col"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* ── Header ── */}
          <div
            className="flex-shrink-0 bg-card border-b border-border px-4 py-4
                          flex items-center justify-between sticky top-0 z-10"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-border flex items-center
                           justify-center text-text-muted hover:text-text-primary
                           hover:border-gold/40 transition-all"
                aria-label="Go back"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-sm font-extrabold text-text-primary">
                  {editPromotion
                    ? `Edit · ${editPromotion.name}`
                    : "New Promotion"}
                </h2>
                <p className="text-[10px] text-text-subtle mt-0.5">
                  {editPromotion
                    ? "Update promotion details"
                    : "Required fields marked *"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Check}
                onClick={handleSave}
              >
                <span className="hidden sm:inline">
                  {editPromotion ? "Update" : "Create Promotion"}
                </span>
              </Button>
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6">
              {/* Promotion Details */}
              <FormSection title="Promotion Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Promotion Name"
                    required
                    error={errors.name}
                    span="sm:col-span-2"
                  >
                    <input
                      className="input-luxury text-xs py-2.5"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="e.g. Eid Al-Adha Special"
                    />
                  </Field>

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

                  <Field
                    label={
                      form.discountType === "percentage"
                        ? "Discount Percentage (%)"
                        : "Discount Amount (AED)"
                    }
                    required
                    error={errors.discountValue}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="input-luxury py-2.5 px-3 text-xs
                                       font-bold text-gold w-14 text-center
                                       flex-shrink-0"
                      >
                        {form.discountType === "percentage" ? "%" : "AED"}
                      </span>
                      <input
                        type="number"
                        className="input-luxury text-xs py-2.5 flex-1"
                        value={form.discountValue}
                        onChange={(e) => set("discountValue", e.target.value)}
                        placeholder={
                          form.discountType === "percentage"
                            ? "e.g. 10"
                            : "e.g. 25000"
                        }
                        min="0"
                        max={
                          form.discountType === "percentage" ? "100" : undefined
                        }
                      />
                    </div>
                  </Field>

                  <Field label="Description" span="sm:col-span-2">
                    <textarea
                      className="input-luxury text-xs py-2.5 resize-none"
                      rows={2}
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Optional — describe the promotion terms..."
                    />
                  </Field>
                </div>
              </FormSection>

              {/* Applicability */}
              <FormSection title="Vehicle Applicability">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Applies To" required span="sm:col-span-2">
                    <div className="flex gap-2">
                      {APPLICABILITY_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => {
                            set("appliesTo", o.value);
                            set("brandFilter", "");
                            set("modelFilter", "");
                          }}
                          className={clsx(
                            "flex-1 py-2.5 rounded-xl border text-xs font-semibold",
                            "transition-all",
                            form.appliesTo === o.value
                              ? "border-gold/50 text-gold bg-gold/8"
                              : "border-border text-text-muted hover:border-gold/25",
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {(form.appliesTo === "brand" ||
                    form.appliesTo === "model") && (
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
                </div>
              </FormSection>

              {/* Date Range */}
              <FormSection title="Active Period">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Start Date" required error={errors.startDate}>
                    <input
                      type="date"
                      className="input-luxury text-xs py-2.5"
                      value={form.startDate}
                      onChange={(e) => set("startDate", e.target.value)}
                    />
                  </Field>

                  <Field label="End Date" required error={errors.endDate}>
                    <input
                      type="date"
                      className="input-luxury text-xs py-2.5"
                      value={form.endDate}
                      onChange={(e) => set("endDate", e.target.value)}
                      min={form.startDate}
                    />
                  </Field>
                </div>

                {/* Live preview */}
                {previewAmount && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-between
                               bg-gold/[0.04] border border-gold/15 rounded-xl px-4 py-3"
                  >
                    <span className="text-[10px] text-text-subtle">
                      Promotion value
                    </span>
                    <span className="text-sm font-extrabold text-gold">
                      {previewAmount}
                    </span>
                  </motion.div>
                )}
              </FormSection>
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            className="flex-shrink-0 bg-card border-t border-border px-6 py-3
                          flex items-center justify-end gap-3 sticky bottom-0"
          >
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSave}
            >
              {editPromotion ? "Update Promotion" : "Create Promotion"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PromotionFormPage;
