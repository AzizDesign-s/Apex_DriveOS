// src/components/dashboard/AlertCard.jsx
//
// Premium actionable alert card. Distinct from DashboardInsightCard —
// alerts carry urgency (left accent bar, pulsing dot, priority color)
// while insights are neutral status displays.

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Package,
  FileWarning,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import clsx from "clsx";

const TYPE_CONFIG = {
  inventory: { icon: Package, color: "amber" },
  invoice: { icon: FileWarning, color: "rose" },
  test_drive: { icon: CalendarClock, color: "sky" },
};

// Tailwind-safe color class lookup — avoids dynamic class string construction
const COLOR_CLASSES = {
  amber: {
    border: "border-l-amber-400",
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    iconBg: "bg-amber-400/15",
  },
  rose: {
    border: "border-l-rose-400",
    bg: "bg-rose-400/10",
    text: "text-rose-400",
    dot: "bg-rose-400",
    iconBg: "bg-rose-400/15",
  },
  sky: {
    border: "border-l-sky-accent",
    bg: "bg-sky-accent/10",
    text: "text-sky-accent",
    dot: "bg-sky-accent",
    iconBg: "bg-sky-accent/15",
  },
};

function AlertCard({ alert, onAction, index = 0 }) {
  const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.inventory;
  const colors = COLOR_CLASSES[cfg.color];
  const Icon = cfg.icon;

  return (
    <motion.div
      className={clsx(
        "bg-card border border-border rounded-2xl pl-4 pr-3 py-3 flex items-start gap-3",
        "border-l-[3px] hover:border-opacity-100 transition-all cursor-pointer",
        colors.border,
      )}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => onAction(alert)}
      whileHover={{ scale: 1.005 }}
    >
      <div
        className={clsx(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative",
          colors.iconBg,
          colors.text,
        )}
      >
        <Icon size={15} />
        {/* Pulsing urgency dot for high priority */}
        {alert.priority === "high" && (
          <span
            className={clsx(
              "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse",
              colors.dot,
            )}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-text-primary leading-tight">
            {alert.title}
          </p>
          {alert.priority === "high" && (
            <span
              className={clsx(
                "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                colors.bg,
                colors.text,
              )}
            >
              Urgent
            </span>
          )}
        </div>
        <p className="text-[10px] text-text-subtle mt-0.5 leading-relaxed">
          {alert.message}
        </p>
      </div>

      <ArrowUpRight size={13} className="text-text-subtle flex-shrink-0 mt-1" />
    </motion.div>
  );
}

export default AlertCard;
