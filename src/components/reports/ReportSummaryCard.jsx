// src/components/reports/ReportSummaryCard.jsx
//
// Bigger, more "report-grade" KPI card than Analytics' compact stat card.
// Includes an optional mini-trend sparkline-style bar and comparison label.

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import clsx from "clsx";

function ReportSummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  trend,
  trendLabel,
  delay = 0,
}) {
  const trendUp = trend > 0;
  const trendFlat = trend === 0 || trend == null;

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3
                 hover:border-gold/20 transition-all"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
          {label}
        </p>
        <div
          className={clsx(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            iconClass,
          )}
        >
          <Icon size={16} />
        </div>
      </div>

      <p className="text-2xl font-extrabold text-text-primary leading-none tracking-tight">
        {value}
      </p>

      <div className="flex items-center justify-between">
        {sub && <p className="text-[10px] text-text-subtle">{sub}</p>}
        {trend != null && (
          <div
            className={clsx(
              "flex items-center gap-1 text-[10px] font-semibold flex-shrink-0",
              trendFlat
                ? "text-text-subtle"
                : trendUp
                  ? "text-emerald-400"
                  : "text-rose-400",
            )}
          >
            {trendFlat ? (
              <Minus size={11} />
            ) : trendUp ? (
              <TrendingUp size={11} />
            ) : (
              <TrendingDown size={11} />
            )}
            {!trendFlat && `${Math.abs(trend)}%`}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ReportSummaryCard;
