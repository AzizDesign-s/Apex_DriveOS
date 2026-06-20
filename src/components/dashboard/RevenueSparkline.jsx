// src/components/dashboard/RevenueSparkline.jsx
// Minimal inline sparkline — no axes, no grid, just the shape of the trend.

import { AreaChart, Area, ResponsiveContainer } from "recharts";

function RevenueSparkline({ data = [] }) {
  const chartData = data.map((value, i) => ({ i, value }));

  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart
        data={chartData}
        margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="sparklineGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="#D4AF37"
          strokeWidth={1.5}
          fill="url(#sparklineGold)"
          dot={false}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default RevenueSparkline;
