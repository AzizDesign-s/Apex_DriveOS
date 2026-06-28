// src/components/service/ServiceFormPage.jsx
// Full-screen slide-up form for creating and editing work orders.
// 2 tabs: Work Order Details | Parts & Cost
//
// CROSS-MODULE:
//   When a new work order is created, the vehicle status changes
//   to "maintenance" — handled by parent Service.jsx via onSave callback.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Wrench,
  DollarSign,
  Plus,
  Trash2,
} from "lucide-react";
import { Button, Input, Select } from "../ui";
import { SERVICE_TYPES, SERVICE_STATUSES } from "../../data/mockServiceOrders";
import apexToast from "../../utils/toast";
import clsx from "clsx";

const TABS = [
  { label: "Work Order", icon: Wrench },
  { label: "Parts & Cost", icon: DollarSign },
];

const EMPTY = {
  vehicleId: null,
  vehicleName: "",
  vehiclePlate: "",
  vehicleImage: null,
  technicianName: "",
  type: "Routine Maintenance",
  status: "pending",
  estimatedCost: "",
  actualCost: "",
  parts: [],
  startDate: new Date().toISOString().split("T")[0],
  completedDate: "",
  notes: "",
  mileageAtService: "",
};

const EMPTY_PART = { name: "", qty: 1, unitCost: "" };

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
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

