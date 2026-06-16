// src/components/analytics/TopCarsChart.jsx
// Two charts in one card:
//   Left tab  → Top cars by units sold (bar)
//   Right tab → Payment method breakdown (donut)

import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import clsx from "clsx";

// Test drive conversion — simple stacked bar
function ConversionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const drives = payload.find((p) => p.dataKey === "drives")?.value || 0;
  const converted = payload.find((p) => p.dataKey === "converted")?.value || 0;
  const rate = drives > 0 ? Math.round((converted / drives) * 100) : 0;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-glass">
      <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-xs text-text-muted">
        Test Drives:{" "}
        <span className="text-text-primary font-bold">{drives}</span>
      </p>
      <p className="text-xs text-text-muted">
        Converted:{" "}
        <span className="text-emerald-400 font-bold">{converted}</span>
      </p>
      <p className="text-xs text-text-muted">
        Rate: <span className="text-gold font-bold">{rate}%</span>
      </p>
    </div>
  );
}

function PaymentTooltip({ active, payload }) {
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
        {d.payload.count} invoice{d.payload.count !== 1 ? "s" : ""}
      </p>
      <p className="text-xs text-text-muted">
        AED {Number(d.payload.revenue).toLocaleString()}
      </p>
    </div>
  );
}

const TABS = ["Top Cars", "Test Drive Conversion", "Payment Methods"];

function TopCarsChart({
  topCars = [],
  conversionData = [],
  paymentData = [],
  activeTab = 0, // ← BUG-043 FIX: controlled from parent
  onTabChange,
}) {
  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      {/* Tab header */}
      <div className="flex items-center gap-0 mb-5 border-b border-border">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => onTabChange(i)}
            className={clsx(
              "px-4 py-2 text-[11px] font-semibold border-b-2 transition-all -mb-px",
              activeTab === i
                ? "border-gold text-gold"
                : "border-transparent text-text-subtle hover:text-text-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* ── Top Cars ── */}
          {activeTab === 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topCars}
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
                  tick={{
                    fill: "#4A6080",
                    fontSize: 9,
                    fontFamily: "Montserrat",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="model"
                  tick={{
                    fill: "#8BA0C0",
                    fontSize: 9,
                    fontFamily: "Montserrat",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                  tickFormatter={(v) =>
                    v.length > 18 ? v.slice(0, 18) + "…" : v
                  }
                />
                <RTooltip
                  cursor={{ fill: "rgba(212,175,55,0.04)" }}
                  contentStyle={{
                    background: "var(--color-card, #0D1526)",
                    border: "1px solid #1B2E4A",
                    borderRadius: "12px",
                    color: "#F0F4FF",
                    fontSize: "11px",
                  }}
                />
                <Bar
                  dataKey="sold"
                  name="Units Sold"
                  radius={[0, 4, 4, 0]}
                  fill="#D4AF37"
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* ── Test Drive Conversion ── */}
          {activeTab === 1 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={conversionData}
                barCategoryGap="30%"
                barGap={3}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
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
                    fontFamily: "Montserrat",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "#4A6080",
                    fontSize: 9,
                    fontFamily: "Montserrat",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <RTooltip
                  content={<ConversionTooltip />}
                  cursor={{ fill: "rgba(212,175,55,0.04)" }}
                />
                <Bar
                  dataKey="drives"
                  name="Test Drives"
                  radius={[4, 4, 0, 0]}
                  fill="rgba(56,189,248,0.5)"
                />
                <Bar
                  dataKey="converted"
                  name="Converted"
                  radius={[4, 4, 0, 0]}
                  fill="#10B981"
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* ── Payment Methods ── */}
          {activeTab === 2 && (
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="revenue"
                      nameKey="method"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {paymentData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip content={<PaymentTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-3">
                {paymentData.map((d, i) => {
                  const totalRev = paymentData.reduce(
                    (s, x) => s + x.revenue,
                    0,
                  );
                  const pct = Math.round((d.revenue / totalRev) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: d.color }}
                          />
                          <span className="text-[11px] text-text-muted">
                            {d.method}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-text-primary">
                          {pct}%
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="h-1 bg-base rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: d.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default TopCarsChart;
