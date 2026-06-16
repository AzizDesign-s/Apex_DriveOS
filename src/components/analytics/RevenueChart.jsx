// src/components/charts/RevenueChart.jsx
//
// WHY a separate file?
//   Charts have a lot of config (colors, axes, tooltips).
//   Keeping each chart in its own file means Dashboard.jsx stays clean.
//   If you need this chart on the Analytics page too, just import it.

import { useEffect, useRef } from "react";

// We're using Recharts here (already installed), not Chart.js
// Recharts is React-native — no useRef/useEffect needed like raw Chart.js

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { monthlyRevenue } from "../../data/mockData";

// Build data in the format Recharts expects: array of objects

// Custom tooltip — luxury dark style
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-glass text-xs">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map(
        (p) =>
          p.value !== null && (
            <p key={p.name} style={{ color: p.color }} className="font-medium">
              {p.name}: AED {p.value}M
            </p>
          ),
      )}
    </div>
  );
}

function RevenueChart({ data = [], cellColors = [] }) {
  return (
    // ResponsiveContainer fills its parent div's width/height
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={2} barCategoryGap="30%">
        {/* Grid lines */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          vertical={false}
        />

        {/* X axis — month labels */}
        <XAxis
          dataKey="month"
          tick={{ fill: "#475569", fontSize: 10, fontFamily: "Montserrat" }}
          axisLine={false}
          tickLine={false}
        />

        {/* Y axis — AED values */}
        <YAxis
          tick={{ fill: "#475569", fontSize: 10, fontFamily: "Montserrat" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}M`}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(212,175,55,0.04)" }}
        />

        {/* 2025 bars — muted */}
        <Bar
          dataKey="target"
          name="Target"
          radius={[4, 4, 0, 0]}
          fill="rgba(27,46,74,0.8)"
        />

        {/* 2026 bars — gold accent */}
        <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              // BUG-044 FIX: use pre-computed color, not inline conditional
              // This prevents flicker because colors are stable from first render
              fill={cellColors[i] || "#D4AF37"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default RevenueChart;
