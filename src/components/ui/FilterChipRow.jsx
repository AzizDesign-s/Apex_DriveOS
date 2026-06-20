// src/components/ui/FilterChipRow.jsx
//
// Generic chip row used by all 5 modules. Renders:
//   - Quick preset buttons (always visible, one-click apply)
//   - Active filter chips (only when filters are applied)
//   - "Clear all" when 2+ chips active
//   - Save current filter button (when filters are active)
//
// Config-driven via filterConfigs.js — zero per-module duplication.

import { AnimatePresence, motion } from "framer-motion";
import { BookmarkPlus, RotateCcw } from "lucide-react";
import FilterChip from "./FilterChip";
import {
  buildFilterChips,
  countActiveFilters,
} from "../../utils/filterChipUtils";

function FilterChipRow({
  activeFilters,
  onFiltersChange,
  onClearAll,
  config,
  ctx = {},
  onSaveClick,
}) {
  const chips = buildFilterChips(activeFilters, config, ctx);
  const activeCount = countActiveFilters(activeFilters, config);

  const handleApplyPreset = (preset) => {
    onFiltersChange({ ...activeFilters, ...preset.filters });
  };

  const isPresetActive = (preset) => {
    return Object.entries(preset.filters).every(([key, val]) => {
      const current = activeFilters[key];
      if (Array.isArray(val))
        return (
          Array.isArray(current) &&
          val.every((v) => current.includes(v)) &&
          current.length === val.length
        );
      return current === val;
    });
  };

  if (config.presets.length === 0 && chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Quick presets — always visible */}
      {config.presets.map((preset) => {
        const active = isPresetActive(preset);
        return (
          <button
            key={preset.label}
            onClick={() => handleApplyPreset(preset)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all flex-shrink-0 ${
              active
                ? "border-gold/50 bg-gold/10 text-gold"
                : "border-border text-text-subtle hover:border-gold/30 hover:text-text-muted"
            }`}
          >
            {preset.label}
          </button>
        );
      })}

      {chips.length > 0 && config.presets.length > 0 && (
        <div className="w-px h-4 bg-border flex-shrink-0" />
      )}

      {/* Active filter chips */}
      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <FilterChip
            key={chip.id}
            label={chip.label}
            onRemove={() => onFiltersChange(chip.onRemove())}
          />
        ))}
      </AnimatePresence>

      {/* Clear all + Save — only when filters are actually active */}
      {activeCount > 0 && (
        <motion.div
          className="flex items-center gap-1.5 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold
                       text-text-subtle hover:text-rose-400 transition-colors"
          >
            <RotateCcw size={10} /> Clear all
          </button>
          <button
            onClick={onSaveClick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold
                       text-text-subtle hover:text-gold transition-colors"
          >
            <BookmarkPlus size={11} /> Save filter
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default FilterChipRow;
