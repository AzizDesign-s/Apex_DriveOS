// src/components/activity/ActivityCard.jsx
// Timeline card for a single activity log entry.
// Visual language: left border accent by module color,
// action badge, actor name, timestamp — all in one compact card.

import { motion } from "framer-motion";
import {
  Car,
  Users,
  CalendarCheck,
  FileText,
  UserCircle,
  Settings,
  Globe,
  Cpu,
  PlusCircle,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  GitBranch,
  LogIn,
} from "lucide-react";
import clsx from "clsx";

// ── Module config ─────────────────────────────────────────────────────────────
const MODULE_CONFIG = {
  inventory: { icon: Car, color: "#D4AF37", label: "Inventory" },
  customers: { icon: UserCircle, color: "#38BDF8", label: "Customers" },
  test_drives: { icon: CalendarCheck, color: "#10B981", label: "Test Drives" },
  invoices: { icon: FileText, color: "#A78BFA", label: "Invoices" },
  users: { icon: Users, color: "#FB7185", label: "Users" },
  leads: { icon: Globe, color: "#FBBF24", label: "Leads" },
  service: { icon: Settings, color: "#34D399", label: "Service" },
  system: { icon: Cpu, color: "#94A3B8", label: "System" },
};

// ── Action config ─────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  created: {
    icon: PlusCircle,
    label: "Created",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  updated: {
    icon: Pencil,
    label: "Updated",
    color: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  },
  deleted: {
    icon: Trash2,
    label: "Deleted",
    color: "text-rose-400    bg-rose-400/10    border-rose-400/20",
  },
  status_changed: {
    icon: RefreshCw,
    label: "Status Changed",
    color: "text-amber-400   bg-amber-400/10   border-amber-400/20",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-rose-400    bg-rose-400/10    border-rose-400/20",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "text-rose-400    bg-rose-400/10    border-rose-400/20",
  },
  converted: {
    icon: GitBranch,
    label: "Converted",
    color: "text-gold        bg-gold/10        border-gold/20",
  },
  assigned: {
    icon: UserCircle,
    label: "Assigned",
    color: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  },
  logged_in: {
    icon: LogIn,
    label: "Logged In",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  logged_out: {
    icon: LogIn,
    label: "Logged Out",
    color: "text-text-subtle bg-border/30      border-border",
  },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ActivityCard({ log, index = 0 }) {
  const module = MODULE_CONFIG[log.module] || MODULE_CONFIG.system;
  const action = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
  const ModIcon = module.icon;
  const ActIcon = action.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ delay: index * 0.025, duration: 0.2 }}
      className="relative flex gap-4 bg-card border border-border rounded-xl
                 p-4 hover:border-border/80 hover:bg-card/80 transition-all group"
      style={{ borderLeft: `2px solid ${module.color}33` }}
    >
      {/* Module icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center
                   flex-shrink-0 mt-0.5"
        style={{ background: `${module.color}15` }}
      >
        <ModIcon size={16} style={{ color: module.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: module label + action badge + time */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className="text-[9px] font-bold tracking-[0.15em] uppercase"
            style={{ color: module.color }}
          >
            {module.label}
          </span>

          <span
            className={clsx(
              "flex items-center gap-1 text-[9px] font-bold uppercase",
              "tracking-wide px-1.5 py-0.5 rounded-full border",
              action.color,
            )}
          >
            <ActIcon size={9} />
            {action.label}
          </span>

          <span className="text-[10px] text-text-subtle ml-auto flex-shrink-0">
            {timeAgo(log.createdAt)}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-text-muted leading-relaxed">
          {log.description}
        </p>

        {/* Bottom row: entity label + actor */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-semibold text-text-primary truncate">
            {log.entityLabel}
          </span>
          <span className="text-text-subtle/40 text-[10px]">·</span>
          <span className="text-[10px] text-text-subtle flex-shrink-0">
            by {log.actor}
          </span>
          <span className="text-text-subtle/40 text-[10px]">·</span>
          <span className="text-[10px] text-text-subtle flex-shrink-0">
            {new Date(log.createdAt).toLocaleTimeString("en-AE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ActivityCard;
