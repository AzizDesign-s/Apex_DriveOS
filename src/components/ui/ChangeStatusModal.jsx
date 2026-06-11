// src/components/ui/ChangeStatusModal.jsx

import { useState, useEffect } from "react";
import { Check, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

// ─── WHY rewritten from Modal base ────────────────────────────────────────────
// The shared Modal component shares z-index space with DeleteConfirm.
// When both are mounted (even if one is closed), React renders both in the DOM.
// The DeleteConfirm was appearing on top because it was mounted after.
// This standalone implementation has its own isolated z-index layer (z-[55])
// sitting between DeleteConfirm (z-50) and the form page (z-[70]).
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS_DEFAULT = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "maintenance", label: "Maintenance" },
];

// Color dot per status
const STATUS_DOT = {
  available: "bg-emerald-400",
  reserved: "bg-sky-accent",
  sold: "bg-gold",
  maintenance: "bg-rose-400",
};

function ChangeStatusModal({
  isOpen,
  onClose,
  onConfirm,
  count = 1,
  statusOptions = STATUS_OPTIONS_DEFAULT,
}) {
  const [selected, setSelected] = useState("");

  // Reset selection every time modal opens
  useEffect(() => {
    if (isOpen) setSelected("");
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected); // pass new status up to parent
    onClose(); // close after confirming
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — z-[54] so it sits above table but below form page */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[54]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal — top center, z-[55] */}
          <div
            className="fixed inset-0 z-[55] flex items-start justify-center pt-16 px-4"
            onClick={onClose}
          >
            <motion.div
              className="w-full max-w-sm bg-card border border-border rounded-2xl
                         shadow-glass overflow-hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg bg-sky-accent/10 border border-sky-accent/20
                                  flex items-center justify-center"
                  >
                    <Tag size={15} className="text-sky-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-text-primary">
                      Change Status
                    </h3>
                    <p className="text-[10px] text-text-subtle mt-0.5">
                      Update {count} selected car{count > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                             text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all"
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <p
                  className="text-[9px] font-bold tracking-[0.2em] text-text-subtle
                               uppercase mb-3"
                >
                  Select New Status
                </p>

                {/* Status option cards — better than a dropdown for this */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelected(opt.value)}
                      className={`
                        flex items-center gap-2.5 px-3 py-2.5 rounded-xl border
                        text-xs font-semibold transition-all text-left
                        ${
                          selected === opt.value
                            ? "border-gold/50 bg-gold/8 text-text-primary"
                            : "border-border text-text-muted hover:border-gold/25 hover:bg-gold/[0.03]"
                        }
                      `}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0
                                        ${STATUS_DOT[opt.value] || "bg-text-subtle"}`}
                      />
                      {opt.label}
                      {selected === opt.value && (
                        <Check
                          size={11}
                          className="ml-auto text-gold flex-shrink-0"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={onClose} fullWidth>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={Check}
                    onClick={handleConfirm}
                    disabled={!selected}
                    fullWidth
                  >
                    Apply Status
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ChangeStatusModal;
