// src/components/analytics/CustomerGrowthChart.jsx
// Area line chart — total, new, returning customers over time

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-glass">
      <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest mb-2">
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-6 text-xs mb-1"
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-text-muted">{p.name}</span>
          </div>
          <span className="font-bold text-text-primary">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function CustomerGrowthChart({ data = [] }) {
  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-text-primary">
            Customer Growth
          </h3>
          <p className="text-[10px] text-text-subtle mt-0.5">
            New vs returning customers
          </p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: "Total", color: "#D4AF37" },
            { label: "New", color: "#38BDF8" },
            { label: "Returning", color: "#10B981" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-[10px] text-text-muted">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradReturn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(27,46,74,0.6)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#4A6080", fontSize: 10, fontFamily: "Montserrat" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#4A6080", fontSize: 9, fontFamily: "Montserrat" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#D4AF37"
            strokeWidth={2}
            fill="url(#gradTotal)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="new"
            name="New"
            stroke="#38BDF8"
            strokeWidth={2}
            fill="url(#gradNew)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="returning"
            name="Returning"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#gradReturn)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default CustomerGrowthChart;
