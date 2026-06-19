// src/components/roles/RoleFormDrawer.jsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Shield } from "lucide-react";
import { Input, Button } from "../ui";
import PermissionMatrix from "./PermissionMatrix";
import { PERMISSION_MODULES, emptyPermissionSet } from "../../data/mockData"; // ← Phase-1 path
import apexToast from "../../utils/toast";

function RoleFormDrawer({ isOpen, onClose, onSave, editRole = null }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState(() => emptyPermissionSet());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editRole) {
        setName(editRole.name);
        setDescription(editRole.description || "");
        setPermissions(editRole.permissions);
      } else {
        setName("");
        setDescription("");
        setPermissions(emptyPermissionSet());
      }
      setErrors({});
    }
  }, [isOpen, editRole]);

  const handlePermChange = (moduleId, permType, value) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [permType]: value },
    }));
  };

  const handleColumnToggle = (permType, value) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      PERMISSION_MODULES.forEach((m) => {
        if (m.disabled) return;
        if (m.viewOnly && permType !== "view") return;
        updated[m.id] = { ...updated[m.id], [permType]: value };
      });
      return updated;
    });
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Role name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please enter a role name.");
      return;
    }
    onSave({
      id: editRole?.id,
      name: name.trim(),
      description: description.trim(),
      permissions,
      isSystemRole: editRole?.isSystemRole || false,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl z-50
                       bg-card border-l border-border shadow-glass
                       flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-text-primary">
                    {editRole ? "Edit Role" : "Create New Role"}
                  </h2>
                  <p className="text-[10px] text-text-subtle mt-0.5">
                    Define name and module permissions
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
                           text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-5">
              {editRole?.isSystemRole && (
                <div
                  className="flex items-start gap-2 bg-amber-400/8 border border-amber-400/15
                                rounded-xl p-3 mb-5"
                >
                  <Shield
                    size={13}
                    className="text-amber-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-amber-400/80 leading-relaxed">
                    This is a system role. You can adjust its permissions, but
                    it cannot be deleted or renamed.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
                    Role Name <span className="text-gold">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Showroom Supervisor"
                    disabled={editRole?.isSystemRole}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-400 mt-0.5">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
                    Description
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe this role's responsibilities"
                  />
                </div>
              </div>

              <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-3">
                Module Permissions
              </p>
              <PermissionMatrix
                permissions={permissions}
                onChange={handlePermChange}
                onColumnToggle={handleColumnToggle}
              />
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <Button variant="ghost" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={Check}
                onClick={handleSave}
                fullWidth
              >
                {editRole ? "Save Changes" : "Create Role"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default RoleFormDrawer;
