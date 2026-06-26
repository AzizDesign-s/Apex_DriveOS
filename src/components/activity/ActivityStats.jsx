// src/components/activity/ActivityStats.jsx
// Summary strip — same 4-card pattern as Notifications page summary strip

import { motion } from "framer-motion";
import clsx from "clsx";

function ActivityStats({ logs }) {
  const today = new Date().toDateString();

  const stats = [
    {
      label: "Total Logs",
      value: logs.length,
      color: "text-text-primary",
    },
    {
      label: "Today",
      value: logs.filter((l) => new Date(l.createdAt).toDateString() === today)
        .length,
      color: "text-gold",
    },
    {
      label: "This Week",
      value: logs.filter((l) => {
        const diff = Date.now() - new Date(l.createdAt).getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      }).length,
      color: "text-sky-accent",
    },
    {
      label: "By Admin",
      value: logs.filter((l) => l.actorId === "admin" || l.actorId === "system")
        .length,
      color: "text-emerald-400",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bg-card border border-border rounded-xl px-4 py-3
                     flex items-center justify-between"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 + i * 0.04 }}
        >
          <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
            {s.label}
          </p>
          <p className={clsx("text-xl font-extrabold", s.color)}>{s.value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default ActivityStats;
