// src/components/settings/CompanySettings.jsx
// Sprint 2.1 Message 5: this is the real write-path. Message 4 only
// fixed the form's DEFAULT placeholder text — it didn't persist
// anywhere live. This version saves to useAppStore.company, which
// Sidebar/Navbar are already subscribed to, giving instant cross-app
// reflection per the brief's requirement.

import { useState, useRef } from "react";
import useAppStore from "../../store/useAppStore";
import { DEFAULT_COMPANY_INFO } from "../../data/mockData";
import apexToast from "../../utils/toast";
import { Upload, RotateCcw } from "lucide-react";
import { Check, Building2 } from "lucide-react";
import { Button, Input, Select } from "../ui";

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

function CompanySettings() {
  const company = useAppStore((s) => s.company);
  const setCompany = useAppStore((s) => s.setCompany);
  const resetCompanyToDefault = useAppStore((s) => s.resetCompanyToDefault);

  const [name, setName] = useState(company.name);
  const [tagline, setTagline] = useState(company.tagline || "");
  const [email, setEmail] = useState(company.email || "");
  const [phone, setPhone] = useState(company.phone || "");
  const [website, setWebsite] = useState(company.website || "");
  const [address, setAddress] = useState(company.address || "");
  const [city, setCity] = useState(company.city || "");
  const [country, setCountry] = useState(company.country || "");
  const [trn, setTrn] = useState(company.trn || "");
  const [bankName, setBankName] = useState(company.bankName || "");
  const [iban, setIban] = useState(company.iban || "");
  const [swift, setSwift] = useState(company.swift || "");
  const [account, setAccount] = useState(company.account || "");
  const [logoPreview, setLogoPreview] = useState(company.logo);
  const fileRef = useRef();

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Same FileReader→dataURL pattern already used for user avatars
    // elsewhere in this app — portable base64 string, survives reload
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setCompany({
      name: name.trim() || DEFAULT_COMPANY_INFO.name,
      tagline: tagline.trim(),
      logo: logoPreview,
    });
    apexToast.success(
      "Branding Updated",
      "Company branding now reflects across the platform.",
    );
  };

  const handleResetToDefault = () => {
    setName(DEFAULT_COMPANY_INFO.name);
    setTagline(DEFAULT_COMPANY_INFO.tagline);
    setLogoPreview(null);
    resetCompanyToDefault();
    apexToast.info("Reset to Default", "Branding reverted to Apex DriveOS.");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-text-primary">
            Company Branding
          </h3>
          <p className="text-[11px] text-text-subtle mt-1">
            Customize your company name and logo. Changes apply instantly across
            the platform.
          </p>
        </div>
        {company.isCustomBranding && (
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-[11px] text-text-subtle hover:text-rose-400 transition-colors"
          >
            <RotateCcw size={12} /> Reset to Apex DriveOS
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl border border-border bg-base flex items-center justify-center overflow-hidden flex-shrink-0">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <span className="text-[9px] text-text-subtle text-center px-2">
              Default Logo
            </span>
          )}
        </div>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent-light transition-colors"
          >
            <Upload size={13} /> Upload Custom Logo
          </button>
          <p className="text-[10px] text-text-subtle mt-1">
            PNG, transparent background recommended. Max 2MB.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>
      </div>

      <SectionCard
        title="Company Information"
        desc="Appears on invoices and all official documents"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Company Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.name}
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.tagline}
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.email}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.phone}
            />
          </Field>
          <Field label="Website">
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.website}
            />
          </Field>
          <Field label="TRN (Tax Registration Number)">
            <Input
              value={trn}
              onChange={(e) => setTrn(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.trn}
            />
          </Field>
          <Field label="Address">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.address}
            />
          </Field>
          <Field label="City">
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.city}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Country">
              <Select
                placeholder={DEFAULT_COMPANY_INFO.country}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
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

      <SectionCard
        title="Bank Details"
        desc="Printed on every invoice for customer payment"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Bank Name">
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.bankName}
            />
          </Field>
          <Field label="Account Number">
            <Input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.account}
            />
          </Field>
          <Field label="IBAN">
            <Input
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.iban}
            />
          </Field>
          <Field label="SWIFT / BIC">
            <Input
              value={swift}
              onChange={(e) => setSwift(e.target.value)}
              placeholder={DEFAULT_COMPANY_INFO.swift}
            />
          </Field>
        </div>
        <Button variant="primary" size="md" icon={Check} onClick={handleSave}>
          Save Company Info
        </Button>
      </SectionCard>
    </div>
  );
}

export default CompanySettings;
