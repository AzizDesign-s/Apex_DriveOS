// src/components/settings/ProfileSettings.jsx

import { useState, useRef } from "react";
import { Camera, Check, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { Input, Button } from "../ui";
import useAppStore from "../../store/useAppStore";
import apexToast from "../../utils/toast";

function SectionCard({ title, desc, children }) {
  return (
    <div className="bg-base border border-border rounded-2xl p-5 mb-4">
      <div className="mb-4 pb-3 border-b border-border">
        <p className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase">
          {title}
        </p>
        {desc && <p className="text-[10px] text-text-subtle mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProfileSettings() {
  const { user, setUser } = useAppStore();

  const [form, setForm] = useState({
    name: user?.name || "Admin User",
    email: user?.email || "admin@apexgt.ae",
    role: user?.role || "Super Admin",
    phone: user?.phone || "+971 50 000 0000",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPwd: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    newPwd: false,
    confirm: false,
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const fileRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setPwd = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));
  const toggleShow = (k) => setShowPwd((p) => ({ ...p, [k]: !p[k] }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
      // BUG-3 FIX: update Zustand store immediately on photo select
      // so Navbar and Sidebar update instantly — no need to wait for Save
      setUser({ avatar: dataUrl });
    };
    // BUG-3 FIX: use FileReader to get a stable data URL (not object URL)
    // Object URLs expire when the component unmounts — data URLs persist in Zustand
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    // BUG-3 FIX: save full profile including avatar to Zustand store
    setUser({
      name: form.name,
      email: form.email,
      role: form.role,
      phone: form.phone,
      avatar: avatarPreview,
    });
    apexToast.success("Profile Updated", "Your profile has been saved.");
  };

  const handleChangePassword = () => {
    if (!passwords.current) {
      apexToast.error("Error", "Please enter your current password.");
      return;
    }
    if (passwords.newPwd.length < 8) {
      apexToast.error("Error", "New password must be at least 8 characters.");
      return;
    }
    if (passwords.newPwd !== passwords.confirm) {
      apexToast.error("Error", "New passwords do not match.");
      return;
    }
    setPasswords({ current: "", newPwd: "", confirm: "" });
    apexToast.success("Password Changed", "Your password has been updated.");
  };

  const initials = form.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* Avatar */}
      <SectionCard
        title="Profile Photo"
        desc="Upload a photo to personalise your account"
      >
        <div className="flex items-center gap-5 flex-wrap">
          {/* Avatar circle */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center
                         text-xl font-black overflow-hidden"
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
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-card border border-border
                         flex items-center justify-center text-text-muted
                         hover:text-gold hover:border-gold/40 transition-all"
              aria-label="Upload photo"
            >
              <Camera size={13} />
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
            <p className="text-sm font-extrabold text-text-primary">
              {form.name}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{form.role}</p>
            <p className="text-[10px] text-text-subtle mt-2">
              JPG or PNG · Max 5MB
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Personal info */}
      <SectionCard
        title="Personal Information"
        desc="Update your name, email and contact number"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Full Name">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="your@email.com"
            />
          </Field>
          <Field label="Phone Number">
            <Input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+971 50 000 0000"
            />
          </Field>
          <Field label="Role">
            <div className="input-luxury py-2.5 text-xs text-text-subtle cursor-not-allowed">
              {form.role}
            </div>
          </Field>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={Check}
          onClick={handleSaveProfile}
        >
          Save Profile
        </Button>
      </SectionCard>

      {/* Change password */}
      <SectionCard
        title="Change Password"
        desc="Use a strong password with letters, numbers and symbols"
      >
        <div className="grid grid-cols-1 gap-4 mb-4 sm:max-w-sm">
          {[
            { key: "current", label: "Current Password" },
            { key: "newPwd", label: "New Password" },
            { key: "confirm", label: "Confirm New Password" },
          ].map(({ key, label }) => (
            <Field key={key} label={label}>
              <div className="relative">
                <input
                  type={showPwd[key] ? "text" : "password"}
                  className="input-luxury w-full text-xs py-2.5 pr-10"
                  placeholder="••••••••"
                  value={passwords[key]}
                  onChange={(e) => setPwd(key, e.target.value)}
                />
                <button
                  onClick={() => toggleShow(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-text-subtle hover:text-text-muted transition-colors"
                  aria-label={showPwd[key] ? "Hide password" : "Show password"}
                >
                  {showPwd[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={Lock}
          onClick={handleChangePassword}
        >
          Update Password
        </Button>
      </SectionCard>
    </motion.div>
  );
}

export default ProfileSettings;
