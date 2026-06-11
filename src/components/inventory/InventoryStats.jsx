// src/components/inventory/InventoryStats.jsx
// Stat pills row — shows live counts by status.
// Props: stats { total, available, reserved, sold, maintenance }

import { motion } from "framer-motion";
import { Car, CheckCircle, Clock, Tag, Wrench } from "lucide-react";
import clsx from "clsx";

const PILLS = [
  {
    key: "total",
    label: "Total Cars",
    icon: Car,
    iconClass: "bg-gold/10 text-gold",
  },
  {
    key: "available",
    label: "Available Cars",
    icon: CheckCircle,
    iconClass: "bg-emerald-400/10 text-emerald-400",
  },
  {
    key: "reserved",
    label: "Reserved Cars",
    icon: Clock,
    iconClass: "bg-sky-accent/10 text-sky-accent",
  },
  {
    key: "sold",
    label: "Sold Cars",
    icon: Tag,
    iconClass: "bg-gold/10 text-gold",
  },
  {
    key: "maintenance",
    label: "Maintenance Cars",
    icon: Wrench,
    iconClass: "bg-rose-400/10 text-rose-400",
  },
];

function InventoryStats({ stats = {} }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PILLS.map(({ key, label, icon: Icon, iconClass }, i) => (
        <motion.div
          key={key}
          className="flex items-center gap-3 bg-card border border-border rounded-xl
                     px-3 py-6 flex-1 min-w-[160px] max-w-[230px]
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
                          uppercase leading-none mb-3"
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

export default InventoryStats;
