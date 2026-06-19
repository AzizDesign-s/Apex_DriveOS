// src/components/roles/RoleCard.jsx
// Grid card showing one role — name, description, user count, permission summary, actions

import { motion } from "framer-motion";
import {
  Shield,
  Crown,
  DollarSign,
  Package,
  Users as UsersIcon,
  Edit,
  Copy,
  Trash2,
  Lock,
} from "lucide-react";
import clsx from "clsx";

const ROLE_ICONS = {
  Admin: Crown,
  "Sales Executive": UsersIcon,
  "Finance Team": DollarSign,
  "Inventory Manager": Package,
};

const ROLE_COLORS = {
  Admin: { bg: "bg-gold/10", text: "text-gold" },
  "Sales Executive": { bg: "bg-sky-accent/10", text: "text-sky-accent" },
  "Finance Team": { bg: "bg-emerald-400/10", text: "text-emerald-400" },
  "Inventory Manager": { bg: "bg-violet-400/10", text: "text-violet-400" },
};

function RoleCard({
  role,
  userCount = 0,
  summary,
  onEdit,
  onDuplicate,
  onDelete,
  index = 0,
}) {
  const Icon = ROLE_ICONS[role.name] || Shield;
  const colors = ROLE_COLORS[role.name] || {
    bg: "bg-text-subtle/10",
    text: "text-text-subtle",
  };
  const pct =
    summary.total > 0 ? Math.round((summary.granted / summary.total) * 100) : 0;

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4
                 hover:border-gold/20 transition-all"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              colors.bg,
              colors.text,
            )}
          >
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-extrabold text-text-primary">
                {role.name}
              </p>
              {role.isSystemRole && (
                <span title="System role — cannot be deleted">
                  <Lock size={11} className="text-text-subtle" />
                </span>
              )}
            </div>
            <p className="text-[10px] text-text-subtle mt-0.5">
              {userCount} user{userCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2 min-h-[28px]">
        {role.description || "No description provided."}
      </p>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase">
            Permissions Granted
          </p>
          <p className="text-[10px] font-bold text-text-primary">
            {summary.granted}/{summary.total}
          </p>
        </div>
        <div className="h-1.5 bg-base rounded-full overflow-hidden">
          <motion.div
            className={clsx(
              "h-full rounded-full",
              colors.bg.replace("/10", ""),
            )}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-border/60">
        <button
          onClick={() => onEdit(role)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                     border border-border text-[11px] font-semibold text-text-muted
                     hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all"
        >
          <Edit size={12} /> Edit
        </button>
        <button
          onClick={() => onDuplicate(role)}
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center
                     text-text-subtle hover:text-sky-accent hover:border-sky-accent/40
                     hover:bg-sky-accent/8 transition-all flex-shrink-0"
          title="Duplicate role"
          aria-label={`Duplicate ${role.name}`}
        >
          <Copy size={13} />
        </button>
        <button
          onClick={() => onDelete(role)}
          disabled={role.isSystemRole}
          className={clsx(
            "w-9 h-9 rounded-xl border flex items-center justify-center transition-all flex-shrink-0",
            role.isSystemRole
              ? "border-border text-text-subtle/30 cursor-not-allowed"
              : "border-border text-text-subtle hover:text-rose-400 hover:border-rose-400/40 hover:bg-rose-400/8",
          )}
          title={
            role.isSystemRole ? "System roles cannot be deleted" : "Delete role"
          }
          aria-label={`Delete ${role.name}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

export default RoleCard;
