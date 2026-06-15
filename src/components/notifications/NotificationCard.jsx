// src/components/notifications/NotificationCard.jsx
// Individual notification card with all actions.
// Supports: mark read, pin, delete, navigate to link.

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  FileText,
  Car,
  Users,
  Settings,
  Bell,
  Pin,
  PinOff,
  Check,
  Trash2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";

// ── Type config — icon, color, bg ─────────────────────────────────────────────
const TYPE_CONFIG = {
  test_drive: {
    icon: CalendarCheck,
    iconClass: "bg-sky-accent/12 text-sky-accent",
    dot: "bg-sky-accent",
    label: "Test Drive",
  },
  invoice: {
    icon: FileText,
    iconClass: "bg-gold/12 text-gold",
    dot: "bg-gold",
    label: "Invoice",
  },
  inventory: {
    icon: Car,
    iconClass: "bg-emerald-400/12 text-emerald-400",
    dot: "bg-emerald-400",
    label: "Inventory",
  },
  customer: {
    icon: Users,
    iconClass: "bg-violet-400/12 text-violet-400",
    dot: "bg-violet-400",
    label: "Customer",
  },
  system: {
    icon: Settings,
    iconClass: "bg-text-subtle/12 text-text-subtle",
    dot: "bg-text-subtle",
    label: "System",
  },
};

// ── Priority badge ────────────────────────────────────────────────────────────
const PRIORITY_STYLE = {
  high: "text-rose-400   bg-rose-400/8   border-rose-400/20",
  medium: "text-amber-400  bg-amber-400/8  border-amber-400/20",
  low: "text-text-subtle bg-base         border-border",
};

// ── Time formatter ────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-AE", { day: "numeric", month: "short" });
}

function NotificationCard({
  notification,
  onRead,
  onPin,
  onDelete,
  index = 0,
}) {
  const navigate = useNavigate();
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
  const Icon = cfg.icon;

  const handleClick = () => {
    if (!notification.isRead) onRead(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <motion.div
      className={clsx(
        "relative flex gap-4 p-4  rounded-2xl border transition-all group",
        notification.isPinned
          ? "bg-gold/[0.03] border-gold/20"
          : notification.isRead
            ? "bg-card border-border hover:border-border/80"
            : "bg-card border-border hover:border-gold/20",
        !notification.isRead && "border-l-2 border-l-gold/60",
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      layout
    >
      {/* ── Unread dot ── */}
      {!notification.isRead && (
        <span
          className={clsx(
            "absolute top-4 right-4 w-2 h-2 rounded-full flex-shrink-0",
            cfg.dot,
          )}
        />
      )}

      {/* ── Icon ── */}
      <div
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
          cfg.iconClass,
        )}
      >
        <Icon size={18} />
      </div>

      {/* ── Body ── */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={clsx(
                "text-xs font-bold leading-tight",
                notification.isRead ? "text-text-muted" : "text-text-primary",
              )}
            >
              {notification.title}
            </p>

            {/* Priority badge — only for high/medium */}
            {notification.priority !== "low" && (
              <span
                className={clsx(
                  "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5",
                  "rounded-full border flex-shrink-0 capitalize",
                  PRIORITY_STYLE[notification.priority],
                )}
              >
                {notification.priority}
              </span>
            )}

            {/* Pin indicator */}
            {notification.isPinned && (
              <span
                className="text-[8px] font-bold text-gold uppercase tracking-widest
                               px-1.5 py-0.5 rounded-full border border-gold/25 bg-gold/8
                               flex-shrink-0 flex items-center gap-0.5"
              >
                <Pin size={8} /> Pinned
              </span>
            )}
          </div>

          {/* Time */}
          <span className="text-[10px] text-text-subtle flex-shrink-0 mt-3">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        {/* Type chip */}
        <p
          className={clsx(
            "text-[9px] font-bold uppercase tracking-widest mb-1.5",
            "opacity-60",
            cfg.iconClass.split(" ")[1],
          )}
        >
          {cfg.label}
        </p>

        {/* Message */}
        <p
          className={clsx(
            "text-[11px] leading-relaxed mb-3",
            notification.isRead ? "text-text-subtle" : "text-text-muted",
          )}
        >
          {notification.message}
        </p>

        {/* Footer: link + actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Navigate link */}
          {notification.link && (
            <button
              onClick={handleClick}
              className={clsx(
                "flex items-center gap-1 text-[11px] font-semibold transition-colors",
                "hover:gap-2",
                notification.isRead
                  ? "text-text-subtle hover:text-text-muted"
                  : "text-gold hover:text-gold-light",
              )}
            >
              {notification.linkLabel || "View"}
              <ArrowRight size={11} />
            </button>
          )}

          {!notification.link && <div />}

          {/* Action buttons */}
          <div
            className="flex items-center gap-1
                          opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {/* Mark as read */}
            {!notification.isRead && (
              <button
                onClick={() => onRead(notification.id)}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                           text-text-subtle hover:text-emerald-400 hover:border-emerald-400/40
                           hover:bg-emerald-400/8 transition-all"
                title="Mark as read"
                aria-label="Mark as read"
              >
                <Check size={12} />
              </button>
            )}

            {/* Pin / Unpin */}
            <button
              onClick={() => onPin(notification.id)}
              className={clsx(
                "w-7 h-7 rounded-lg border flex items-center justify-center transition-all",
                notification.isPinned
                  ? "border-gold/40 text-gold bg-gold/8"
                  : "border-border text-text-subtle hover:text-gold hover:border-gold/40 hover:bg-gold/8",
              )}
              title={notification.isPinned ? "Unpin" : "Pin"}
              aria-label={
                notification.isPinned
                  ? "Unpin notification"
                  : "Pin notification"
              }
            >
              {notification.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(notification.id)}
              className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                         text-text-subtle hover:text-rose-400 hover:border-rose-400/40
                         hover:bg-rose-400/8 transition-all"
              title="Delete notification"
              aria-label="Delete notification"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default NotificationCard;
