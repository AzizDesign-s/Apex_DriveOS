// src/components/notifications/NotificationFilterBar.jsx
// Horizontal filter bar — type chips + unread toggle + sort

import { motion } from "framer-motion";
import {
  CalendarCheck,
  FileText,
  Car,
  Users,
  Settings,
  Bell,
  SortAsc,
  SortDesc,
} from "lucide-react";
import clsx from "clsx";

const TYPE_FILTERS = [
  { value: "all", label: "All", icon: Bell },
  { value: "test_drive", label: "Test Drives", icon: CalendarCheck },
  { value: "invoice", label: "Invoices", icon: FileText },
  { value: "inventory", label: "Inventory", icon: Car },
  { value: "customer", label: "Customers", icon: Users },
  { value: "system", label: "System", icon: Settings },
];

function NotificationFilterBar({
  activeType,
  onTypeChange,
  showUnread,
  onUnreadToggle,
  sortOrder,
  onSortToggle,
  counts = {},
}) {
  return (
    <motion.div
      className="bg-card border border-border rounded-2xl px-4 py-3
                 flex items-center gap-3 sm:flex-row flex-col "
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      {/* Type filter chips */}
      <div className="flex items-center sm:justify-start justify-center gap-1.5 flex-shrink-0 flex-wrap flex-1">
        {TYPE_FILTERS.map((f) => {
          const count = f.value === "all" ? counts.all : counts[f.value];
          const isActive = activeType === f.value;
          return (
            <button
              key={f.value}
              onClick={() => onTypeChange(f.value)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border",
                "text-[11px] font-semibold transition-all flex-shrink-0",
                isActive
                  ? "border-gold/50 text-gold bg-gold/8"
                  : "border-border text-text-subtle hover:border-gold/25 hover:text-text-muted",
              )}
            >
              <f.icon size={12} />
              {f.label}
              {count > 0 && (
                <span
                  className={clsx(
                    "text-[7px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px]  text-center",
                    isActive
                      ? "bg-gold text-base"
                      : "bg-border text-text-muted",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-px h-5 bg-border flex-shrink-0 sm:rotate-0 rotate-[90deg]" />

      {/* Unread toggle */}
      <button
        onClick={onUnreadToggle}
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border",
          "text-[11px] font-semibold transition-all flex-shrink-0",
          showUnread
            ? "border-sky-accent/50 text-sky-accent bg-sky-accent/8"
            : "border-border text-text-subtle hover:border-sky-accent/30 hover:text-text-muted",
        )}
      >
        <span
          className={clsx(
            "w-2 h-2 rounded-full",
            showUnread ? "bg-sky-accent" : "bg-text-subtle/40",
          )}
        />
        Unread only
        {counts.unread > 0 && (
          <span
            className={clsx(
              "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
              showUnread
                ? "bg-sky-accent text-base"
                : "bg-border text-text-muted",
            )}
          >
            {counts.unread}
          </span>
        )}
      </button>

      {/* Sort toggle */}
      <button
        onClick={onSortToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border
                   text-[11px] font-semibold text-text-subtle
                   hover:border-gold/30 hover:text-text-muted transition-all flex-shrink-0"
        aria-label={
          sortOrder === "newest" ? "Sort oldest first" : "Sort newest first"
        }
      >
        {sortOrder === "newest" ? (
          <>
            <SortDesc size={13} /> Newest
          </>
        ) : (
          <>
            <SortAsc size={13} /> Oldest
          </>
        )}
      </button>
    </motion.div>
  );
}

export default NotificationFilterBar;
