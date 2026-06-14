// src/components/inventory/CarFormPage.jsx
// Full-screen slide-up form for Add / Edit car.
// 3 tabs: Basic Details → Media → Price & Features

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Car, Image, DollarSign, X } from "lucide-react";
import { Button, Input, Select } from "../ui";
import { BRAND_MODELS } from "../../data/mockData";
import apexToast from "../../utils/toast";
import clsx from "clsx";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { label: "Basic Details", icon: Car },
  { label: "Media", icon: Image },
  { label: "Price & Features", icon: DollarSign },
];

// ── Default empty form ────────────────────────────────────────────────────────
const EMPTY = {
  brand: "",
  model: "",
  variant: "",
  bodyType: "Sedan",
  fuelType: "Petrol",
  transmission: "Automatic",
  driveType: "RWD",
  units: 1,
  mileage: "",
  plate: "",
  status: "available",
  exteriorColor: "#1a1a1a",
  exteriorColorName: "",
  interiorColor: "#8B4513",
  interiorColorName: "",
  colorType: "Glossy",
  photos: [],
  price: "",
  currency: "AED",
  discount: "",
  features: "",
  condition: "",
};

// ── Reusable section wrapper ──────────────────────────────────────────────────
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

function CarFormPage({ isOpen, onClose, onSave, editCar = null }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // Sync form when opening for edit
  useEffect(() => {
    if (isOpen) {
      setForm(editCar ? { ...EMPTY, ...editCar } : EMPTY);
      setTab(0);
      setErrors({});
    }
  }, [isOpen, editCar]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const models = BRAND_MODELS[form.brand] || [];

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.brand) e.brand = "Required";
    if (!form.model) e.model = "Required";
    if (!form.plate) e.plate = "Required";
    if (!form.price) e.price = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      if (errors.brand || errors.model || errors.plate) setTab(0);
      else if (errors.price) setTab(2);
      return;
    }
    onSave({ ...form, id: editCar?.id || Date.now(), year: form.year || 2024 });
    apexToast.success(
      editCar ? "Car Updated" : "Car Added",
      `${form.brand} ${form.model} ${editCar ? "updated" : "added"} to inventory.`,
    );
    onClose();
  };

  // ── TAB 0: Basic Details ───────────────────────────────────────────────────
  const Tab0 = (
    <>
      <FormSection title="Car Identity">
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
          <Field label="Car Brand" required error={errors.brand}>
            <Select
              value={form.brand}
              onChange={(e) => {
                set("brand", e.target.value);
                set("model", "");
              }}
              options={Object.keys(BRAND_MODELS)}
              placeholder="Select Brand"
            />
          </Field>
          <Field label="Car Model" required error={errors.model}>
            <Select
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              options={models}
              placeholder={form.brand ? "Select Model" : "Select Brand First"}
              disabled={!form.brand}
            />
          </Field>
          <Field label="Variant">
            <Input
              placeholder="e.g. AMG Line, M Sport"
              value={form.variant}
              onChange={(e) => set("variant", e.target.value)}
            />
          </Field>
          <Field label="Body Type">
            <Select
              value={form.bodyType}
              onChange={(e) => set("bodyType", e.target.value)}
              options={[
                "Sedan",
                "SUV",
                "Coupe",
                "Convertible",
                "Hatchback",
                "Wagon",
              ]}
            />
          </Field>
          <Field label="Fuel Type">
            <Select
              value={form.fuelType}
              onChange={(e) => set("fuelType", e.target.value)}
              options={["Petrol", "Diesel", "Electric", "Hybrid"]}
            />
          </Field>
          <Field label="Transmission">
            <Select
              value={form.transmission}
              onChange={(e) => set("transmission", e.target.value)}
              options={["Automatic", "Manual", "Semi-Auto"]}
            />
          </Field>
          <Field label="Drive Type">
            <Select
              value={form.driveType}
              onChange={(e) => set("driveType", e.target.value)}
              options={["RWD", "FWD", "AWD", "4WD"]}
            />
          </Field>
          <Field label="Total Units">
            <Input
              type="number"
              value={form.units}
              onChange={(e) => set("units", e.target.value)}
            />
          </Field>
          <Field label="Mileage (km)">
            <Input
              type="number"
              placeholder="e.g. 1200"
              value={form.mileage}
              onChange={(e) => set("mileage", e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Registration & Colors">
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
          <Field label="Plate Number" required error={errors.plate}>
            <Input
              placeholder="e.g. AXG-2024"
              value={form.plate}
              onChange={(e) => set("plate", e.target.value)}
            />
          </Field>
          <Field label="Car Status">
            <Select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              options={[
                { value: "available", label: "Available" },
                { value: "reserved", label: "Reserved" },
                { value: "sold", label: "Sold" },
                { value: "maintenance", label: "Maintenance" },
              ]}
            />
          </Field>
          <Field label="Color Type">
            <Select
              value={form.colorType}
              onChange={(e) => set("colorType", e.target.value)}
              options={[
                "Glossy",
                "Matte",
                "Satin",
                "Metallic",
                "Pearl",
                "Wrap",
              ]}
            />
          </Field>

          {/* Exterior color picker */}
          <Field label="Exterior Color" span="col-span-1">
            <div className="flex gap-2 items-center">
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer
                             hover:scale-105 transition-transform"
                  style={{ background: form.exteriorColor }}
                  onClick={() =>
                    document.getElementById("ext-color-input").click()
                  }
                  title="Pick color"
                />
                <input
                  id="ext-color-input"
                  type="color"
                  className="absolute opacity-0 w-0 h-0"
                  value={form.exteriorColor}
                  onChange={(e) => set("exteriorColor", e.target.value)}
                />
              </div>
              <Input
                placeholder="e.g. Obsidian Black"
                value={form.exteriorColorName}
                onChange={(e) => set("exteriorColorName", e.target.value)}
              />
            </div>
          </Field>

          {/* Interior color picker */}
          <Field label="Interior Color">
            <div className="flex gap-2 items-center">
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl border border-border cursor-pointer
                             hover:scale-105 transition-transform"
                  style={{ background: form.interiorColor }}
                  onClick={() =>
                    document.getElementById("int-color-input").click()
                  }
                  title="Pick color"
                />
                <input
                  id="int-color-input"
                  type="color"
                  className="absolute opacity-0 w-0 h-0"
                  value={form.interiorColor}
                  onChange={(e) => set("interiorColor", e.target.value)}
                />
              </div>
              <Input
                placeholder="e.g. Saddle Brown"
                value={form.interiorColorName}
                onChange={(e) => set("interiorColorName", e.target.value)}
              />
            </div>
          </Field>
        </div>
      </FormSection>
    </>
  );

  // ── TAB 1: Media ───────────────────────────────────────────────────────────
  const PHOTO_LABELS = [
    "Exterior Front",
    "Exterior Rear",
    "Exterior Side",
    "Interior",
    "Dashboard",
    "Engine Bay",
    "Boot",
  ];

  const handleFiles = (files) => {
    const newPhotos = Array.from(files).map((f) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(f),
      label: "Exterior Front",
    }));
    set("photos", [...(form.photos || []), ...newPhotos]);
  };

  const Tab1 = (
    <FormSection title="Car Photos">
      {/* Drop zone */}
      <div
        className="border border-dashed border-border rounded-xl p-8 text-center
                   hover:border-gold/40 hover:bg-gold/[0.02] transition-all cursor-pointer mb-4"
        onClick={() => document.getElementById("photo-file-input").click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Image size={28} className="text-text-subtle mx-auto mb-3" />
        <p className="text-sm font-semibold text-text-muted mb-1">
          Drop photos here or click to upload
        </p>
        <p className="text-xs text-text-subtle">
          JPG, PNG up to 10MB · Multiple files supported
        </p>
        <input
          id="photo-file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Photo grid */}
      {form.photos?.length > 0 && (
        <div className="grid sm:grid-cols-4 grid-cols-1 gap-3 mb-4">
          {form.photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border">
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Label selector */}
              <select
                className="absolute bottom-0 left-0 right-0 bg-black/70 text-white
                           text-[9px] border-0 rounded-b-xl px-2 py-1 outline-none"
                value={photo.label}
                onChange={(e) =>
                  set(
                    "photos",
                    form.photos.map((p) =>
                      p.id === photo.id ? { ...p, label: e.target.value } : p,
                    ),
                  )
                }
              >
                {PHOTO_LABELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
              {/* Remove */}
              <button
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60
                           flex items-center justify-center opacity-0 group-hover:opacity-100
                           transition-opacity"
                onClick={() =>
                  set(
                    "photos",
                    form.photos.filter((p) => p.id !== photo.id),
                  )
                }
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick label chips */}
      <div>
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-2">
          Quick Labels
        </p>
        <div className="flex flex-wrap gap-2">
          {PHOTO_LABELS.map((l) => (
            <span
              key={l}
              className="text-[10px] bg-gold/10 text-gold border border-gold/20
                                     px-3 py-1 rounded-full cursor-pointer hover:bg-gold/20 transition-colors"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </FormSection>
  );

  // ── TAB 2: Price & Features ────────────────────────────────────────────────
  const finalPrice = Math.max(
    0,
    Number(form.price || 0) - Number(form.discount || 0),
  );

  const Tab2 = (
    <>
      <FormSection title="Pricing">
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
          <Field label="Car Price" required error={errors.price}>
            <div className="flex gap-2">
              <Select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                options={["AED", "USD", "EUR", "GBP", "SAR", "QAR"]}
                className="w-24 flex-shrink-0"
              />
              <Input
                type="number"
                placeholder="e.g. 680000"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
          </Field>
          <Field label="Discount (Static)">
            <div className="flex gap-2">
              <Select
                value="AED"
                options={["AED", "%"]}
                className="w-20 flex-shrink-0"
              />
              <Input
                type="number"
                placeholder="0"
                value={form.discount}
                onChange={(e) => set("discount", e.target.value)}
              />
            </div>
          </Field>
        </div>

        {/* Live price preview */}
        {Number(form.price) > 0 && (
          <div
            className="mt-3 flex items-center justify-between
                          bg-gold/[0.04] border border-gold/10 rounded-xl px-4 py-3"
          >
            <span className="text-xs text-text-subtle">
              Final Price After Discount
            </span>
            <span className="text-lg font-extrabold text-gold">
              {form.currency} {finalPrice.toLocaleString()}
            </span>
          </div>
        )}
      </FormSection>

      <FormSection title="Car Features">
        <p className="text-xs text-text-subtle mb-2">
          Use • for bullet points. Press Enter for a new line.
        </p>
        <Input
          rows={6}
          placeholder={
            "• AMG Performance exhaust\n• Burmester surround sound\n• Night Vision Assist"
          }
          value={form.features}
          onChange={(e) => set("features", e.target.value)}
        />
      </FormSection>

      <FormSection title="Car Condition">
        <Input
          rows={4}
          placeholder="Describe the car's overall condition, service history, any notes..."
          value={form.condition}
          onChange={(e) => set("condition", e.target.value)}
        />
      </FormSection>
    </>
  );

  const TAB_CONTENT = [Tab0, Tab1, Tab2];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-base flex flex-col "
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
                  {editCar
                    ? `Edit · ${editCar.brand} ${editCar.model}`
                    : "Add New Car"}
                </h2>
                <p className="text-[10px] text-text-subtle mt-1.5">
                  3 sections · Required fields marked *
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
                  {editCar ? "Update Car" : "Save Car"}
                </span>
              </Button>
            </div>
          </div>

          {/* ── Tab bar ── */}
          <div className="flex-shrink-0 bg-card border-b border-border px-4 sticky top-[65px] z-10 ">
            <div className="flex gap-0">
              {TABS.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setTab(i)}
                  className={clsx(
                    "flex items-center gap-2 sm:px-5 px-2  py-3.5 text-xs font-semibold text-left",
                    "border-b-2 transition-all duration-200",
                    tab === i
                      ? "border-gold text-gold"
                      : "border-transparent text-text-subtle hover:text-text-muted",
                  )}
                >
                  <span
                    className={clsx(
                      "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ",
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

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
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
            className="flex-shrink-0 bg-card border-t border-border px-4 py-3
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
                  Next Section →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={Check}
                  onClick={handleSave}
                >
                  Save Car
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CarFormPage;
