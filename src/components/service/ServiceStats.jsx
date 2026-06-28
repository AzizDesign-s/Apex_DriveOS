// src/components/service/ServiceStats.jsx
// KPI strip above the service table.
// Shows: Total, Active (pending+in_progress), Completed, Total Cost

import { motion } from "framer-motion";
import clsx from "clsx";

function ServiceStats({ orders }) {
  const total = orders.length;
  const active = orders.filter(
    (o) => o.status === "pending" || o.status === "in_progress",
  ).length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const totalCost = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.actualCost || o.estimatedCost || 0), 0);

  const stats = [
    { label: "Total Orders", value: total, color: "text-text-primary" },
    { label: "Active", value: active, color: "text-amber-400" },
    { label: "Completed", value: completed, color: "text-emerald-400" },
    {
      label: "Cost (Completed)",
      value: `AED ${Number(totalCost).toLocaleString()}`,
      color: "text-gold",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bg-card border border-border rounded-xl px-4 py-3
                     flex items-center justify-between"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
            {s.label}
          </p>
          <p className={clsx("text-lg font-extrabold truncate ml-2", s.color)}>
            {s.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default ServiceStats;
