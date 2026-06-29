// src/components/promotions/PromotionStats.jsx
// 4 KPI pills — same pattern as every other module Stats component

import { motion } from "framer-motion";
import { getPromotionStatus } from "../../data/mockPromotion";
import clsx from "clsx";

function PromotionStats({ promotions }) {
  const active = promotions.filter(
    (p) => getPromotionStatus(p) === "active",
  ).length;
  const upcoming = promotions.filter(
    (p) => getPromotionStatus(p) === "upcoming",
  ).length;
  const expired = promotions.filter(
    (p) => getPromotionStatus(p) === "expired",
  ).length;

  const stats = [
    { label: "Total", value: promotions.length, color: "text-text-primary" },
    { label: "Active", value: active, color: "text-emerald-400" },
    { label: "Upcoming", value: upcoming, color: "text-sky-accent" },
    { label: "Expired", value: expired, color: "text-text-subtle" },
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
          <p className={clsx("text-xl font-extrabold", s.color)}>{s.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default PromotionStats;
