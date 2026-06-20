// src/components/ui/SavedFiltersDropdown.jsx
//
// Dropdown listing saved filter combos for a module. Generic — works for
// all 5 modules via the config's storageKey. Includes the "save current
// filter" prompt UI as well (triggered from FilterChipRow's Save button).

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, Check, X } from "lucide-react";
import { Button, Input } from ".";

const loadSaved = (storageKey) => {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const writeSaved = (storageKey, list) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
  } catch {
    /* silent */
  }
};

function SavedFiltersDropdown({
  isOpen,
  onClose,
  anchorRef,
  storageKey,
  currentFilters,
  onApply,
  saveMode = false,
  onSaveComplete,
}) {
  const [saved, setSaved] = useState(() => loadSaved(storageKey));
  const [saveName, setSaveName] = useState("");
  const ref = useRef();

  useEffect(() => {
    if (isOpen) setSaved(loadSaved(storageKey));
  }, [isOpen, storageKey]);

  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        !anchorRef?.current?.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  const handleSave = () => {
    if (!saveName.trim()) return;
    const newSaved = [
      ...saved,
      { id: Date.now(), name: saveName.trim(), filters: currentFilters },
    ];
    writeSaved(storageKey, newSaved);
    setSaved(newSaved);
    setSaveName("");
    onSaveComplete?.();
  };

  const handleDelete = (id) => {
    const next = saved.filter((s) => s.id !== id);
    writeSaved(storageKey, next);
    setSaved(next);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={ref}
      className="absolute right-0 top-[calc(100%+6px)] w-72 z-30
                 bg-card border border-border rounded-xl shadow-glass overflow-hidden"
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.15 }}
    >
      {saveMode && (
        <div className="px-3 py-3 border-b border-border bg-gold/[0.03]">
          <p className="text-[9px] font-bold tracking-[0.15em] text-gold uppercase mb-2">
            Save Current Filter
          </p>
          <div className="flex gap-2">
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. My weekly review"
              className="text-xs"
            />
            <button
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="w-9 h-9 rounded-xl bg-gold text-base flex items-center justify-center flex-shrink-0
                         disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-light transition-all"
              aria-label="Save filter"
            >
              <Check size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="px-3 py-2 border-b border-border">
        <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase">
          Saved Filters
        </p>
      </div>

      <div className="max-h-64 overflow-y-auto scrollbar-none">
        {saved.length === 0 ? (
          <p className="text-[11px] text-text-subtle text-center py-6 px-3">
            No saved filters yet. Apply some filters and save them for quick
            access later.
          </p>
        ) : (
          saved.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-gold/5 transition-colors group"
            >
              <button
                onClick={() => {
                  onApply(s.filters);
                  onClose();
                }}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <Bookmark size={12} className="text-gold flex-shrink-0" />
                <span className="text-xs font-medium text-text-primary truncate">
                  {s.name}
                </span>
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0
                           text-text-subtle opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                aria-label={`Delete saved filter ${s.name}`}
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default SavedFiltersDropdown;
