// src/components/reports/SalesReportTab.jsx
//
// Sales Reports — Summary cards, Revenue by Month/Brand/Model, Sales Performance by Exec
// Reuses RevenueChart + SalesPerformanceChart from Analytics. Adds Revenue by Model
// and Sales by Executive which Analytics never had.

import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ShoppingCart, Award } from "lucide-react";
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
import { calcInvoice } from "../../data/mockData";
import {
  computeMonthlyRevenue,
  computeSalesByBrand,
} from "../../utils/analyticsUtils";
import {
  computeRevenueByModel,
  computeSalesByExec,
} from "../../utils/reportUtils";
import ReportSummaryCard from "./ReportSummaryCard";
import RevenueChart from "../analytics/RevenueChart";
import SalesPerformanceChart from "../analytics/SalesPerformanceChart";

function fmtAED(n) {
  if (n >= 1000000) return `AED ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `AED ${(n / 1000).toFixed(0)}K`;
  return `AED ${n || 0}`;
}

function ReportSection({ title, sub, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 ">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-text-primary">{title}</h3>
        {sub && <p className="text-[10px] text-text-subtle mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// Revenue by Model — horizontal bar, finer grain than the Sales-by-Brand chart
function RevenueByModelChart({ data }) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-text-subtle text-center py-10">
        No paid invoices in this range
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 38)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        barCategoryGap="28%"
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
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <YAxis
          type="category"
          dataKey="model"
          tick={{ fill: "#8BA0C0", fontSize: 10, fontFamily: "Montserrat" }}
          axisLine={false}
          tickLine={false}
          width={150}
          tickFormatter={(v) => (v.length > 20 ? v.slice(0, 20) + "…" : v)}
        />
        <Tooltip
          cursor={{ fill: "rgba(212,175,55,0.04)" }}
          contentStyle={{
            background: "#0D1526",
            border: "1px solid #1B2E4A",
            borderRadius: "12px",
            color: "#F0F4FF",
            fontSize: "11px",
          }}
          formatter={(val, name) =>
            name === "revenue"
              ? [`AED ${val.toLocaleString()}`, "Revenue"]
              : [val, "Units"]
          }
        />
        <Bar
          dataKey="revenue"
          name="revenue"
          radius={[0, 4, 4, 0]}
          fill="#D4AF37"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Sales Performance by Executive — leaderboard style
function ExecLeaderboard({ data }) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-text-subtle text-center py-10">
        No test drive assignments in this range
      </p>
    );
  }
  const maxRevenue = Math.max(...data.map((e) => e.revenue), 1);

  return (
    <div className="space-y-3">
      {data.map((e, i) => (
        <motion.div
          key={e.exec}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
              i === 0
                ? "bg-gold/15 text-gold"
                : "bg-base text-text-subtle border border-border"
            }`}
          >
            {i === 0 ? <Award size={13} /> : i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-text-primary truncate">
                {e.exec}
              </p>
              <p className="text-xs font-bold text-gold flex-shrink-0">
                AED {(e.revenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="h-1.5 bg-base rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(e.revenue / maxRevenue) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              />
            </div>
            <p className="text-[10px] text-text-subtle mt-1">
              {e.totalDrives} drives · {e.converted} converted ·{" "}
              {e.conversionRate}% rate
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SalesReportTab({ invoices = [], cars = [], bookings = [] }) {
  const kpis = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid");
    const totalRevenue = paid.reduce(
      (sum, inv) =>
        sum + calcInvoice(inv.items, inv.discount, inv.vatRate).total,
      0,
    );
    const avgOrder =
      paid.length > 0 ? Math.round(totalRevenue / paid.length) : 0;
    const uniqueModelsSold = new Set(paid.map((i) => i.carName)).size;
    return { totalRevenue, unitsSold: paid.length, avgOrder, uniqueModelsSold };
  }, [invoices]);

  const revenueByMonth = useMemo(
    () => computeMonthlyRevenue(invoices),
    [invoices],
  );
  const revenueByBrand = useMemo(
    () => computeSalesByBrand(invoices, cars),
    [invoices, cars],
  );
  const revenueByModel = useMemo(
    () => computeRevenueByModel(invoices),
    [invoices],
  );
  const byExec = useMemo(
    () => computeSalesByExec(bookings, invoices),
    [bookings, invoices],
  );

  const cellColors = useMemo(
    () =>
      revenueByMonth.map((d) =>
        d.revenue >= d.target ? "#D4AF37" : "rgba(251,113,133,0.7)",
      ),
    [revenueByMonth],
  );

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <ReportSummaryCard
          label="Total Revenue"
          value={fmtAED(kpis.totalRevenue)}
          sub="Paid invoices in range"
          icon={DollarSign}
          iconClass="bg-gold/10 text-gold"
          delay={0}
        />
        <ReportSummaryCard
          label="Vehicles Sold"
          value={String(kpis.unitsSold)}
          sub="Completed transactions"
          icon={ShoppingCart}
          iconClass="bg-emerald-400/10 text-emerald-400"
          delay={0.05}
        />
        <ReportSummaryCard
          label="Avg. Order Value"
          value={fmtAED(kpis.avgOrder)}
          sub="Per paid invoice"
          icon={TrendingUp}
          iconClass="bg-sky-accent/10 text-sky-accent"
          delay={0.1}
        />
        <ReportSummaryCard
          label="Models Sold"
          value={String(kpis.uniqueModelsSold)}
          sub="Distinct vehicle models"
          icon={Award}
          iconClass="bg-violet-400/10 text-violet-400"
          delay={0.15}
        />
      </div>

      {/* Revenue trend — reused from Analytics */}
      <RevenueChart data={revenueByMonth} cellColors={cellColors} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Revenue by Brand — reused from Analytics */}
        <SalesPerformanceChart data={revenueByBrand} />

        {/* Revenue by Model — new */}
        <ReportSection
          title="Revenue by Model"
          sub="Per-model breakdown, finer than brand-level"
        >
          <RevenueByModelChart data={revenueByModel} />
        </ReportSection>

        {/* Sales Performance by Executive — new */}
        <ReportSection
          title="Sales Performance by Executive"
          sub="Test drive conversions and revenue attributed per sales executive"
        >
          <ExecLeaderboard data={byExec} />
        </ReportSection>
      </div>
    </div>
  );
}

export default SalesReportTab;
