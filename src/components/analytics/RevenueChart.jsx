// src/components/analytics/RevenueChart.jsx
//
// Full-width bar chart — revenue vs target by month.
// BUG-044 FIX: accepts pre-computed cellColors from parent
// so colors are stable on first render with no flicker.

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ── Custom tooltip ────────────────────────────────────────────────────────────
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
              style={{ background: p.fill || p.color }}
            />
            <span className="text-text-muted">{p.name}</span>
          </div>
          <span className="font-bold text-text-primary">
            AED {(p.value / 1000).toFixed(0)}K
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main chart ────────────────────────────────────────────────────────────────
function RevenueChart({ data = [], cellColors = [] }) {
  // BUG-044 FIX: if cellColors prop is empty (fallback),
  // compute inline so chart always renders correctly
  const getColor = (entry, index) => {
    if (cellColors[index]) return cellColors[index];
    return entry.revenue >= entry.target ? "#D4AF37" : "rgba(251,113,133,0.7)";
  };

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-text-primary">
            Revenue vs Target
          </h3>
          <p className="text-[10px] text-text-subtle mt-0.5">
            Monthly comparison in AED
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gold" />
            <span className="text-[10px] text-text-muted">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: "rgba(27,46,74,0.8)" }}
            />
            <span className="text-[10px] text-text-muted">Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: "rgba(251,113,133,0.7)" }}
            />
            <span className="text-[10px] text-text-muted">Below target</span>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            barCategoryGap="30%"
            barGap={4}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(27,46,74,0.6)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{
                fill: "#4A6080",
                fontSize: 10,
                fontFamily: "Montserrat, sans-serif",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fill: "#4A6080",
                fontSize: 9,
                fontFamily: "Montserrat, sans-serif",
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(212,175,55,0.04)" }}
            />

            {/* Target bars — muted background */}
            <Bar
              dataKey="target"
              name="Target"
              radius={[4, 4, 0, 0]}
              fill="rgba(27,46,74,0.8)"
            />

            {/* Revenue bars — gold if above target, rose if below */}
            <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={getColor(entry, i)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        /* Empty state when no invoice data exists yet */
        <div className="h-60 flex flex-col items-center justify-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl bg-gold/5 border border-gold/10
                          flex items-center justify-center"
          >
            <div
              className="w-6 h-6"
              style={{
                background: "rgba(212,175,55,0.3)",
                clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
              }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-muted">
              No revenue data yet
            </p>
            <p className="text-[10px] text-text-subtle mt-1">
              Revenue will appear here once invoices are created and paid
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default RevenueChart;
