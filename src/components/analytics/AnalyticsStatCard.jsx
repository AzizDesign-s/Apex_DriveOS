// src/components/analytics/AnalyticsStatCard.jsx
// Executive KPI card — same glass card pattern as Dashboard
// but with trend indicator + sparkline support

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import clsx from "clsx";

function AnalyticsStatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass = "bg-gold/10 text-gold",
  trend, // number — positive = up, negative = down, 0 = flat
  trendLabel, // e.g. "vs last month"
  delay = 0,
}) {
  const trendUp = trend > 0;
  const trendFlat = trend === 0 || trend == null;

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3
                 hover:border-gold/20 transition-colors"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Icon + label */}
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
          {label}
        </p>
        <div
          className={clsx(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            iconClass,
          )}
        >
          <Icon size={15} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-extrabold text-text-primary leading-none tracking-tight">
          {value}
        </p>
        {sub && <p className="text-[10px] text-text-subtle mt-1">{sub}</p>}
      </div>

      {/* Trend */}
      {trend != null && (
        <div
          className={clsx(
            "flex items-center gap-1.5 text-[10px] font-semibold",
            trendFlat
              ? "text-text-subtle"
              : trendUp
                ? "text-emerald-400"
                : "text-rose-400",
          )}
        >
          {trendFlat ? (
            <Minus size={12} />
          ) : trendUp ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          <span>
            {trendFlat
              ? "No change"
              : `${Math.abs(trend)}% ${trendUp ? "increase" : "decrease"}`}
          </span>
          {trendLabel && (
            <span className="text-text-subtle font-normal">{trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default AnalyticsStatCard;
