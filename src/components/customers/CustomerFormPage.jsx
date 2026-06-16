// src/components/customers/CustomerFormPage.jsx
// 2-tab form: Profile Details → Social & Source

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, User, Link } from "lucide-react";
import { Button, Input, Select } from "../ui";
import {
  COUNTRY_CODES,
  CUSTOMER_SOURCES,
  generateCustomerId,
} from "../../data/mockData";
import apexToast from "../../utils/toast";
import clsx from "clsx";

const TABS = [
  { label: "Profile Details", icon: User },
  { label: "Social & Source", icon: Link },
];

const EMPTY = {
  customerId: "",
  name: "",
  email: "",
  mobileCode: "+971",
  mobile: "",
  whatsappCode: "+971",
  whatsapp: "",
  dob: "",
  status: "prospect",
  instagram: "",
  facebook: "",
  source: "",
  notes: "",
};

// ── Field label + error wrapper ───────────────────────────────────────────────
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

// ── Section wrapper ───────────────────────────────────────────────────────────
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

// ── Phone field with country code ─────────────────────────────────────────────
function PhoneField({
  label,
  required,
  codeVal,
  codeKey,
  phoneVal,
  phoneKey,
  onChange,
  error,
}) {
  return (
    <Field label={label} required={required} error={error}>
      <div className="flex gap-2">
        <select
          value={codeVal}
          onChange={(e) => onChange(codeKey, e.target.value)}
          className="input-luxury w-28 flex-shrink-0 text-xs py-2 "
          style={{
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A6080' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
            paddingRight: "28px",
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <input
          className="input-luxury flex-1 text-xs py-2"
          type="tel"
          placeholder="50 123 4567"
          value={phoneVal}
          onChange={(e) => onChange(phoneKey, e.target.value)}
        />
      </div>
    </Field>
  );
}

function CustomerFormPage({
  isOpen,
  onClose,
  onSave,
  editCustomer = null,
  allCustomers = [],
}) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editCustomer) {
        setForm({ ...EMPTY, ...editCustomer });
      } else {
        // BUG-023 FIX: generate ID from the full live customers array
        // allCustomers comes from the parent Customers.jsx state
        // so it always reflects the current count including unsaved additions
        setForm({
          ...EMPTY,
          customerId: generateCustomerId(allCustomers),
        });
      }
      setTab(0);
      setErrors({});
    }
  }, [isOpen, editCustomer, allCustomers]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Required";
    if (!form.email) e.email = "Required";
    if (!form.mobile) e.mobile = "Required";
    if (!form.source) e.source = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      if (errors.name || errors.email || errors.mobile) setTab(0);
      else if (errors.source) setTab(1);
      return;
    }
    onSave({
      ...form,
      id: editCustomer?.id || Date.now(),
      // BUG-021 FIX: always initialize history arrays — never undefined
      purchases: editCustomer?.purchases || [],
      inquiries: editCustomer?.inquiries || [],
      createdAt:
        editCustomer?.createdAt || new Date().toISOString().split("T")[0],
    });
    apexToast.success(
      editCustomer ? "Customer Updated" : "Customer Added",
      `${form.name} has been ${editCustomer ? "updated" : "added"} successfully.`,
    );
    onClose();
  };

  // ── Tab 0: Profile Details ────────────────────────────────────────────────
  const Tab0 = (
    <>
      <FormSection title="Customer Identity">
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
          {/* Auto-generated Customer ID — read only */}
          <Field label="Customer ID">
            <div
              className="input-luxury py-2 text-xs font-bold text-gold
                            bg-gold/[0.04] border-gold/15 cursor-not-allowed"
            >
              {form.customerId}
            </div>
          </Field>

          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              options={[
                { value: "active", label: "Active" },
                { value: "prospect", label: "Prospect" },
                { value: "inactive", label: "Inactive" },
                { value: "vip", label: "VIP" },
                { value: "blacklisted", label: "Blacklisted" },
              ]}
            />
          </Field>

          <Field label="Date of Birth">
            <input
              type="date"
              className="input-luxury text-xs py-2"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Contact Details">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Full Name" required error={errors.name}>
            <Input
              placeholder="e.g. Mohammed Al-Rashid"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>

          <Field label="Email Address" required error={errors.email}>
            <Input
              type="email"
              placeholder="e.g. customer@email.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>

          <PhoneField
            label="Mobile Number"
            required
            codeVal={form.mobileCode}
            codeKey="mobileCode"
            phoneVal={form.mobile}
            phoneKey="mobile"
            onChange={set}
            error={errors.mobile}
          />

          <PhoneField
            label="WhatsApp Number"
            codeVal={form.whatsappCode}
            codeKey="whatsappCode"
            phoneVal={form.whatsapp}
            phoneKey="whatsapp"
            onChange={set}
          />

          <Field label="Notes">
            <Input
              rows={3}
              placeholder="Any additional notes about this customer..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>
      </FormSection>
    </>
  );

  // ── Tab 1: Social & Source ────────────────────────────────────────────────
  const Tab1 = (
    <>
      <FormSection title="Source of Customer">
        <Field label="How did they find us?" required error={errors.source}>
          <Select
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            options={CUSTOMER_SOURCES}
            placeholder="Select Source"
          />
        </Field>
      </FormSection>

      <FormSection title="Social Media Links">
        <div className="space-y-4">
          {/* Instagram */}
          <Field label="Instagram">
            <div className="flex gap-3 items-center">
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center
                              bg-gold/8 border border-gold/15"
              >
                <span className="text-gold text-base font-bold">in</span>
              </div>
              <Input
                placeholder="@username or profile URL"
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
              />
            </div>
          </Field>

          {/* Facebook */}
          <Field label="Facebook">
            <div className="flex gap-3 items-center">
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center
                              bg-sky-accent/8 border border-sky-accent/15"
              >
                <span className="text-sky-accent text-base font-bold">f</span>
              </div>
              <Input
                placeholder="Profile name or URL"
                value={form.facebook}
                onChange={(e) => set("facebook", e.target.value)}
              />
            </div>
          </Field>
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
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center
                           text-text-muted hover:text-text-primary hover:border-gold/40 transition-all"
                aria-label="Go back"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="lg:text-sm text-[12px] font-extrabold text-text-primary">
                  {editCustomer
                    ? `Edit · ${editCustomer.name}`
                    : "Add New Customer"}
                </h2>
                <p className="text-[10px] text-text-subtle mt-1.5">
                  ID auto-generated · Required fields marked *
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
                  {editCustomer ? "Update Customer" : "Save Customer"}
                </span>
              </Button>
            </div>
          </div>

          {/* Tab bar */}
          <div
            className="flex-shrink-0 bg-card border-b border-border px-4
                          sticky top-[65px] z-10"
          >
            <div className="flex gap-0">
              {TABS.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setTab(i)}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-3.5 text-xs font-semibold",
                    "border-b-2 transition-all duration-200 text-left",
                    tab === i
                      ? "border-gold text-gold"
                      : "border-transparent text-text-subtle hover:text-text-muted",
                  )}
                >
                  <span
                    className={clsx(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTab(tab - 1)}
                >
                  ← Previous
                </Button>
              )}
              {tab < 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setTab(tab + 1)}
                >
                  Next Section →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={Check}
                  onClick={handleSave}
                >
                  Save Customer
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CustomerFormPage;
