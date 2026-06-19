// src/components/roles/PermissionMatrix.jsx

import { motion } from "framer-motion";
import { Check, Eye, Plus, Edit2, Trash } from "lucide-react";
import { PERMISSION_MODULES } from "../../data/mockData"; // ← Phase-1 path: mockData, not store
import clsx from "clsx";

const PERM_TYPES = [
  { id: "view", label: "View", icon: Eye },
  { id: "create", label: "Create", icon: Plus },
  { id: "edit", label: "Edit", icon: Edit2 },
  { id: "delete", label: "Delete", icon: Trash },
];

function Cell({ checked, disabled, onChange, label }) {
  if (disabled) {
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 rounded border border-border/40" />
      </div>
    );
  }
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
        checked
          ? "bg-gold/15 border-gold/50 text-gold"
          : "bg-base border-border text-transparent hover:border-gold/30",
      )}
      aria-label={label}
      aria-checked={checked}
      role="checkbox"
    >
      <Check size={13} className={checked ? "opacity-100" : "opacity-0"} />
    </button>
  );
}

function PermissionMatrix({ permissions, onChange, onColumnToggle }) {
  return (
    <div className="bg-base border border-border rounded-2xl overflow-hidden">
      <div
        className="grid items-center px-4 py-3 border-b border-border bg-card/40"
        style={{ gridTemplateColumns: "1fr repeat(4, 56px)" }}
      >
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
          Module
        </p>
        {PERM_TYPES.map((pt) => (
          <button
            key={pt.id}
            onClick={() => onColumnToggle(pt.id, true)}
            className="flex flex-col items-center gap-1 group"
            title={`Grant ${pt.label} on all modules`}
          >
            <pt.icon
              size={12}
              className="text-text-subtle group-hover:text-gold transition-colors"
            />
            <span
              className="text-[8px] font-bold tracking-wider text-text-subtle uppercase
                             group-hover:text-gold transition-colors"
            >
              {pt.label}
            </span>
          </button>
        ))}
      </div>

      <div className="divide-y divide-border/60">
        {PERMISSION_MODULES.map((mod, i) => {
          const perm = permissions[mod.id] || {};
          return (
            <motion.div
              key={mod.id}
              className={clsx(
                "grid items-center px-4 py-3",
                mod.disabled && "opacity-40",
              )}
              style={{ gridTemplateColumns: "1fr repeat(4, 56px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: mod.disabled ? 0.4 : 1 }}
              transition={{ delay: i * 0.02 }}
            >
              <div>
                <p className="text-xs font-semibold text-text-primary">
                  {mod.label}
                </p>
                {mod.disabled && (
                  <p className="text-[9px] text-text-subtle mt-0.5">
                    Coming in future sprint
                  </p>
                )}
                {mod.viewOnly && !mod.disabled && (
                  <p className="text-[9px] text-text-subtle mt-0.5">
                    View-only module
                  </p>
                )}
              </div>

              {PERM_TYPES.map((pt) => {
                const isApplicable =
                  !mod.disabled && (!mod.viewOnly || pt.id === "view");
                return (
                  <div key={pt.id} className="flex justify-center">
                    <Cell
                      checked={!!perm[pt.id]}
                      disabled={!isApplicable}
                      onChange={(val) => onChange(mod.id, pt.id, val)}
                      label={`${pt.label} ${mod.label}`}
                    />
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PermissionMatrix;
