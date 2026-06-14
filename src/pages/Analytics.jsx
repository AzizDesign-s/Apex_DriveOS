// src/pages/Analytics.jsx
// Dashboard-style analytics:
//   Row 1 — KPI cards
//   Row 2 — Full-width Revenue chart
//   Row 3 — 2x2 chart grid

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  CalendarCheck,
  TrendingUp,
  Car,
  FileText,
} from "lucide-react";
import {
  MONTHLY_REVENUE,
  SALES_BY_BRAND,
  CUSTOMER_GROWTH,
  INVENTORY_STATUS_DATA,
  TOP_CARS,
  TESTDRIVE_CONVERSION,
  PAYMENT_METHOD_DATA,
} from "../data/mockData";
import AnalyticsStatCard from "../components/analytics/AnalyticsStatCard";

import SalesPerformanceChart from "../components/analytics/SalesPerformanceChart";
import InventoryStatusChart from "../components/analytics/InventoryStatusChart";
import CustomerGrowthChart from "../components/analytics/CustomerGrowthChart";
import TopCarsChart from "../components/analytics/TopCarsChart";

// ── Date range options ────────────────────────────────────────────────────────
const RANGES = [
  { label: "7D", months: 0.25 },
  { label: "30D", months: 1 },
  { label: "90D", months: 3 },
  { label: "This Year", months: 12 },
];

