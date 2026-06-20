// src/components/dashboard/DashboardInsightCard.jsx
//
// Shared shell for the 5 insight widgets — same visual language as
// the existing StatCard in Dashboard.jsx (bg-card border-border rounded-2xl,
// same icon-badge pattern, same motion.div entrance).

import { motion } from "framer-motion";
import clsx from "clsx";

function DashboardInsightCard({
  label,
  icon: Icon,
  iconClass,
  delay = 0,
  onClick,
  children,
}) {
  return (
    <motion.div
      className={clsx(
        "bg-card border border-border rounded-2xl p-4 flex flex-col gap-2.5",
        "hover:border-gold/20 transition-all",
        onClick && "cursor-pointer",
      )}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : {}}
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
          {label}
        </p>
        <div
          className={clsx(
            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
            iconClass,
          )}
        >
          <Icon size={13} />
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export default DashboardInsightCard;
