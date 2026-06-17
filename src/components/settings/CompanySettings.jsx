// src/components/settings/CompanySettings.jsx

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Upload, Building2 } from "lucide-react";
import { Button, Input, Select } from "../ui";
import apexToast from "../../utils/toast";

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

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const LS_KEY = "apex-gt-company-settings";

const DEFAULT_COMPANY = {
  name: "APEX GT Cars LLC",
  tagline: "Luxury Automotive · Dubai",
  email: "info@apexgt.ae",
  phone: "+971 4 000 0000",
  website: "apexgt.ae",
  address: "Sheikh Zayed Road",
  city: "Dubai",
  country: "United Arab Emirates",
  trn: "100432687000003",
  bankName: "Emirates NBD",
  iban: "AE07 0260 0010 0246 8003 6",
  swift: "EBILAEAD",
  account: "1002468003-6",
};

function CompanySettings() {
  // BUG-053 FIX: initialize from localStorage
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
    } catch {
      return DEFAULT_COMPANY;
    }
  });

  const [logoPreview, setLogoPreview] = useState(() => {
    return localStorage.getItem("apex-gt-company-logo") || null;
  });

  const logoRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    // BUG-053 FIX: persist to localStorage
    localStorage.setItem(LS_KEY, JSON.stringify(form));
    if (logoPreview) {
      localStorage.setItem("apex-gt-company-logo", logoPreview);
    }
    apexToast.success(
      "Company Info Saved",
      "Company details updated successfully.",
    );
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* Logo */}
      <SectionCard
        title="Company Logo"
        desc="Used on invoices, documents and the dashboard header"
      >
        <div className="flex items-center gap-5 flex-wrap">
          <div
            className="w-20 h-20 rounded-2xl bg-card border border-border
                        flex items-center justify-center overflow-hidden flex-shrink-0"
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="text-center">
                <div
                  className="w-10 h-10 mx-auto flex items-center justify-center
                              text-[12px] font-black text-[#0B0F14]"
                  style={{
                    background: "linear-gradient(135deg,#B8931F,#D4AF37)",
                    clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
                  }}
                >
                  GT
                </div>
              </div>
            )}
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              icon={Upload}
              onClick={() => logoRef.current?.click()}
            >
              Upload Logo
            </Button>
            <p className="text-[10px] text-text-subtle mt-2">
              PNG or SVG · Recommended 200×200px
            </p>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>
      </SectionCard>

      {/* Basic info */}
      <SectionCard
        title="Company Information"
        desc="Appears on invoices and all official documents"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Company Name" required>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Website">
            <Input
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </Field>
          <Field label="TRN (Tax Registration Number)">
            <Input
              value={form.trn}
              onChange={(e) => set("trn", e.target.value)}
            />
          </Field>
          <Field label="Address">
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
          <Field label="City">
            <Input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Country">
              <Select
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                options={[
                  "United Arab Emirates",
                  "Saudi Arabia",
                  "Qatar",
                  "Kuwait",
                  "Bahrain",
                  "Oman",
                ]}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* Bank details */}
      <SectionCard
        title="Bank Details"
        desc="Printed on every invoice for customer payment"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Bank Name">
            <Input
              value={form.bankName}
              onChange={(e) => set("bankName", e.target.value)}
            />
          </Field>
          <Field label="Account Number">
            <Input
              value={form.account}
              onChange={(e) => set("account", e.target.value)}
            />
          </Field>
          <Field label="IBAN">
            <Input
              value={form.iban}
              onChange={(e) => set("iban", e.target.value)}
            />
          </Field>
          <Field label="SWIFT / BIC">
            <Input
              value={form.swift}
              onChange={(e) => set("swift", e.target.value)}
            />
          </Field>
        </div>
        <Button variant="primary" size="md" icon={Check} onClick={handleSave}>
          Save Company Info
        </Button>
      </SectionCard>
    </motion.div>
  );
}

export default CompanySettings;
