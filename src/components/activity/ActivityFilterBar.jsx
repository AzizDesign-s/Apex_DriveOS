// src/components/activity/ActivityFilterBar.jsx
// Same pattern as NotificationFilterBar — module tabs + sort toggle

import { motion } from "framer-motion";
import {
  Car,
  Users,
  CalendarCheck,
  FileText,
  UserCircle,
  Settings,
  Globe,
  LayoutGrid,
  ArrowUpDown,
} from "lucide-react";
import clsx from "clsx";

const MODULE_FILTERS = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "inventory", label: "Inventory", icon: Car },
  { id: "customers", label: "Customers", icon: UserCircle },
  { id: "test_drives", label: "Test Drives", icon: CalendarCheck },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "leads", label: "Leads", icon: Globe },
  { id: "service", label: "Service", icon: Settings },
];

function ActivityFilterBar({
  activeModule,
  onModuleChange,
  sortOrder,
  onSortToggle,
  counts = {},
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
      {/* Module tabs */}
      <div
        className="flex items-center gap-1 bg-card border border-border
                      rounded-xl p-1 flex-wrap"
      >
        {MODULE_FILTERS.map((f) => {
          const count = counts[f.id] ?? 0;
          const isActive = activeModule === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onModuleChange(f.id)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]",
                "font-semibold transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-gold/15 text-gold border border-gold/25"
                  : "text-text-subtle hover:text-text-muted hover:bg-gold/5",
              )}
            >
              <f.icon size={11} />
              {f.label}
              {count > 0 && f.id !== "all" && (
                <span
                  className={clsx(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-gold/20 text-gold"
                      : "bg-border text-text-subtle",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort toggle */}
      <button
        onClick={onSortToggle}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border
                   text-[11px] font-semibold text-text-subtle hover:text-gold
                   hover:border-gold/30 transition-all ml-auto"
      >
        <ArrowUpDown size={12} />
        {sortOrder === "newest" ? "Newest First" : "Oldest First"}
      </button>
    </div>
  );
}

export default ActivityFilterBar;