function ServiceFormPage({
  isOpen,
  onClose,
  onSave,
  editOrder = null,
  technicianOptions = [],
}) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [cars, setCars] = useState([]);

  // ── Load live cars ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem("apex-gt-cars");
      const parsed = saved ? JSON.parse(saved) : [];
      // All cars can have a work order, including those already in maintenance
      setCars(parsed);
    } catch {
      setCars([]);
    }
  }, [isOpen]);

  // ── Populate form on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (editOrder) {
      setForm({
        ...EMPTY,
        ...editOrder,
        estimatedCost: editOrder.estimatedCost ?? "",
        actualCost: editOrder.actualCost ?? "",
        mileageAtService: editOrder.mileageAtService ?? "",
        completedDate: editOrder.completedDate ?? "",
        parts: editOrder.parts || [],
      });
    } else {
      setForm({ ...EMPTY });
    }
    setTab(0);
    setErrors({});
  }, [isOpen, editOrder]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // ── Vehicle selector ──────────────────────────────────────────────────────
  const handleVehicleSelect = (carId) => {
    if (!carId) {
      set("vehicleId", null);
      set("vehicleName", "");
      set("vehiclePlate", "");
      set("vehicleImage", null);
      return;
    }
    const car = cars.find((c) => c.id === Number(carId));
    if (!car) return;
    set("vehicleId", car.id);
    set("vehicleName", `${car.brand} ${car.model}`);
    set("vehiclePlate", car.plate || "");
    set("vehicleImage", car.photos?.[0]?.url || null);
    // Auto-fill mileage from car record
    if (car.mileage) set("mileageAtService", car.mileage);
  };

  // ── Parts management ──────────────────────────────────────────────────────
  const addPart = () => {
    set("parts", [...form.parts, { ...EMPTY_PART }]);
  };

  const updatePart = (index, key, value) => {
    const updated = form.parts.map((p, i) =>
      i === index ? { ...p, [key]: value } : p,
    );
    set("parts", updated);
  };

  const removePart = (index) => {
    set(
      "parts",
      form.parts.filter((_, i) => i !== index),
    );
  };

  // ── Parts total ───────────────────────────────────────────────────────────
  const partsTotal = form.parts.reduce(
    (sum, p) => sum + (Number(p.qty) || 0) * (Number(p.unitCost) || 0),
    0,
  );

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.vehicleId) e.vehicleId = "Required";
    if (!form.type) e.type = "Required";
    if (!form.startDate) e.startDate = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      setTab(0);
      return;
    }
    onSave({
      ...form,
      estimatedCost: form.estimatedCost !== "" ? Number(form.estimatedCost) : 0,
      actualCost: form.actualCost !== "" ? Number(form.actualCost) : null,
      mileageAtService:
        form.mileageAtService !== "" ? Number(form.mileageAtService) : null,
      completedDate: form.completedDate || null,
      parts: form.parts.map((p) => ({
        name: p.name,
        qty: Number(p.qty) || 1,
        unitCost: Number(p.unitCost) || 0,
      })),
      id: editOrder?.id || null,
      workOrderId: editOrder?.workOrderId || null,
      createdAt: editOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // ── Vehicle options ───────────────────────────────────────────────────────
  const vehicleOptions = [
    { value: "", label: "Select vehicle" },
    ...cars.map((c) => ({
      value: String(c.id),
      label: `${c.brand} ${c.model} — ${c.plate} (${c.status})`,
    })),
  ];

  // ── Technician options ────────────────────────────────────────────────────
  const techOptions = [
    { value: "", label: "Unassigned" },
    ...technicianOptions.map((t) => ({ value: t, label: t })),
  ];

  // ── Tab 0: Work Order Details ─────────────────────────────────────────────
  const Tab0 = (
    <>
      <FormSection title="Vehicle">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Vehicle" required error={errors.vehicleId}>
            <Select
              value={form.vehicleId ? String(form.vehicleId) : ""}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              options={vehicleOptions}
            />
          </Field>

          {form.vehicleId && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-base border border-border rounded-xl"
            >
              {form.vehicleImage && (
                <img
                  src={form.vehicleImage}
                  alt={form.vehicleName}
                  className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div>
                <p className="text-xs font-bold text-text-primary">
                  {form.vehicleName}
                </p>
                <p className="text-[10px] text-text-subtle">
                  {form.vehiclePlate}
                </p>
              </div>
            </motion.div>
          )}

          <Field label="Mileage at Service (km)">
            <Input
              type="number"
              value={form.mileageAtService}
              onChange={(e) => set("mileageAtService", e.target.value)}
              placeholder="e.g. 12500"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Service Details">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Service Type" required error={errors.type}>
            <Select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              options={SERVICE_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </Field>

          <Field label="Assigned Technician">
            <Select
              value={form.technicianName}
              onChange={(e) => set("technicianName", e.target.value)}
              options={techOptions}
            />
          </Field>

          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              options={SERVICE_STATUSES}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required error={errors.startDate}>
              <input
                type="date"
                className="input-luxury text-xs py-2.5"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>

            <Field label="Completion Date">
              <input
                type="date"
                className="input-luxury text-xs py-2.5"
                value={form.completedDate || ""}
                onChange={(e) => set("completedDate", e.target.value)}
                min={form.startDate}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Describe the service work required..."
              rows={3}
              className="input-luxury text-xs py-2.5 resize-none"
            />
          </Field>
        </div>
      </FormSection>
    </>
  );

  // ── Tab 1: Parts & Cost ───────────────────────────────────────────────────
  const Tab1 = (
    <>
      <FormSection title="Parts Used">
        <div className="space-y-3">
          {form.parts.length === 0 ? (
            <div
              className="flex flex-col items-center py-8 border border-dashed
                            border-border rounded-xl"
            >
              <p className="text-[11px] text-text-subtle mb-2">
                No parts added yet
              </p>
              <Button variant="ghost" size="sm" icon={Plus} onClick={addPart}>
                Add Part
              </Button>
            </div>
          ) : (
            <>
              {/* Parts list header */}
              <div className="grid grid-cols-12 gap-2 px-1">
                <p
                  className="col-span-5 text-[9px] font-bold tracking-[0.15em]
                              text-text-subtle uppercase"
                >
                  Part Name
                </p>
                <p
                  className="col-span-2 text-[9px] font-bold tracking-[0.15em]
                              text-text-subtle uppercase text-center"
                >
                  Qty
                </p>
                <p
                  className="col-span-3 text-[9px] font-bold tracking-[0.15em]
                              text-text-subtle uppercase"
                >
                  Unit Cost
                </p>
                <p
                  className="col-span-2 text-[9px] font-bold tracking-[0.15em]
                              text-text-subtle uppercase text-right"
                >
                  Total
                </p>
              </div>

              {form.parts.map((part, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      value={part.name}
                      onChange={(e) => updatePart(i, "name", e.target.value)}
                      placeholder="Part name"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={part.qty}
                      onChange={(e) => updatePart(i, "qty", e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={part.unitCost}
                      onChange={(e) =>
                        updatePart(i, "unitCost", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-[10px] font-semibold text-text-muted">
                      {Number(
                        (Number(part.qty) || 0) * (Number(part.unitCost) || 0),
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removePart(i)}
                      className="w-6 h-6 rounded-lg border border-border flex items-center
                                 justify-center text-text-subtle hover:text-rose-400
                                 hover:border-rose-400/40 transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Parts total */}
              <div
                className="flex items-center justify-between pt-3
                              border-t border-border"
              >
                <Button variant="ghost" size="sm" icon={Plus} onClick={addPart}>
                  Add Part
                </Button>
                <div className="text-right">
                  <p className="text-[9px] text-text-subtle uppercase tracking-wide">
                    Parts Total
                  </p>
                  <p className="text-sm font-extrabold text-gold">
                    AED {partsTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </FormSection>

      <FormSection title="Cost Summary">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Estimated Total Cost (AED)">
            <Input
              type="number"
              value={form.estimatedCost}
              onChange={(e) => set("estimatedCost", e.target.value)}
              placeholder="e.g. 8500"
            />
          </Field>

          <Field label="Actual Cost (AED) — fill when completed">
            <Input
              type="number"
              value={form.actualCost}
              onChange={(e) => set("actualCost", e.target.value)}
              placeholder="Leave blank until completion"
            />
          </Field>

          {/* Cost breakdown */}
          {(partsTotal > 0 || form.estimatedCost) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-base border border-border rounded-xl p-4 space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-[10px] text-text-subtle">
                  Parts total
                </span>
                <span className="text-[10px] font-semibold text-text-muted">
                  AED {partsTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-text-subtle">
                  Labour (estimated)
                </span>
                <span className="text-[10px] font-semibold text-text-muted">
                  AED{" "}
                  {Math.max(
                    0,
                    (Number(form.estimatedCost) || 0) - partsTotal,
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-wide">
                  Estimated Total
                </span>
                <span className="text-sm font-extrabold text-gold">
                  AED {Number(form.estimatedCost || 0).toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </FormSection>
    </>
  );

  const TAB_CONTENT = [Tab0, Tab1];

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
            className="flex-shrink-0 bg-card border-b border-border px-3 py-4
                          flex items-center justify-between sticky top-0 z-10"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-border flex items-center
                           justify-center text-text-muted hover:text-text-primary
                           hover:border-gold/40 transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-sm font-extrabold text-text-primary">
                  {editOrder
                    ? `Edit · ${editOrder.workOrderId}`
                    : "New Work Order"}
                </h2>
                <p className="text-[10px] text-text-subtle mt-0.5">
                  {editOrder
                    ? "Update work order details"
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
                  {editOrder ? "Update" : "Save"}
                </span>
              </Button>
            </div>
          </div>

          {/* Tab bar */}
          <div
            className="flex-shrink-0 bg-card border-b border-border
                          px-4 sticky top-[65px] z-10"
          >
            <div className="flex gap-0">
              {TABS.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setTab(i)}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-3.5 text-xs font-semibold",
                    "border-b-2 transition-all duration-200",
                    tab === i
                      ? "border-gold text-gold"
                      : "border-transparent text-text-subtle hover:text-text-muted",
                  )}
                >
                  <span
                    className={clsx(
                      "w-5 h-5 rounded-full flex items-center justify-center",
                      "text-[8px] font-bold",
                      tab === i
                        ? "bg-gold text-base"
                        : "bg-border text-text-subtle",
                    )}
                  >
                    {i + 1}
                  </span>
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {TAB_CONTENT[tab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex-shrink-0 bg-card border-t border-border px-6 py-3
                          flex items-center justify-between sticky bottom-0"
          >
            <p className="text-[10px] text-text-subtle">
              Step {tab + 1} of 2 · {TABS[tab].label}
            </p>
            <div className="flex gap-3">
              {tab > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setTab(0)}>
                  ← Previous
                </Button>
              )}
              {tab < 1 ? (
                <Button variant="primary" size="md" onClick={() => setTab(1)}>
                  Next →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={Check}
                  onClick={handleSave}
                >
                  {editOrder ? "Update" : "Save Work Order"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ServiceFormPage;
