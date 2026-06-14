// src/components/analytics/InventoryStatusChart.jsx
// Donut chart — inventory by status

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-glass">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: d.payload.color }}
        />
        <span className="text-xs font-bold text-text-primary">{d.name}</span>
      </div>
      <p className="text-xs text-text-muted mt-1">
        {d.value} car{d.value !== 1 ? "s" : ""} · {d.payload.pct}%
      </p>
    </div>
  );
}

function InventoryStatusChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const enriched = data.map((d) => ({
    ...d,
    pct: ((d.value / total) * 100).toFixed(0),
  }));

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-text-primary">
          Inventory Status
        </h3>
        <p className="text-[10px] text-text-subtle mt-0.5">
          {total} cars total
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="flex-shrink-0">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={enriched}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {enriched.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {enriched.map((d, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-[11px] text-text-muted">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-text-primary">
                  {d.value}
                </span>
                <span className="text-[9px] text-text-subtle w-7 text-right">
                  {d.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default InventoryStatusChart;
