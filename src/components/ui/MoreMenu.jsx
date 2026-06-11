// src/components/ui/MoreMenu.jsx
// The 3-dot popup menu — Refresh, Export Excel, Export PDF etc.
// Reused in every module toolbar.

import { useState, useEffect, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

function MoreMenu({ items = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
          open
            ? "border-gold/40 text-gold bg-gold/5"
            : "border-border text-text-muted hover:border-gold/30 hover:text-gold",
        )}
        aria-label="More options"
      >
        <MoreHorizontal size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-[calc(100%+6px)] w-44 bg-card border border-border
                       rounded-xl shadow-glass z-30 overflow-hidden py-1"
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {items.map((item, i) =>
              item === "divider" ? (
                <div key={i} className="h-px bg-border mx-2 my-1" />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium",
                    "transition-colors hover:bg-gold/5",
                    item.danger
                      ? "text-rose-400 hover:text-rose-400"
                      : "text-text-muted hover:text-text-primary",
                  )}
                >
                  {item.icon && (
                    <item.icon
                      size={13}
                      className={
                        item.danger ? "text-rose-400" : "text-text-subtle"
                      }
                    />
                  )}
                  {item.label}
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MoreMenu;
