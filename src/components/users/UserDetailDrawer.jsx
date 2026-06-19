// src/components/users/UserDetailDrawer.jsx

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  Briefcase,
} from "lucide-react";
import { PERMISSION_MODULES } from "../../data/mockData";
import clsx from "clsx";

const STATUS_STYLE = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  invited: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  suspended: "text-amber-400   bg-amber-400/10   border-amber-400/20",
  inactive: "text-text-subtle bg-text-subtle/10 border-border",
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-base flex items-center justify-center flex-shrink-0 text-text-subtle">
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase">
          {label}
        </p>
        <p className="text-xs text-text-primary font-medium truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function UserDetailDrawer({
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  roles = [],
}) {
  if (!user) return null;

  const role = roles.find((r) => r.id === Number(user.roleId));
  const initials = user.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const grantedModules = PERMISSION_MODULES.filter(
    (m) => !m.disabled && role?.permissions?.[m.id]?.view,
  );

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
            className="fixed top-0 right-0 bottom-0 w-full max-w-md z-50
                       bg-card border-l border-border shadow-glass flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <p className="text-[9px] font-bold tracking-[0.25em] text-text-subtle uppercase">
                User Profile
              </p>
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
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-xl font-black overflow-hidden mb-3"
                  style={{
                    background:
                      "linear-gradient(135deg,#B8931F,#D4AF37,#E8C84A)",
                    color: "#0B0F14",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-extrabold text-text-primary">
                    {user.fullName}
                  </p>
                  {role?.name === "Admin" && (
                    <Crown size={14} className="text-gold" />
                  )}
                </div>
                <p className="text-xs text-text-subtle mt-0.5">
                  {user.employeeId}
                </p>
                <span
                  className={clsx(
                    "mt-2 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ",
                    STATUS_STYLE[user.status],
                  )}
                >
                  {user.status}
                </span>
              </div>

              <p className="text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-1">
                Contact
              </p>
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Phone} label="Phone" value={user.phone} />

              <p className="text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-1 mt-5">
                Employment
              </p>
              <InfoRow
                icon={Briefcase}
                label="Department"
                value={user.department}
              />
              <InfoRow
                icon={Calendar}
                label="Joined"
                value={
                  user.joinDate
                    ? new Date(user.joinDate).toLocaleDateString("en-AE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : null
                }
              />
              <InfoRow
                icon={Calendar}
                label="Last Login"
                value={
                  user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString("en-AE", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never logged in"
                }
              />

              <p className="text-[9px] font-bold tracking-[0.2em] text-gold uppercase mb-2 mt-5">
                Role & Permissions
              </p>
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
                        className="text-[10px] font-medium text-text-muted bg-card
                                                 border border-border px-2 py-1 rounded-lg"
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

            <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button
                onClick={() => onEdit(user)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           border border-gold/30 text-gold text-xs font-semibold
                           hover:bg-gold/5 transition-all"
              >
                <Edit size={13} /> Edit User
              </button>
              <button
                onClick={() => onDelete(user)}
                className="w-11 h-11 rounded-xl border border-border flex items-center justify-center
                           text-text-subtle hover:text-rose-400 hover:border-rose-400/40 hover:bg-rose-400/8 transition-all"
                title="Delete user"
                aria-label={`Delete ${user.fullName}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default UserDetailDrawer;
