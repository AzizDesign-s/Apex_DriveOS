// src/components/invoices/InvoiceFormPage.jsx
// Create / Edit invoice with dynamic line items

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadInvoiceSettings } from "../settings/InvoiceSettings";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { Button, Input, Select } from "../ui";
import {
  customers as seedCustomers,
  cars as seedCars,
  PAYMENT_METHODS,
  generateInvoiceId,
  calcInvoice,
} from "../../data/mockData";
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
    // BUG-054 FIX: use saved defaults from Settings
    vatRate: Number(settings.defaultVat) || 5,
    currency: settings.defaultCurrency || "AED",
    notes: settings.footerText || "",
    items: [],
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

const getLiveCustomers = () => {
  try {
    const saved = localStorage.getItem("apex-gt-customers");
    return saved ? JSON.parse(saved) : seedCustomers;
  } catch {
    return seedCustomers;
  }
};

const getLiveCars = () => {
  try {
    const saved = localStorage.getItem("apex-gt-cars");
    return saved ? JSON.parse(saved) : seedCars;
  } catch {
    return seedCars;
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

  useEffect(() => {
    if (isOpen) {
      setLiveCustomers(getLiveCustomers());
      setLiveCars(getLiveCars());
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
  const handleCarChange = (cid) => {
    const c = liveCars.find((x) => x.id === Number(cid));
    set("carId", cid);
    set("carName", c ? `${c.brand} ${c.model}` : "");
    set("carPlate", c?.plate || "");
    if (c) {
      setForm((f) => ({
        ...f,
        carId: cid,
        carName: `${c.brand} ${c.model}`,
        carPlate: c.plate,
        items: f.items.map((item, i) =>
          item.type === "car" && i === 0
            ? {
                ...item,
                desc: `${c.brand} ${c.model} — ${c.year || 2024}`,
                unitPrice: c.price,
              }
            : item,
        ),
      }));
    }
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

  // Live totals
  const { subtotal, vat, total } = calcInvoice(
    form.items,
    form.discount,
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
    onSave({
      ...form,
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
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center
                           text-text-muted hover:text-text-primary hover:border-gold/40 transition-all"
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

          {/* Two-column layout: Form left, live total right */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-6 grid sm:grid-cols-3 grid-cols-1 gap-5">
              {/* ── Left: Form (2 cols wide) ── */}
              <div className="sm:col-span-2 col-span-1 space-y-4">
                {/* Invoice Identity */}
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
                        className={`input-luxury py-2.5 text-xs ${form.customerEmail ? "text-text-primary" : "text-text-subtle"}`}
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
                        className={`input-luxury py-2.5 text-xs ${form.carPlate ? "text-text-primary" : "text-text-subtle"}`}
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

                  {/* Header row */}
                  <div
                    className="grid-cols-2 sm:grid gap-2 mb-2 sm:grid-cols-[1fr_120px_90px_140px_40px]"
                    // style={{ gridTemplateColumns: "1fr 80px 80px 110px 32px" }}
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

                  {/* Item rows */}
                  <div className="space-y-2 mb-3">
                    {form.items.map((item) => (
                      <div
                        key={item.id}
                        className=" grid gap-2
                                    lg:grid-cols-[1fr_120px_90px_140px_40px]
                                    grid-cols-1 rounded-xl border border-border p-3 lg:p-0 lg:border-0 "
                        // style={{
                        //   gridTemplateColumns: "1fr 80px 80px 110px 32px",
                        // }}
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
                          aria-label="Remove item"
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

              {/* ── Right: Live totals ── */}
              <div className="col-span-1">
                <div className="sticky top-6">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <p
                      className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase
                                  mb-4 pb-2.5 border-b border-border"
                    >
                      Invoice Summary
                    </p>

                    {/* Totals */}
                    <div className="space-y-2.5 mb-4">
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Subtotal</span>
                        <span className="font-semibold text-text-primary">
                          AED {subtotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Discount input */}
                      <div className="flex justify-between items-center text-xs text-text-muted">
                        <span>Discount</span>
                        <div className="flex items-center gap-1">
                          <span className="text-text-subtle text-[10px]">
                            AED
                          </span>
                          <input
                            type="number"
                            className="input-luxury text-xs py-1 w-24 text-right"
                            value={form.discount || ""}
                            onChange={(e) =>
                              set("discount", Number(e.target.value) || 0)
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>

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

                    {/* Line item count */}
                    <div className="bg-base border border-border rounded-xl p-3 mb-4">
                      <p className="text-[9px] text-text-subtle uppercase tracking-widest mb-1">
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
                            <span className="text-text-primary font-semibold flex-shrink-0 ml-2">
                              AED {(item.qty * item.unitPrice).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Save */}
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
