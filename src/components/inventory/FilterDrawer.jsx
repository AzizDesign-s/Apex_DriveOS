// src/components/inventory/FilterDrawer.jsx
// Slides in from the right. All filter state is local — applied on confirm.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { Button, Select } from "../ui";

const STATUS_OPTS = ["available", "reserved", "sold", "maintenance"];
const FUEL_OPTS = ["Petrol", "Diesel", "Electric", "Hybrid"];
const BODY_OPTS = [
  "Sedan",
  "SUV",
  "Coupe",
  "Convertible",
  "Hatchback",
  "Wagon",
];
const TRANS_OPTS = ["Automatic", "Manual", "Semi-Auto"];

// ── Reusable chip ─────────────────────────────────────────────────────────────
function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border
                  transition-all cursor-pointer ${
                    active
                      ? "border-gold/50 text-gold bg-gold/8"
                      : "border-border text-text-subtle hover:border-gold/30 hover:text-text-muted"
                  }`}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </button>
  );
}

// ── Filter section wrapper ────────────────────────────────────────────────────
function FilterSection({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function FilterDrawer({
  isOpen,
  onClose,
  onApply,
  brands = [],
  activeCount = 0,
}) {
  const [status, setStatus] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [bodyType, setBodyType] = useState([]);
  const [transmission, setTransmission] = useState([]);
  const [brand, setBrand] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const localCount =
    status.length +
    fuel.length +
    bodyType.length +
    transmission.length +
    (brand ? 1 : 0) +
    (priceMin || priceMax ? 1 : 0);

  const handleClear = () => {
    setStatus([]);
    setFuel([]);
    setBodyType([]);
    setTransmission([]);
    setBrand("");
    setPriceMin("");
    setPriceMax("");
  };

  const handleApply = () => {
    onApply({
      status,
      fuel,
      bodyType,
      transmission,
      brand,
      priceMin,
      priceMax,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 sm:w-[400px] w-11/12 z-40
                       bg-card border-l border-border flex flex-col shadow-glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4
                            border-b border-border flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-gold" />
                <h3 className="text-sm font-extrabold text-text-primary">
                  Filter Inventory
                </h3>
                {localCount > 0 && (
                  <span
                    className="text-[9px] font-bold bg-gold/15 text-gold
                                   px-1.5 py-0.5 rounded-full"
                  >
                    {localCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                           text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all"
                aria-label="Close filter drawer"
              >
                <X size={13} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-none">
              <FilterSection title="Status">
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTS.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      active={status.includes(s)}
                      onClick={() => toggle(status, setStatus, s)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Brand">
                <Select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  options={brands}
                  placeholder="All Brands"
                />
              </FilterSection>

              <FilterSection title="Fuel Type">
                <div className="flex flex-wrap gap-2">
                  {FUEL_OPTS.map((f) => (
                    <Chip
                      key={f}
                      label={f}
                      active={fuel.includes(f)}
                      onClick={() => toggle(fuel, setFuel, f)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Body Type">
                <div className="flex flex-wrap gap-2">
                  {BODY_OPTS.map((b) => (
                    <Chip
                      key={b}
                      label={b}
                      active={bodyType.includes(b)}
                      onClick={() => toggle(bodyType, setBodyType, b)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Transmission">
                <div className="flex flex-wrap gap-2">
                  {TRANS_OPTS.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      active={transmission.includes(t)}
                      onClick={() => toggle(transmission, setTransmission, t)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Price Range (AED)">
                <div className="flex gap-2">
                  <input
                    className="input-luxury text-xs py-2 flex-1"
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <input
                    className="input-luxury text-xs py-2 flex-1"
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </FilterSection>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-border flex-shrink-0">
              <Button variant="ghost" onClick={handleClear} fullWidth>
                Clear All
              </Button>
              <Button
                variant="primary"
                icon={Check}
                onClick={handleApply}
                fullWidth
              >
                Apply{localCount > 0 ? ` (${localCount})` : ""}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FilterDrawer;
