// src/components/users/UserFilterDrawer.jsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, RotateCcw } from "lucide-react";
import { Button, Select } from "../ui";
import { DEPARTMENTS, USER_STATUSES } from "../../data/mockData";

function UserFilterDrawer({
  isOpen,
  onClose,
  onApply,
  activeCount = 0,
  roles = [],
}) {
  const [status, setStatus] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStatus([]);
      setRoleId("");
      setDepartment("");
    }
  }, [isOpen]);

  const toggleStatus = (s) => {
    setStatus((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-40
                       bg-card border-l border-border shadow-glass flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gold" />
                <h2 className="text-sm font-extrabold text-text-primary">
                  Filter Users
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
                                                     text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-5">
              <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-2">
                Status
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {USER_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold capitalize transition-all ${
                      status.includes(s)
                        ? "border-gold/50 text-gold bg-gold/8"
                        : "border-border text-text-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-2">
                Role
              </p>
              <Select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                options={roles.map((r) => ({
                  value: String(r.id),
                  label: r.name,
                }))}
                placeholder="All roles"
              />

              <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-2 mt-5">
                Department
              </p>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={DEPARTMENTS}
                placeholder="All departments"
              />
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-border">
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={() => {
                  setStatus([]);
                  setRoleId("");
                  setDepartment("");
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => onApply({ status, roleId, department })}
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default UserFilterDrawer;
