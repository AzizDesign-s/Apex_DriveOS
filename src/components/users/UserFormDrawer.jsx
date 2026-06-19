// src/components/users/UserFormDrawer.jsx
// Phase-1-style: roles and managers passed as props (read from localStorage
// by the parent page), not pulled from a Zustand store.

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Camera, UserPlus } from "lucide-react";
import { Input, Select, Button } from "../ui";
import { DEPARTMENTS, USER_STATUSES } from "../../data/mockData";
import apexToast from "../../utils/toast";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  avatar: null,
  roleId: "",
  department: "",
  status: "invited",
  joinDate: new Date().toISOString().split("T")[0],
  reportsTo: "",
};

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

function UserFormDrawer({
  isOpen,
  onClose,
  onSave,
  editUser = null,
  roles = [],
  allUsers = [],
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        setForm({ ...EMPTY, ...editUser, roleId: String(editUser.roleId) });
        setAvatarPreview(editUser.avatar || null);
      } else {
        setForm(EMPTY);
        setAvatarPreview(null);
      }
      setErrors({});
    }
  }, [isOpen, editUser]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      set("avatar", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.roleId) e.roleId = "Select a role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      return;
    }
    onSave({
      ...form,
      id: editUser?.id,
      roleId: Number(form.roleId),
      reportsTo: form.reportsTo ? Number(form.reportsTo) : null,
    });
  };

  const roleOptions = roles.map((r) => ({
    value: String(r.id),
    label: r.name,
  }));
  const managerOptions = [
    { value: "", label: "None" },
    ...allUsers
      .filter((u) => u.id !== editUser?.id)
      .map((u) => ({ value: String(u.id), label: u.fullName })),
  ];

  const initials = form.fullName
    ? form.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

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
                       bg-card border-l border-border shadow-glass flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-text-primary">
                    {editUser ? "Edit User" : "Add New User"}
                  </h2>
                  <p className="text-[10px] text-text-subtle mt-0.5">
                    {editUser
                      ? editUser.employeeId
                      : "Invite a team member to APEX GT"}
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
              <div className="flex items-center gap-5 mb-6">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg,#B8931F,#D4AF37,#E8C84A)",
                      color: "#0B0F14",
                    }}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-card border border-border
                               flex items-center justify-center text-text-muted hover:text-gold hover:border-gold/40 transition-all"
                    aria-label="Upload photo"
                  >
                    <Camera size={12} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-text-subtle">
                    JPG or PNG · Max 5MB
                  </p>
                  {!editUser && (
                    <p className="text-[10px] text-text-subtle mt-1">
                      Employee ID assigned automatically on save
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <Field label="Full Name" required error={errors.fullName}>
                  <Input
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="e.g. Ahmed Al-Sayed"
                  />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="name@apexgt.ae"
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+971 50 000 0000"
                  />
                </Field>
                <Field label="Join Date">
                  <Input
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => set("joinDate", e.target.value)}
                  />
                </Field>
              </div>

              <p className="text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-3 mt-2">
                Role & Access
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <Field label="Role" required error={errors.roleId}>
                  <Select
                    value={form.roleId}
                    onChange={(e) => set("roleId", e.target.value)}
                    options={roleOptions}
                    placeholder="Select role"
                  />
                </Field>
                <Field label="Department">
                  <Select
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    options={DEPARTMENTS}
                    placeholder="Select department"
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                    options={USER_STATUSES.map((s) => ({
                      value: s,
                      label: s.charAt(0).toUpperCase() + s.slice(1),
                    }))}
                  />
                </Field>
                <Field label="Reports To">
                  <Select
                    value={form.reportsTo || ""}
                    onChange={(e) => set("reportsTo", e.target.value)}
                    options={managerOptions}
                  />
                </Field>
              </div>
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
                {editUser ? "Save Changes" : "Add User"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default UserFormDrawer;
