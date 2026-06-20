// src/components/reports/ReportTabBar.jsx
//
// 4-tab switcher — Sales / Inventory / Customer / Test Drive.
// Pill-style, matches the luxury gold-accent language used everywhere else.

import { motion } from "framer-motion";
import { TrendingUp, Package, Users, CalendarCheck } from "lucide-react";
import clsx from "clsx";

export const REPORT_TABS = [
  { id: "sales", label: "Sales Reports", icon: TrendingUp },
  { id: "inventory", label: "Inventory Reports", icon: Package },
  { id: "customer", label: "Customer Reports", icon: Users },
  { id: "testdrive", label: "Test Drive Reports", icon: CalendarCheck },
];

function ReportTabBar({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-2xl p-1.5 flex-shrink-0 overflow-x-auto scrollbar-none">
      {REPORT_TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0",
              isActive ? "text-gold" : "text-text-subtle hover:text-text-muted",
            )}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gold/10 border border-gold/25 rounded-xl"
                layoutId="report-tab-active-bg"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <tab.icon size={14} className="relative z-10" />
            <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ReportTabBar;