// ── Format helpers ────────────────────────────────────────────────────────────
const fmtAED = (n) => {
  if (n >= 1000000) return `AED ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `AED ${(n / 1000).toFixed(0)}K`;
  return `AED ${n}`;
};

function Analytics() {
  const [activeRange, setActiveRange] = useState("This Year");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  // Filter monthly data by range
  const revenueData = useMemo(() => {
    const range = RANGES.find((r) => r.label === activeRange);
    if (!range) return MONTHLY_REVENUE;
    const months = Math.ceil(range.months);
    return MONTHLY_REVENUE.slice(-months || MONTHLY_REVENUE.length);
  }, [activeRange]);

  const customerData = useMemo(() => {
    const range = RANGES.find((r) => r.label === activeRange);
    if (!range) return CUSTOMER_GROWTH;
    const months = Math.ceil(range.months);
    return CUSTOMER_GROWTH.slice(-Math.min(months, CUSTOMER_GROWTH.length));
  }, [activeRange]);

  const conversionData = useMemo(() => {
    const range = RANGES.find((r) => r.label === activeRange);
    if (!range) return TESTDRIVE_CONVERSION;
    const months = Math.ceil(range.months);
    return TESTDRIVE_CONVERSION.slice(
      -Math.min(months, TESTDRIVE_CONVERSION.length),
    );
  }, [activeRange]);

  // KPI computations from revenue data
  const kpis = useMemo(() => {
    const totalRev = revenueData.reduce((s, d) => s + d.revenue, 0);
    const prevRev =
      revenueData.length > 1
        ? revenueData.slice(0, -1).reduce((s, d) => s + d.revenue, 0)
        : totalRev;

    const totalInvoices = revenueData.reduce((s, d) => s + d.invoices, 0);
    const avgOrder =
      totalInvoices > 0 ? Math.round(totalRev / totalInvoices) : 0;
    const totalCars = INVENTORY_STATUS_DATA.reduce((s, d) => s + d.value, 0);
    const soldCars =
      INVENTORY_STATUS_DATA.find((d) => d.name === "Sold")?.value || 0;
    const totalCustomers =
      CUSTOMER_GROWTH[CUSTOMER_GROWTH.length - 1]?.total || 0;
    const prevCustomers =
      CUSTOMER_GROWTH[CUSTOMER_GROWTH.length - 2]?.total || totalCustomers;
    const convRate =
      conversionData.reduce((s, d) => s + d.drives, 0) > 0
        ? Math.round(
            (conversionData.reduce((s, d) => s + d.converted, 0) /
              conversionData.reduce((s, d) => s + d.drives, 0)) *
              100,
          )
        : 0;

    const revTrend =
      prevRev > 0 ? Math.round(((totalRev - prevRev) / prevRev) * 100) : 0;
    const custTrend =
      prevCustomers > 0
        ? Math.round(((totalCustomers - prevCustomers) / prevCustomers) * 100)
        : 0;

    return {
      totalRev,
      totalInvoices,
      avgOrder,
      totalCars,
      soldCars,
      totalCustomers,
      convRate,
      revTrend,
      custTrend,
    };
  }, [revenueData, conversionData]);

  const KPI_CARDS = [
    {
      label: "Total Revenue",
      value: fmtAED(kpis.totalRev),
      sub: `${kpis.totalInvoices} invoices`,
      icon: DollarSign,
      iconClass: "bg-gold/10 text-gold",
      trend: kpis.revTrend,
      trendLabel: "vs prev period",
    },
    {
      label: "Cars Sold",
      value: String(kpis.soldCars),
      sub: `${kpis.totalCars} total inventory`,
      icon: Car,
      iconClass: "bg-sky-accent/10 text-sky-accent",
      trend: 12,
      trendLabel: "vs prev period",
    },
    {
      label: "Total Customers",
      value: String(kpis.totalCustomers),
      sub: "across all statuses",
      icon: Users,
      iconClass: "bg-emerald-400/10 text-emerald-400",
      trend: kpis.custTrend,
      trendLabel: "vs prev period",
    },
    {
      label: "Avg. Order Value",
      value: fmtAED(kpis.avgOrder),
      sub: "per invoice",
      icon: TrendingUp,
      iconClass: "bg-violet-400/10 text-violet-400",
      trend: 8,
      trendLabel: "vs prev period",
    },
    {
      label: "Test Drive Conversion",
      value: `${kpis.convRate}%`,
      sub: "drives → sales",
      icon: CalendarCheck,
      iconClass: "bg-amber-400/10 text-amber-400",
      trend: 5,
      trendLabel: "vs prev period",
    },
    {
      label: "Active Invoices",
      value: String(kpis.totalInvoices),
      sub: "in selected period",
      icon: FileText,
      iconClass: "bg-rose-400/10 text-rose-400",
      trend: 0,
      trendLabel: "",
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6">
      {/* ── Page Header + Date Range Filter ── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-text-primary">
            Analytics
          </h1>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            Executive overview · APEX GT Dubai
          </p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-2">
          {/* Preset buttons */}
          <div className="flex bg-card border border-border rounded-xl overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => {
                  setActiveRange(r.label);
                  setShowCustom(false);
                }}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  activeRange === r.label && !showCustom
                    ? "bg-gold/10 text-gold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <button
            onClick={() => {
              setShowCustom((p) => !p);
              setActiveRange("");
            }}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold
                        transition-all ${
                          showCustom
                            ? "border-gold/40 text-gold bg-gold/5"
                            : "border-border text-text-muted hover:border-gold/30 hover:text-gold"
                        }`}
          >
            Custom
          </button>
          {showCustom && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <input
                type="date"
                className="input-luxury text-xs py-1.5 w-32"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-text-subtle text-xs">→</span>
              <input
                type="date"
                className="input-luxury text-xs py-1.5 w-32"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-shrink-0">
        {KPI_CARDS.map((card, i) => (
          <AnalyticsStatCard key={card.label} {...card} delay={i * 0.05} />
        ))}
      </div>

      {/* ── Row 2: Full-width Revenue Chart ── */}
      {/* <div className="flex-shrink-0">
        <RevenueChart data={revenueData} />
      </div> */}

      {/* ── Row 3: 2×2 chart grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
        <SalesPerformanceChart data={SALES_BY_BRAND} />
        <InventoryStatusChart data={INVENTORY_STATUS_DATA} />
        <CustomerGrowthChart data={customerData} />
        <TopCarsChart
          topCars={TOP_CARS}
          conversionData={conversionData}
          paymentData={PAYMENT_METHOD_DATA}
        />
      </div>
    </div>
  );
}

export default Analytics;
