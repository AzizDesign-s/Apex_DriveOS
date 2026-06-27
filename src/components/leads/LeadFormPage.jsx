// src/components/leads/LeadFormPage.jsx
// Full-screen slide-up form for creating and editing leads.
// Same pattern as CustomerFormPage / UserFormPage.
//
// TABS:
//   Tab 1 — Lead Info   (name, phone, email, source, notes)
//   Tab 2 — Vehicle     (car selector with image preview)
//   Tab 3 — Assignment  (exec, follow-up date)
//
// ON SAVE:
//   — Validates required fields
//   — Calls onSave(leadData) — parent handles localStorage + cross-module sync
//
// CAR SELECTOR:
//   — Dropdown of all cars from localStorage (live, not seed)
//   — Selected car's first photo appears as preview
//   — Shows plate, price, status alongside name

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, User, Car, UserCheck, Camera } from "lucide-react";
import { Button, Input, Select } from "../ui";
import { LEAD_SOURCES } from "../../data/mockLeads";
import { COUNTRY_CODES } from "../../data/mockData";
import apexToast from "../../utils/toast";
import clsx from "clsx";

const TABS = [
  { label: "Lead Info", icon: User },
  { label: "Vehicle", icon: Car },
  { label: "Assignment", icon: UserCheck },
];

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  mobileCode: "+971",
  source: "Walk-in",
  notes: "",
  interestedCarId: null,
  interestedCarName: "",
  interestedCarPlate: "",
  interestedCarImage: null,
  assignedExec: "",
  followUpDate: "",
  status: "new_inquiry",
};

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

