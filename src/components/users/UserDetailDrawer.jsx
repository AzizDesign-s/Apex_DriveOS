// src/components/users/UserDetailDrawer.jsx
// Same chrome pattern as CustomerDetailDrawer.jsx

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Crown,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Shield,
} from "lucide-react";
import { Button } from "../ui";
import { AVATAR_PALETTE, PERMISSION_MODULES } from "../../data/mockData";
import clsx from "clsx";

function Avatar({ name, avatar, index, size = "lg" }) {
  const { bg, text } = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const dim = size === "lg" ? "w-14 h-14 text-base" : "w-9 h-9 text-xs";
  if (avatar) {
    return (
      <div className={clsx("rounded-2xl overflow-hidden flex-shrink-0", dim)}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className={clsx(
        "rounded-2xl flex items-center justify-center font-bold flex-shrink-0",
        dim,
      )}
      style={{ background: bg, color: text }}
    >
      {initials}
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="bg-base border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={10} className="text-text-subtle" />}
        <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase">
          {label}
        </p>
      </div>
      <p className="text-xs font-semibold text-text-primary">{value || "—"}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-3 pb-2 border-b border-border mt-5 first:mt-0">
      {children}
    </p>
  );
}

function KpiPill({ label, value, color = "text-text-primary" }) {
  return (
    <div className="bg-base border border-border rounded-xl p-3 text-center">
      <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase mb-1.5">
        {label}
      </p>
      <p className={clsx("text-base font-extrabold", color)}>{value}</p>
    </div>
  );
}

const STATUS_STYLE = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  invited: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  suspended: "text-amber-400   bg-amber-400/10   border-amber-400/20",
  inactive: "text-text-subtle bg-text-subtle/10 border-border",
};

function UserDetailDrawer({
  user,
  isOpen,
  index = 0,
  onClose,
  onEdit,
  onDelete,
  roles = [],
}) {
  if (!user) return null;

  const role = roles.find((r) => r.id === Number(user.roleId));
  const grantedModules = PERMISSION_MODULES.filter(
    (m) => !m.disabled && role?.permissions?.[m.id]?.view,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 lg:w-[400px] w-11/12 z-40 bg-card border-l border-border flex flex-col shadow-glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="flex items-start gap-4 px-2 py-4 border-b border-border flex-shrink-0">
              <Avatar
                name={user.fullName}
                avatar={user.avatar}
                index={index}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-text-primary truncate">
                    {user.fullName}
                  </h3>
                  {role?.name === "Admin" && (
                    <Crown size={14} className="text-gold flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-text-subtle">
                    {user.employeeId}
                  </span>
                  <span className="text-text-subtle/40">·</span>
                  <span
                    className={clsx(
                      "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ",
                      STATUS_STYLE[user.status],
                    )}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                           text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all"
                aria-label="Close drawer"
              >
                <X size={13} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-none">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <KpiPill label="Department" value={user.department || "—"} />
                <KpiPill
                  label="Last Login"
                  value={
                    user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString("en-AE", {
                          day: "numeric",
                          month: "short",
                        })
                      : "Never"
                  }
                  color={user.lastLogin ? "text-gold" : "text-text-subtle"}
                />
              </div>

              <SectionTitle>Contact Information</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <DetailRow label="Email" value={user.email} icon={Mail} />
                <DetailRow label="Phone" value={user.phone} icon={Phone} />
                <DetailRow
                  label="Joined"
                  value={
                    user.joinDate
                      ? new Date(user.joinDate).toLocaleDateString("en-AE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"
                  }
                  icon={Calendar}
                />
                <DetailRow
                  label="Department"
                  value={user.department}
                  icon={Briefcase}
                />
              </div>

              <SectionTitle>Role & Permissions</SectionTitle>
              <div className="bg-base border border-border rounded-xl p-4 mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-gold" />
                  <p className="text-sm font-bold text-text-primary">
                    {role?.name || "Unassigned"}
                  </p>
                </div>
                {role?.description && (
                  <p className="text-[11px] text-text-subtle leading-relaxed mb-3">
                    {role.description}
                  </p>
                )}
                <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase mb-2">
                  Can view
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {grantedModules.length > 0 ? (
                    grantedModules.map((m) => (
                      <span
                        key={m.id}
                        className="text-[10px] font-medium text-text-muted bg-card border border-border px-2 py-1 rounded-lg"
                      >
                        {m.label}
                      </span>
                    ))
                  ) : (
                    <p className="text-[10px] text-text-subtle">
                      No module access granted
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-border flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={onClose} fullWidth>
                <X size={13} /> Close
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="!border-gold/30 !text-gold hover:!bg-gold/5"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
              >
                <Edit size={13} /> Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => onDelete(user)}
              >
                <Trash2 size={13} /> Delete
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default UserDetailDrawer;
