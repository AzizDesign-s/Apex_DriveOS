// src/components/invoices/InvoiceFormPage.jsx
// Phase 6 changes:
//   1. localStorage keys corrected: apex-driveos-* → apex-driveos-*
//   2. Manual discount field REMOVED from Invoice Summary panel
//   3. Promotion picker ADDED above the totals
//   4. calcInvoice() discount param now comes from selected
//      promotion's computed value, not a manual input
//   5. form.promotionId, form.promotionLabel, form.promotionValue
//      added to form state so the invoice record stores which
//      promotion was applied

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadInvoiceSettings } from "../settings/InvoiceSettings";
import { ArrowLeft, Check, Plus, Trash2, Tag, X } from "lucide-react";
import { Button, Input, Select } from "../ui";
import {
  customers as seedCustomers,
  cars as seedCars,
  PAYMENT_METHODS,
  generateInvoiceId,
  calcInvoice,
} from "../../data/mockData";
import {
  getPromotionStatus,
  computeDiscount,
  promotionAppliesToCar,
} from "../../data/mockPromotion";
import apexToast from "../../utils/toast";

const ITEM_TYPES = ["car", "service", "custom"];

const EMPTY_ITEM = () => ({
  id: Date.now() + Math.random(),
  desc: "",
  type: "service",
  qty: 1,
  unitPrice: 0,
});

const getEmptyForm = () => {
  const settings = loadInvoiceSettings();
  return {
    invoiceId: "",
    customerId: "",
    customerName: "",
    customerEmail: "",
    carId: "",
    carName: "",
    carPlate: "",
    issuedDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "draft",
    method: "Cash",
    vatRate: Number(settings.defaultVat) || 5,
    currency: settings.defaultCurrency || "AED",
    notes: settings.footerText || "",
    items: [],
    // Phase 6: promotion fields (replaces manual discount)
    promotionId: null,
    promotionLabel: "",
    promotionValue: 0, // computed AED amount from the promotion
  };
};

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

