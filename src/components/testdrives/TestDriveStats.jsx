// src/components/testdrives/TestDriveStats.jsx

import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  Flag,
  XCircle,
  Ban,
} from "lucide-react";
import clsx from "clsx";

const PILLS = [
  {
    key: "total",
    label: "Total",
    icon: CalendarCheck,
    iconClass: "bg-gold/10 text-gold",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    iconClass: "bg-amber-400/10 text-amber-400",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle,
    iconClass: "bg-emerald-400/10 text-emerald-400",
  },
  {
    key: "completed",
    label: "Completed",
    icon: Flag,
    iconClass: "bg-sky-accent/10 text-sky-accent",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    iconClass: "bg-rose-400/10 text-rose-400",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: Ban,
    iconClass: "bg-text-subtle/10 text-text-subtle",
  },
];

function TestDriveStats({ stats = {} }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PILLS.map(({ key, label, icon: Icon, iconClass }, i) => (
        <motion.div
          key={key}
          className="flex items-center gap-3 bg-card border border-border rounded-xl
                     px-3 py-2.5 flex-1 min-w-[90px]
                     hover:border-gold/20 transition-colors cursor-default"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div
            className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              iconClass,
            )}
          >
            <Icon size={15} />
          </div>
          <div>
            <p
              className="text-[9px] font-bold tracking-[0.2em] text-text-subtle
                          uppercase leading-none mb-1"
            >
              {label}
            </p>
            <p className="text-base font-extrabold text-text-primary leading-none">
              {stats[key] ?? 0}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default TestDriveStats;
