// src/components/users/UserFormPage.jsx
// Same architecture as CustomerFormPage.jsx — full-screen tabbed form
// 3 tabs: Identity → Role & Access → Security (Bug 4: password fields)

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, User, Shield, Lock, Camera } from "lucide-react";
import { Button, Input, Select } from "../ui";
import {
  DEPARTMENTS,
  USER_STATUSES,
  generateEmployeeId,
} from "../../data/mockData";
import apexToast from "../../utils/toast";
import clsx from "clsx";

const TABS = [
  { label: "Identity", icon: User },
  { label: "Role & Access", icon: Shield },
  { label: "Security", icon: Lock },
];

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
  password: "",
  confirmPassword: "",
};

function Field({ label, required, error, children, span = "" }) {
  return (
    <div className={clsx("flex flex-col gap-1.5", span)}>
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4">
      <p className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase mb-4 pb-2.5 border-b border-border">
        {title}
      </p>
      {children}
    </div>
  );
}

function UserFormPage({
  isOpen,
  onClose,
  onSave,
  editUser = null,
  allUsers = [],
  roles = [],
}) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        setForm({
          ...EMPTY,
          ...editUser,
          roleId: String(editUser.roleId),
          password: "",
          confirmPassword: "",
        });
        setAvatarPreview(editUser.avatar || null);
      } else {
        setForm({ ...EMPTY, employeeId: generateEmployeeId(allUsers) });
        setAvatarPreview(null);
      }
      setTab(0);
      setErrors({});
    }
  }, [isOpen, editUser, allUsers]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

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
    if (!form.roleId) e.roleId = "Required";

    // Bug 4: password required on create; optional on edit (only validated if touched)
    if (!editUser) {
      if (!form.password) e.password = "Required";
      else if (form.password.length < 8) e.password = "Minimum 8 characters";
      if (form.confirmPassword !== form.password)
        e.confirmPassword = "Passwords do not match";
    } else if (form.password || form.confirmPassword) {
      if (form.password.length < 8) e.password = "Minimum 8 characters";
      if (form.confirmPassword !== form.password)
        e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      if (errors.fullName || errors.email) setTab(0);
      else if (errors.roleId) setTab(1);
      else if (errors.password || errors.confirmPassword) setTab(2);
      return;
    }
    const { confirmPassword, ...rest } = form;
    onSave({
      ...rest,
      id: editUser?.id,
      employeeId: editUser?.employeeId || form.employeeId,
      roleId: Number(form.roleId),
      reportsTo: form.reportsTo ? Number(form.reportsTo) : null,
      lastLogin: editUser?.lastLogin || null,
      createdAt: editUser?.createdAt || new Date().toISOString().split("T")[0],
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

  const Tab0 = (
    <>
      <FormSection title="Profile Photo">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#B8931F,#D4AF37,#E8C84A)",
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
            <p className="text-[10px] text-text-subtle">JPG or PNG · Max 5MB</p>
            {!editUser && (
              <p className="text-[10px] text-text-subtle mt-1">
                Employee ID: {form.employeeId}
              </p>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact Details">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Full Name" required error={errors.fullName}>
            <Input
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Ahmed Al-Sayed"
            />
          </Field>
          <Field label="Email Address" required error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@apexdriveos.ae"
            />
          </Field>
          <Field label="Phone Number">
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+971 50 000 0000"
            />
          </Field>
          <Field label="Join Date">
            <input
              type="date"
              className="input-luxury text-xs py-2"
              value={form.joinDate}
              onChange={(e) => set("joinDate", e.target.value)}
            />
          </Field>
        </div>
      </FormSection>
    </>
  );

  const Tab1 = (
    <FormSection title="Role & Access">
      <div className="grid grid-cols-1 gap-4">
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
    </FormSection>
  );

  const Tab2 = (
    <FormSection title="Login Credentials">
      <div className="flex items-start gap-2 bg-sky-accent/[0.05] border border-sky-accent/15 rounded-xl p-3 mb-4">
        <Lock size={13} className="text-sky-accent flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-sky-accent/80 leading-relaxed">
          {editUser
            ? "Leave blank to keep the current password unchanged."
            : "This password will be used once backend authentication is connected. For now it is stored locally."}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Field
          label={editUser ? "New Password" : "Password"}
          required={!editUser}
          error={errors.password}
        >
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Field
          label="Confirm Password"
          required={!editUser}
          error={errors.confirmPassword}
        >
          <Input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            placeholder="••••••••"
          />
        </Field>
      </div>
    </FormSection>
  );

  const TAB_CONTENT = [Tab0, Tab1, Tab2];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-base flex flex-col"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex-shrink-0 bg-card border-b border-border px-3 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center
                           text-text-muted hover:text-text-primary hover:border-gold/40 transition-all"
                aria-label="Go back"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="lg:text-sm text-[12px] font-extrabold text-text-primary">
                  {editUser ? `Edit · ${editUser.fullName}` : "Add New User"}
                </h2>
                <p className="text-[10px] text-text-subtle mt-1.5">
                  Employee ID auto-generated · Required fields marked *
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Check}
                onClick={handleSave}
              >
                <span className="hidden sm:inline">
                  {editUser ? "Update User" : "Save User"}
                </span>
              </Button>
            </div>
          </div>

          <div className="flex-shrink-0 bg-card border-b border-border px-4 sticky top-[65px] z-10">
            <div className="flex gap-0">
              {TABS.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setTab(i)}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 transition-all duration-200 text-left",
                    tab === i
                      ? "border-gold text-gold"
                      : "border-transparent text-text-subtle hover:text-text-muted",
                  )}
                >
                  <span
                    className={clsx(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold",
                      tab === i
                        ? "bg-gold text-base"
                        : "bg-border text-text-subtle",
                    )}
                  >
                    {i + 1}
                  </span>
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {TAB_CONTENT[tab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-shrink-0 bg-card border-t border-border px-6 py-3 flex items-center justify-between sticky bottom-0">
            <p className="text-[10px] text-text-subtle">
              Step {tab + 1} of 3 · {TABS[tab].label}
            </p>
            <div className="flex gap-3">
              {tab > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTab(tab - 1)}
                >
                  ← Previous
                </Button>
              )}
              {tab < 2 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setTab(tab + 1)}
                >
                  Next Section →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={Check}
                  onClick={handleSave}
                >
                  Save User
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UserFormPage;
