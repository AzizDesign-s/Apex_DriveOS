// src/components/testdrives/TestDriveFilterDrawer.jsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { Button, Select } from "../ui";
import { SALES_EXECUTIVES } from "../../data/mockData";

const STATUS_OPTS = [
  "pending",
  "approved",
  "rejected",
  "completed",
  "cancelled",
];

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border
                  transition-all cursor-pointer capitalize ${
                    active
                      ? "border-gold/50 text-gold bg-gold/8"
                      : "border-border text-text-subtle hover:border-gold/30 hover:text-text-muted"
                  }`}
    >
      {label}
    </button>
  );
}

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

function TestDriveFilterDrawer({ isOpen, onClose, onApply, activeCount = 0 }) {
  const [status, setStatus] = useState([]);
  const [exec, setExec] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const localCount = status.length + (exec ? 1 : 0) + (from || to ? 1 : 0);

  const handleClear = () => {
    setStatus([]);
    setExec("");
    setFrom("");
    setTo("");
  };

  const handleApply = () => {
    onApply({ status, exec, from, to });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 sm:w-[400px] w-11/12 z-40
                       bg-card border-l border-border flex flex-col shadow-glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div
              className="flex items-center justify-between px-5 py-4
                            border-b border-border flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-gold" />
                <h3 className="text-sm font-extrabold text-text-primary">
                  Filter Bookings
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
              >
                <X size={13} />
              </button>
            </div>

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

              <FilterSection title="Sales Executive">
                <Select
                  value={exec}
                  onChange={(e) => setExec(e.target.value)}
                  options={SALES_EXECUTIVES}
                  placeholder="All Executives"
                />
              </FilterSection>

              <FilterSection title="Date Range">
                <div className="flex flex-col gap-2">
                  <input
                    type="date"
                    className="input-luxury text-xs py-2 "
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="From"
                  />
                  <input
                    type="date"
                    className="input-luxury text-xs py-2"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="To"
                  />
                </div>
              </FilterSection>
            </div>

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

export default TestDriveFilterDrawer;