function LeadFormPage({
  isOpen,
  onClose,
  onSave,
  editLead = null,
  allLeads = [],
  execOptions = [], // users with Sales Executive role
}) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  // ── Load live cars from localStorage ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem("apex-driveos-cars");
      const parsed = saved ? JSON.parse(saved) : [];
      // Show all cars except sold ones — sold cars can't be purchased again
      setCars(parsed.filter((c) => c.status !== "sold"));
    } catch {
      setCars([]);
    }
  }, [isOpen]);

  // ── Populate form on open ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (editLead) {
      setForm({
        ...EMPTY,
        ...editLead,
        followUpDate: editLead.followUpDate || "",
        interestedCarId: editLead.interestedCarId || null,
      });
      // Restore selected car for preview
      if (editLead.interestedCarId) {
        try {
          const saved = localStorage.getItem("apex-driveos-cars");
          const allCars = saved ? JSON.parse(saved) : [];
          const car = allCars.find((c) => c.id === editLead.interestedCarId);
          setSelectedCar(car || null);
        } catch {
          setSelectedCar(null);
        }
      }
    } else {
      setForm({ ...EMPTY });
      setSelectedCar(null);
    }
    setTab(0);
    setErrors({});
  }, [isOpen, editLead]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // ── Car selection handler ─────────────────────────────────────────────────
  const handleCarSelect = (carId) => {
    if (!carId) {
      setSelectedCar(null);
      set("interestedCarId", null);
      set("interestedCarName", "");
      set("interestedCarPlate", "");
      set("interestedCarImage", null);
      return;
    }
    const car = cars.find((c) => c.id === Number(carId));
    if (!car) return;
    setSelectedCar(car);
    set("interestedCarId", car.id);
    set("interestedCarName", `${car.brand} ${car.model}`);
    set("interestedCarPlate", car.plate || "");
    set("interestedCarImage", car.photos?.[0]?.url || null);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.source) e.source = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      if (errors.name || errors.phone || errors.source) setTab(0);
      return;
    }
    const { followUpDate, ...rest } = form;
    onSave({
      ...rest,
      id: editLead?.id || null,
      leadId: editLead?.leadId || null,
      followUpDate: followUpDate || null,
      createdAt: editLead?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerId: editLead?.customerId || null,
      convertedAt: editLead?.convertedAt || null,
    });
  };

  // ── Car options for select dropdown ──────────────────────────────────────
  const carOptions = [
    { value: "", label: "No vehicle selected" },
    ...cars.map((c) => ({
      value: String(c.id),
      label: `${c.brand} ${c.model} — ${c.plate} (${c.status})`,
    })),
  ];

  // ── Exec options ──────────────────────────────────────────────────────────
  const execSelectOptions = [
    { value: "", label: "Unassigned" },
    ...execOptions.map((e) => ({ value: e, label: e })),
  ];

  // ── Tab 1: Lead Info ──────────────────────────────────────────────────────
  const Tab0 = (
    <>
      <FormSection title="Contact Details">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Full Name" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Ahmed Al-Sayed"
            />
          </Field>

          <Field label="Phone Number" required error={errors.phone}>
            <div className="flex gap-2">
              <select
                value={form.mobileCode}
                onChange={(e) => set("mobileCode", e.target.value)}
                className="input-luxury text-xs py-2.5 w-28 flex-shrink-0"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="50 123 4567"
                className="flex-1"
              />
            </div>
          </Field>

          <Field label="Email Address">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="customer@email.com"
            />
          </Field>

          <Field label="Lead Source" required error={errors.source}>
            <Select
              value={form.source}
              onChange={(e) => set("source", e.target.value)}
              options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))}
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any additional context about this lead..."
              rows={3}
              className="input-luxury text-xs py-2.5 resize-none"
            />
          </Field>
        </div>
      </FormSection>
    </>
  );

  // ── Tab 2: Vehicle ────────────────────────────────────────────────────────
  const Tab1 = (
    <>
      <FormSection title="Interested Vehicle">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Select Vehicle">
            <Select
              value={form.interestedCarId ? String(form.interestedCarId) : ""}
              onChange={(e) => handleCarSelect(e.target.value)}
              options={carOptions}
            />
          </Field>

          {/* Car preview */}
          {selectedCar && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-xl overflow-hidden"
            >
              {/* Car image */}
              {selectedCar.photos?.[0]?.url ? (
                <img
                  src={selectedCar.photos[0].url}
                  alt={`${selectedCar.brand} ${selectedCar.model}`}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div
                  className="w-full h-40 bg-base flex items-center
                                justify-center border-b border-border"
                >
                  <Car size={32} className="text-text-subtle/30" />
                </div>
              )}

              {/* Car details */}
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Brand", value: selectedCar.brand },
                  { label: "Model", value: selectedCar.model },
                  { label: "Year", value: selectedCar.year },
                  { label: "Plate", value: selectedCar.plate },
                  {
                    label: "Price",
                    value: `AED ${Number(selectedCar.price).toLocaleString()}`,
                  },
                  {
                    label: "Status",
                    value:
                      selectedCar.status.charAt(0).toUpperCase() +
                      selectedCar.status.slice(1),
                  },
                ].map((d) => (
                  <div key={d.label}>
                    <p
                      className="text-[9px] font-bold tracking-[0.15em]
                                  text-text-subtle uppercase mb-0.5"
                    >
                      {d.label}
                    </p>
                    <p className="text-xs font-semibold text-text-primary">
                      {d.value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Status warning */}
              {selectedCar.status === "reserved" && (
                <div
                  className="mx-4 mb-4 px-3 py-2 bg-amber-400/8
                                border border-amber-400/20 rounded-lg"
                >
                  <p className="text-[10px] text-amber-400 font-semibold">
                    ⚠ This vehicle is already reserved. Selecting it will create
                    a competing lead — the sales exec will be notified.
                  </p>
                </div>
              )}

              {selectedCar.status === "maintenance" && (
                <div
                  className="mx-4 mb-4 px-3 py-2 bg-rose-400/8
                                border border-rose-400/20 rounded-lg"
                >
                  <p className="text-[10px] text-rose-400 font-semibold">
                    ℹ This vehicle is currently in maintenance. It will be
                    available soon.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {!selectedCar && (
            <div
              className="flex flex-col items-center justify-center py-10
                            border border-dashed border-border rounded-xl"
            >
              <Car size={28} className="text-text-subtle/30 mb-2" />
              <p className="text-[11px] text-text-subtle">
                Select a vehicle from the dropdown above
              </p>
            </div>
          )}
        </div>
      </FormSection>
    </>
  );

  // ── Tab 3: Assignment ─────────────────────────────────────────────────────
  const Tab2 = (
    <>
      <FormSection title="Assignment & Follow-up">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Assign Sales Executive">
            <Select
              value={form.assignedExec}
              onChange={(e) => set("assignedExec", e.target.value)}
              options={execSelectOptions}
            />
          </Field>

          <Field label="Follow-up Date">
            <input
              type="date"
              className="input-luxury text-xs py-2.5"
              value={form.followUpDate || ""}
              onChange={(e) => set("followUpDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </Field>

          {/* Summary preview */}
          {(form.name || form.interestedCarName) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-base border border-border rounded-xl p-4"
            >
              <p
                className="text-[9px] font-bold tracking-[0.2em] text-gold
                            uppercase mb-3"
              >
                Lead Summary
              </p>
              <div className="space-y-2">
                {[
                  { label: "Name", value: form.name },
                  { label: "Phone", value: `${form.mobileCode} ${form.phone}` },
                  { label: "Source", value: form.source },
                  {
                    label: "Vehicle",
                    value: form.interestedCarName || "Not selected",
                  },
                  { label: "Exec", value: form.assignedExec || "Unassigned" },
                  { label: "Follow-up", value: form.followUpDate || "Not set" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span
                      className="text-[9px] font-bold tracking-[0.15em]
                                     text-text-subtle uppercase w-16 flex-shrink-0"
                    >
                      {r.label}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </FormSection>
    </>
  );

  const TAB_CONTENT = [Tab0, Tab1, Tab2];

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
            className="flex-shrink-0 bg-card border-b border-border px-3 py-4
                          flex items-center justify-between sticky top-0 z-10"
          >
            <div className="flex items-center gap-2">
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
                  {editLead ? `Edit Lead · ${editLead.name}` : "Add New Lead"}
                </h2>
                <p className="text-[10px] text-text-subtle mt-0.5">
                  {editLead
                    ? "Update lead information"
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
                  {editLead ? "Update Lead" : "Save Lead"}
                </span>
              </Button>
            </div>
          </div>

          {/* ── Tab bar ── */}
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

          {/* ── Tab content ── */}
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

          {/* ── Footer navigation ── */}
          <div
            className="flex-shrink-0 bg-card border-t border-border px-6 py-3
                          flex items-center justify-between sticky bottom-0"
          >
            <p className="text-[10px] text-text-subtle">
              Step {tab + 1} of 3 · {TABS[tab].label}
            </p>
            <div className="flex gap-3">
              {tab > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTab(tab - 1)}
                >
                  ← Previous
                </Button>
              )}
              {tab < 2 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setTab(tab + 1)}
                >
                  Next →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={Check}
                  onClick={handleSave}
                >
                  {editLead ? "Update Lead" : "Save Lead"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LeadFormPage;