function Field({ label, required, error, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

// Phase 6: corrected keys
const getLiveCustomers = () => {
  try {
    const saved = localStorage.getItem("apex-driveos-customers");
    return saved ? JSON.parse(saved) : seedCustomers;
  } catch {
    return seedCustomers;
  }
};

const getLiveCars = () => {
  try {
    const saved = localStorage.getItem("apex-driveos-cars");
    return saved ? JSON.parse(saved) : seedCars;
  } catch {
    return seedCars;
  }
};

// Phase 6: load live promotions
const getLivePromotions = () => {
  try {
    const saved = localStorage.getItem("apex-driveos-promotions");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

function InvoiceFormPage({
  isOpen,
  onClose,
  onSave,
  editInvoice = null,
  allInvoices = [],
}) {
  const [form, setForm] = useState(getEmptyForm);
  const [errors, setErrors] = useState({});
  const [liveCustomers, setLiveCustomers] = useState(getLiveCustomers);
  const [liveCars, setLiveCars] = useState(getLiveCars);
  const [livePromotions, setLivePromotions] = useState(getLivePromotions);

  // Selected car object — needed for promotion filtering
  const selectedCar = liveCars.find((c) => c.id === Number(form.carId)) || null;

  // Active promotions eligible for the current invoice
  const eligiblePromotions = livePromotions.filter((p) => {
    if (getPromotionStatus(p) !== "active") return false;
    return promotionAppliesToCar(p, selectedCar);
  });

  useEffect(() => {
    if (isOpen) {
      setLiveCustomers(getLiveCustomers());
      setLiveCars(getLiveCars());
      setLivePromotions(getLivePromotions());
      if (editInvoice) {
        setForm({ ...getEmptyForm(), ...editInvoice });
      } else {
        setForm({
          ...getEmptyForm(),
          invoiceId: generateInvoiceId(allInvoices),
          items: [
            { id: Date.now(), desc: "", type: "car", qty: 1, unitPrice: 0 },
          ],
        });
      }
      setErrors({});
    }
  }, [isOpen, editInvoice, allInvoices]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Auto-fill customer
  const handleCustomerChange = (cid) => {
    const c = liveCustomers.find((x) => x.id === Number(cid));
    set("customerId", cid);
    set("customerName", c?.name || "");
    set("customerEmail", c?.email || "");
  };

  // Auto-fill car + create car line item
  // Also clear promotion if car changes (it may no longer be eligible)
  const handleCarChange = (cid) => {
    const c = liveCars.find((x) => x.id === Number(cid));
    setForm((f) => ({
      ...f,
      carId: cid,
      carName: c ? `${c.brand} ${c.model}` : "",
      carPlate: c?.plate || "",
      // Clear promotion — re-select after car is chosen
      promotionId: null,
      promotionLabel: "",
      promotionValue: 0,
      items: f.items.map((item, i) =>
        item.type === "car" && i === 0
          ? {
              ...item,
              desc: c ? `${c.brand} ${c.model} — ${c.year || 2024}` : item.desc,
              unitPrice: c ? c.price : item.unitPrice,
            }
          : item,
      ),
    }));
  };

  // Phase 6: apply a promotion
  const handleApplyPromotion = (promotionId) => {
    if (!promotionId) {
      // Clear promotion
      set("promotionId", null);
      set("promotionLabel", "");
      set("promotionValue", 0);
      return;
    }
    const promo = livePromotions.find((p) => p.id === Number(promotionId));
    if (!promo) return;
    const { subtotal } = calcInvoice(form.items, 0, form.vatRate);
    const discountAED = computeDiscount(promo, subtotal);
    setForm((f) => ({
      ...f,
      promotionId: promo.id,
      promotionLabel: promo.name,
      promotionValue: discountAED,
    }));
    apexToast.success(
      "Promotion Applied",
      `${promo.name} — AED ${discountAED.toLocaleString()} discount applied.`,
    );
  };

  // Line item handlers
  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, EMPTY_ITEM()] }));
  const updateItem = (id, key, val) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item) =>
        item.id === id ? { ...item, [key]: val } : item,
      ),
    }));
  const removeItem = (id) =>
    setForm((f) => ({ ...f, items: f.items.filter((item) => item.id !== id) }));

  // Live totals — Phase 6: discount comes from promotionValue, not form.discount
  const { subtotal, vat, total } = calcInvoice(
    form.items,
    form.promotionValue || 0,
    form.vatRate,
  );

  const validate = () => {
    const e = {};
    if (!form.customerId) e.customerId = "Required";
    if (!form.dueDate) e.dueDate = "Required";
    if (form.items.length === 0) e.items = "Add at least one line item";
    if (form.items.some((i) => !i.desc || i.unitPrice <= 0))
      e.items = "All items need a description and price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      return;
    }
    // Pass promotionValue as discount so calcInvoice in other modules
    // continues to work with the existing "discount" field pattern
    onSave({
      ...form,
      discount: form.promotionValue || 0,
      id: editInvoice?.id || Date.now(),
    });
    apexToast.success(
      editInvoice ? "Invoice Updated" : "Invoice Created",
      `${form.invoiceId} has been ${editInvoice ? "updated" : "created"}.`,
    );
    onClose();
  };

  const availableCars = liveCars.filter(
    (c) => c.status !== "sold" || c.id === Number(form.carId),
  );

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
          {/* Header */}
          <div
            className="flex-shrink-0 bg-card border-b border-border px-6 py-4
                          flex items-center justify-between sticky top-0 z-10"
          >
            <div className="flex items-center gap-4">
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
                  {editInvoice
                    ? `Edit · ${editInvoice.invoiceId}`
                    : "New Invoice"}
                </h2>
                <p className="text-[10px] text-text-subtle mt-0.5">
                  {form.invoiceId} · Required fields marked *
                </p>
              </div>
            </div>
            <div className="flex gap-3">
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
                  {editInvoice ? "Update Invoice" : "Create Invoice"}
                </span>
              </Button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-6 grid sm:grid-cols-3 grid-cols-1 gap-5">
              {/* ── Left: Form (2 cols wide) ── */}
              <div className="sm:col-span-2 col-span-1 space-y-4">
                {/* Invoice Details */}
                <FormSection title="Invoice Details">
                  <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
                    <Field label="Invoice ID">
                      <div
                        className="input-luxury py-2.5 text-xs font-bold text-gold
                                      bg-gold/[0.04] border-gold/15 cursor-not-allowed"
                      >
                        {form.invoiceId}
                      </div>
                    </Field>
                    <Field label="Status">
                      <Select
                        value={form.status}
                        onChange={(e) => set("status", e.target.value)}
                        options={[
                          { value: "draft", label: "Draft" },
                          { value: "sent", label: "Sent" },
                          { value: "paid", label: "Paid" },
                          { value: "partially_paid", label: "Partially Paid" },
                          { value: "overdue", label: "Overdue" },
                          { value: "cancelled", label: "Cancelled" },
                          { value: "refunded", label: "Refunded" },
                        ]}
                      />
                    </Field>
                    <Field label="Payment Method">
                      <Select
                        value={form.method}
                        onChange={(e) => set("method", e.target.value)}
                        options={PAYMENT_METHODS}
                      />
                    </Field>
                    <Field label="Issue Date">
                      <input
                        type="date"
                        className="input-luxury text-xs py-2"
                        value={form.issuedDate}
                        onChange={(e) => set("issuedDate", e.target.value)}
                      />
                    </Field>
                    <Field label="Due Date" required error={errors.dueDate}>
                      <input
                        type="date"
                        className="input-luxury text-xs py-2"
                        value={form.dueDate}
                        onChange={(e) => set("dueDate", e.target.value)}
                      />
                    </Field>
                    <Field label="VAT Rate (%)">
                      <Input
                        type="number"
                        value={form.vatRate}
                        onChange={(e) => set("vatRate", Number(e.target.value))}
                      />
                    </Field>
                  </div>
                </FormSection>

                {/* Customer & Car */}
                <FormSection title="Customer & Car">
                  <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                    <Field label="Customer" required error={errors.customerId}>
                      <Select
                        value={form.customerId}
                        onChange={(e) => handleCustomerChange(e.target.value)}
                        options={liveCustomers.map((c) => ({
                          value: String(c.id),
                          label: `${c.name} (${c.customerId})`,
                        }))}
                        placeholder="Select Customer"
                      />
                    </Field>
                    <Field label="Email">
                      <div
                        className={`input-luxury py-2.5 text-xs
                                       ${
                                         form.customerEmail
                                           ? "text-text-primary"
                                           : "text-text-subtle"
                                       }`}
                      >
                        {form.customerEmail || "Auto-filled from CRM"}
                      </div>
                    </Field>
                    <Field label="Car (Optional)">
                      <Select
                        value={form.carId}
                        onChange={(e) => handleCarChange(e.target.value)}
                        options={availableCars.map((c) => ({
                          value: String(c.id),
                          label: `${c.brand} ${c.model} · ${c.plate}`,
                        }))}
                        placeholder="Link to Inventory Car"
                      />
                    </Field>
                    <Field label="Plate No.">
                      <div
                        className={`input-luxury py-2.5 text-xs
                                       ${
                                         form.carPlate
                                           ? "text-text-primary"
                                           : "text-text-subtle"
                                       }`}
                      >
                        {form.carPlate || "Auto-filled from Inventory"}
                      </div>
                    </Field>
                  </div>
                </FormSection>

                {/* Line Items */}
                <FormSection title="Line Items">
                  {errors.items && (
                    <p className="text-[10px] text-rose-400 mb-3">
                      {errors.items}
                    </p>
                  )}
                  <div
                    className="grid-cols-2 sm:grid gap-2 mb-2
                                  sm:grid-cols-[1fr_120px_90px_140px_40px]"
                  >
                    {["Description", "Type", "Qty", "Unit Price (AED)", ""].map(
                      (h) => (
                        <p
                          key={h}
                          className="text-[9px] font-bold tracking-[0.15em]
                                    text-text-subtle uppercase"
                        >
                          {h}
                        </p>
                      ),
                    )}
                  </div>
                  <div className="space-y-2 mb-3">
                    {form.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-2
                                   lg:grid-cols-[1fr_120px_90px_140px_40px]
                                   grid-cols-1 rounded-xl border border-border
                                   p-3 lg:p-0 lg:border-0"
                      >
                        <Input
                          placeholder="Item description..."
                          value={item.desc}
                          onChange={(e) =>
                            updateItem(item.id, "desc", e.target.value)
                          }
                        />
                        <Select
                          value={item.type}
                          onChange={(e) =>
                            updateItem(item.id, "type", e.target.value)
                          }
                          options={ITEM_TYPES}
                        />
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(item.id, "qty", Number(e.target.value))
                          }
                        />
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "unitPrice",
                              Number(e.target.value),
                            )
                          }
                        />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 rounded-lg border border-border flex items-center
                                     justify-center text-text-subtle hover:text-rose-400
                                     hover:border-rose-400/40 transition-all flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Plus}
                    onClick={addItem}
                  >
                    Add Line Item
                  </Button>
                </FormSection>

                {/* Notes */}
                <FormSection title="Notes">
                  <Input
                    rows={3}
                    placeholder="Any notes to appear on the invoice..."
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </FormSection>
              </div>

              {/* ── Right: Live summary ── */}
              <div className="col-span-1">
                <div className="sticky top-6">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p
                      className="text-[9px] font-bold tracking-[0.25em] text-gold
                                  uppercase mb-4 pb-2.5 border-b border-border"
                    >
                      Invoice Summary
                    </p>

                    {/* Phase 6: Promotion picker */}
                    <div className="mb-4">
                      <p
                        className="text-[9px] font-bold tracking-[0.15em]
                                    text-text-subtle uppercase mb-2"
                      >
                        Apply Promotion
                      </p>

                      {/* Active promotion applied */}
                      {form.promotionId ? (
                        <div
                          className="flex items-center justify-between
                                        bg-emerald-400/8 border border-emerald-400/20
                                        rounded-xl px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Tag
                              size={11}
                              className="text-emerald-400 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-emerald-400 truncate">
                                {form.promotionLabel}
                              </p>
                              <p className="text-[9px] text-emerald-400/70">
                                −AED{" "}
                                {Number(form.promotionValue).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleApplyPromotion(null)}
                            className="w-5 h-5 rounded-full flex items-center
                                       justify-center text-emerald-400/60
                                       hover:text-rose-400 transition-colors flex-shrink-0"
                            title="Remove promotion"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ) : eligiblePromotions.length > 0 ? (
                        <select
                          className="input-luxury text-xs py-2 w-full"
                          value=""
                          onChange={(e) => handleApplyPromotion(e.target.value)}
                        >
                          <option value="">Select a promotion...</option>
                          {eligiblePromotions.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                              {p.name} —{" "}
                              {p.discountType === "percentage"
                                ? `${p.discountValue}%`
                                : `AED ${Number(p.discountValue).toLocaleString()}`}{" "}
                              off
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          className="px-3 py-2 rounded-xl border border-border
                                        bg-base text-center"
                        >
                          <p className="text-[10px] text-text-subtle">
                            {form.carId
                              ? "No active promotions for this vehicle"
                              : "Select a car to see eligible promotions"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2.5 mb-4">
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Subtotal</span>
                        <span className="font-semibold text-text-primary">
                          AED {subtotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Promotion discount line — replaces manual discount */}
                      {form.promotionValue > 0 && (
                        <div
                          className="flex justify-between text-xs
                                        text-emerald-400 font-semibold"
                        >
                          <span className="flex items-center gap-1">
                            <Tag size={10} />
                            {form.promotionLabel}
                          </span>
                          <span>
                            −AED {Number(form.promotionValue).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div
                        className="flex justify-between text-xs font-semibold"
                        style={{ color: "#D4AF37" }}
                      >
                        <span>VAT ({form.vatRate}%)</span>
                        <span>AED {vat.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-border">
                        <span className="text-sm font-extrabold text-text-primary">
                          Total
                        </span>
                        <span className="text-sm font-extrabold text-gold">
                          AED {total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Line item mini list */}
                    <div className="bg-base border border-border rounded-xl p-3 mb-4">
                      <p
                        className="text-[9px] text-text-subtle uppercase
                                    tracking-widest mb-1"
                      >
                        Items
                      </p>
                      {form.items.length === 0 ? (
                        <p className="text-xs text-text-subtle">
                          No items added
                        </p>
                      ) : (
                        form.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-[10px] py-0.5"
                          >
                            <span className="text-text-muted truncate max-w-[120px]">
                              {item.desc || "Unnamed item"}
                            </span>
                            <span
                              className="text-text-primary font-semibold
                                             flex-shrink-0 ml-2"
                            >
                              AED {(item.qty * item.unitPrice).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      icon={Check}
                      onClick={handleSave}
                      fullWidth
                    >
                      {editInvoice ? "Update Invoice" : "Create Invoice"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
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
              {editInvoice ? "Update Invoice" : "Create Invoice"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InvoiceFormPage;
