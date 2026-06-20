// src/components/reports/ReportGlobalFilterBar.jsx
//
// Sticky filter bar above the tabs. Applies to whichever tab is active.
// Date Range + Vehicle Brand + Vehicle Model + Sales Executive + Status —
// exactly the 5 dimensions from the Phase 3 brief.

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, RotateCcw } from "lucide-react";
import { Select } from "../ui";
import {
  getUniqueBrands,
  getUniqueModels,
  getUniqueExecs,
} from "../../utils/reportUtils";
import ReportExportMenu from "./ReportExportMenu";

const RANGES = ["7D", "30D", "90D", "This Year"];

function ReportGlobalFilterBar({
  filters,
  onChange,
  onReset,
  cars = [],
  bookings = [],
  showCustom,
  onToggleCustom,
  activeTabLabel,
  onExportTab,
  onExportFull,
}) {
  const brands = useMemo(() => getUniqueBrands(cars), [cars]);
  const models = useMemo(
    () => getUniqueModels(cars, filters.brand),
    [cars, filters.brand],
  );
  const execs = useMemo(() => getUniqueExecs(bookings), [bookings]);

  const activeCount = [
    filters.brand,
    filters.model,
    filters.exec,
    filters.status?.length > 0,
  ].filter(Boolean).length;

  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl px-4 py-3
                 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3 flex-shrink-0"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Date range pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-base border border-border rounded-xl overflow-hidden flex-shrink-0">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => {
                set("range", r);
                onToggleCustom(false);
              }}
              className={`px-3 py-1.5 text-[11px] font-semibold transition-all ${
                filters.range === r && !showCustom
                  ? "bg-gold/10 text-gold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onToggleCustom((p) => !p);
            set("range", "");
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all flex-shrink-0 ${
            showCustom
              ? "border-gold/40 text-gold bg-gold/5"
              : "border-border text-text-muted hover:border-gold/30 hover:text-gold"
          }`}
        >
          <Calendar size={12} /> Custom
        </button>

        {showCustom && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <input
              type="date"
              className="input-luxury text-xs py-1.5 w-32"
              value={filters.from}
              onChange={(e) => set("from", e.target.value)}
            />
            <span className="text-text-subtle text-xs">→</span>
            <input
              type="date"
              className="input-luxury text-xs py-1.5 w-32"
              value={filters.to}
              onChange={(e) => set("to", e.target.value)}
            />
          </motion.div>
        )}
      </div>

      <div className="hidden lg:block w-px h-6 bg-border flex-shrink-0" />

      {/* Dimension filters */}
      <div className="flex items-center gap-2 flex-wrap flex-1">
        <div className="w-32">
          <Select
            value={filters.brand}
            onChange={(e) => {
              set("brand", e.target.value);
              set("model", "");
            }}
            options={brands}
            placeholder="All Brands"
          />
        </div>
        <div className="w-36">
          <Select
            value={filters.model}
            onChange={(e) => set("model", e.target.value)}
            options={models}
            placeholder="All Models"
          />
        </div>
        <div className="w-40">
          <Select
            value={filters.exec}
            onChange={(e) => set("exec", e.target.value)}
            options={execs}
            placeholder="All Executives"
          />
        </div>
      </div>

      {/* Reset */}
      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-400/30
                     text-rose-400 text-[11px] font-semibold hover:bg-rose-400/8 transition-all flex-shrink-0"
        >
          <RotateCcw size={12} /> Clear ({activeCount})
        </button>
      )}

      <ReportExportMenu
        activeTabLabel={activeTabLabel}
        onExportTab={onExportTab}
        onExportFull={onExportFull}
      />
    </motion.div>
  );
}

export default ReportGlobalFilterBar;
