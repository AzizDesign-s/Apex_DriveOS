// src/components/analytics/SalesPerformanceChart.jsx
// Horizontal bar chart — sales + revenue by brand

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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-glass">
      <p className="text-[10px] font-bold text-gold mb-2">{label}</p>
      <p className="text-xs text-text-muted">
        Cars Sold:{" "}
        <span className="text-text-primary font-bold">{payload[0]?.value}</span>
      </p>
      <p className="text-xs text-text-muted mt-1">
        Revenue:{" "}
        <span className="text-text-primary font-bold">
          AED {Number(payload[0]?.payload?.revenue || 0).toLocaleString()}
        </span>
      </p>
    </div>
  );
}

function SalesPerformanceChart({ data = [] }) {
  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="mb-5">
        <h3 className="text-sm font-extrabold text-text-primary">
          Sales by Brand
        </h3>
        <p className="text-[10px] text-text-subtle mt-0.5">
          Units sold per brand
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
          barCategoryGap="25%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(27,46,74,0.6)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fill: "#4A6080", fontSize: 9, fontFamily: "Montserrat" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="brand"
            tick={{ fill: "#8BA0C0", fontSize: 10, fontFamily: "Montserrat" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(212,175,55,0.04)" }}
          />
          <Bar dataKey="sales" name="Units Sold" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || "#D4AF37"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default SalesPerformanceChart;
