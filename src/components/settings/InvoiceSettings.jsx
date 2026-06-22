// src/components/settings/InvoiceSettings.jsx

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, FileText } from "lucide-react";
import { Button, Input, Select } from "../ui";
import apexToast from "../../utils/toast";
import clsx from "clsx";

function SectionCard({ title, desc, children }) {
  return (
    <div className="bg-base border border-border rounded-2xl p-5 mb-4">
      <div className="mb-4 pb-3 border-b border-border">
        <p className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase">
          {title}
        </p>
        {desc && <p className="text-[10px] text-text-subtle mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

// Invoice template style cards
const TEMPLATE_STYLES = [
  {
    id: "classic",
    label: "Classic Gold",
    desc: "Dark header · Gold accents · Current style",
    active: true,
  },
  {
    id: "minimal",
    label: "Minimal White",
    desc: "Clean white · Black text · No branding bar",
    active: false,
    soon: true,
  },
  {
    id: "bold",
    label: "Bold Dark",
    desc: "Full dark background · High contrast",
    active: false,
    soon: true,
  },
];

const LS_KEY = "apex-driveos-invoice-settings";

const DEFAULT_INVOICE_SETTINGS = {
  defaultVat: "5",
  defaultCurrency: "AED",
  defaultDueDays: "14",
  invoicePrefix: "INV-",
  footerText:
    "Thank you for your business. Payment is due within the specified terms.",
  termsText:
    "All sales are final. Prices are inclusive of VAT where applicable.",
  showBankDetails: true,
  showQrCode: true,
  templateStyle: "classic",
};

export const loadInvoiceSettings = () => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_INVOICE_SETTINGS;
  } catch {
    return DEFAULT_INVOICE_SETTINGS;
  }
};

function InvoiceSettings() {
  // BUG-054 FIX: initialize from localStorage
  const [form, setForm] = useState(() => loadInvoiceSettings());

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    // BUG-054 FIX: persist to localStorage
    localStorage.setItem(LS_KEY, JSON.stringify(form));
    apexToast.success("Invoice Settings Saved", "Invoice defaults updated.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* Defaults */}
      <SectionCard
        title="Invoice Defaults"
        desc="Pre-filled values when creating a new invoice"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <Field label="Default VAT Rate (%)">
            <Input
              type="number"
              value={form.defaultVat}
              onChange={(e) => set("defaultVat", e.target.value)}
              placeholder="5"
            />
          </Field>
          <Field label="Default Currency">
            <Select
              value={form.defaultCurrency}
              onChange={(e) => set("defaultCurrency", e.target.value)}
              options={["AED", "USD", "EUR", "GBP", "SAR", "QAR"]}
            />
          </Field>
          <Field label="Default Payment Terms (Days)">
            <Select
              value={form.defaultDueDays}
              onChange={(e) => set("defaultDueDays", e.target.value)}
              options={[
                { value: "7", label: "7 days" },
                { value: "14", label: "14 days" },
                { value: "30", label: "30 days" },
                { value: "45", label: "45 days" },
                { value: "60", label: "60 days" },
              ]}
            />
          </Field>
          <Field label="Invoice Number Prefix">
            <Input
              value={form.invoicePrefix}
              onChange={(e) => set("invoicePrefix", e.target.value)}
              placeholder="INV-"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Template style */}
      <SectionCard
        title="Invoice Template Style"
        desc="Visual style of the printed invoice PDF. More styles coming soon."
      >
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-3 mb-2">
          {TEMPLATE_STYLES.map((t) => (
            <button
              key={t.id}
              onClick={() => !t.soon && set("templateStyle", t.id)}
              disabled={t.soon}
              className={clsx(
                "flex flex-col items-start gap-2.5 p-4 rounded-xl border transition-all text-left",
                t.soon && "opacity-50 cursor-not-allowed",
                form.templateStyle === t.id && !t.soon
                  ? "border-gold/50 bg-gold/8"
                  : "border-border hover:border-gold/25 bg-card",
              )}
            >
              {/* Mini invoice preview */}
              <div
                className={clsx(
                  "w-full h-16 rounded-lg border flex flex-col overflow-hidden",
                  t.id === "classic" && "border-[#1B2E4A]",
                  t.id === "minimal" && "border-slate-200 bg-white",
                  t.id === "bold" && "border-slate-700 bg-slate-900",
                )}
              >
                {/* Header bar */}
                <div
                  className={clsx(
                    "h-5 flex items-center px-2 gap-1.5",
                    t.id === "classic" && "bg-[#080C14]",
                    t.id === "minimal" && "bg-white border-b border-slate-100",
                    t.id === "bold" && "bg-slate-900",
                  )}
                >
                  <div
                    className={clsx(
                      "w-3 h-3 rounded-sm",
                      t.id === "classic" && "bg-gold/80",
                      t.id === "minimal" && "bg-slate-900",
                      t.id === "bold" && "bg-amber-400",
                    )}
                  />
                  <div
                    className={clsx(
                      "h-1.5 rounded flex-1 max-w-[40px]",
                      t.id === "classic" && "bg-gold/40",
                      t.id === "minimal" && "bg-slate-300",
                      t.id === "bold" && "bg-amber-400/40",
                    )}
                  />
                  <div
                    className={clsx(
                      "h-1.5 rounded ml-auto w-6",
                      t.id === "classic" && "bg-white/20",
                      t.id === "minimal" && "bg-slate-200",
                      t.id === "bold" && "bg-white/20",
                    )}
                  />
                </div>
                {/* Body lines */}
                <div className="flex-1 px-2 py-1.5 flex flex-col gap-1">
                  {[60, 80, 45].map((w, i) => (
                    <div
                      key={i}
                      className="h-1 rounded"
                      style={{
                        width: `${w}%`,
                        background:
                          t.id === "classic"
                            ? "rgba(255,255,255,0.12)"
                            : t.id === "minimal"
                              ? "#E2E8F0"
                              : "rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <p
                    className={clsx(
                      "text-[11px] font-bold",
                      form.templateStyle === t.id && !t.soon
                        ? "text-gold"
                        : "text-text-muted",
                    )}
                  >
                    {t.label}
                  </p>
                  {t.soon && (
                    <span className="text-[8px] bg-border text-text-subtle px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                  {form.templateStyle === t.id && !t.soon && (
                    <Check size={11} className="text-gold" />
                  )}
                </div>
                <p className="text-[9px] text-text-subtle mt-0.5">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Footer & Terms */}
      <SectionCard
        title="Invoice Footer Text"
        desc="Appears at the bottom of every printed invoice"
      >
        <div className="space-y-4 mb-4">
          <Field label="Footer Message">
            <Input
              rows={2}
              value={form.footerText}
              onChange={(e) => set("footerText", e.target.value)}
              placeholder="Thank you for your business..."
            />
          </Field>
          <Field label="Terms & Conditions">
            <Input
              rows={3}
              value={form.termsText}
              onChange={(e) => set("termsText", e.target.value)}
              placeholder="All sales are final..."
            />
          </Field>
        </div>
      </SectionCard>

      {/* Display options */}
      <SectionCard title="Invoice Display Options">
        {[
          {
            key: "showBankDetails",
            label: "Show bank details on invoice",
            desc: "IBAN, SWIFT and account number",
          },
          {
            key: "showQrCode",
            label: "Show QR code placeholder",
            desc: "QR code area reserved for future e-payment integration",
          },
        ].map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div>
              <p className="text-xs font-semibold text-text-primary">{label}</p>
              <p className="text-[10px] text-text-subtle mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => set(key, !form[key])}
              role="switch"
              aria-checked={form[key]}
              aria-label={label}
              className={clsx(
                "relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ml-4",
                form[key] ? "bg-gold" : "bg-border",
              )}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ left: form[key] ? "24px" : "4px" }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            </button>
          </div>
        ))}
      </SectionCard>

      <Button variant="primary" size="md" icon={Check} onClick={handleSave}>
        Save Invoice Settings
      </Button>
    </motion.div>
  );
}

export default InvoiceSettings;
