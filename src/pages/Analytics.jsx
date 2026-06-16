// src/pages/Analytics.jsx
// Dashboard-style analytics:
//   Row 1 — KPI cards
//   Row 2 — Full-width Revenue chart
//   Row 3 — 2x2 chart grid

import { useState, useMemo, useEffect } from "react";
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
  getLiveCars,
  getLiveCustomers,
  getLiveInvoices,
  getLiveBookings,
  filterInvoicesByRange,
  filterBookingsByRange,
  filterCustomersByRange,
  computeMonthlyRevenue,
  computeSalesByBrand,
  computeCustomerGrowth,
  computeInventoryStatus,
  computeTopCars,
  computeTestDriveConversion,
  computePaymentMethods,
  computeAnalyticsKPIs,
} from "../utils/analyticsUtils";
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
const RANGES = ["7D", "30D", "90D", "This Year"];

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

  // BUG-043 FIX: lift TopCarsChart tab state to Analytics level
  // so it doesn't reset when parent re-renders due to range change
  const [topCarsTab, setTopCarsTab] = useState(0);

  // ── Load live data ──────────────────────────────────────────────────────────
  // BUG-040 FIX: read from localStorage not hardcoded arrays
  const [liveCars, setLiveCars] = useState(getLiveCars);
  const [liveCustomers, setLiveCustomers] = useState(getLiveCustomers);
  const [liveInvoices, setLiveInvoices] = useState(getLiveInvoices);
  const [liveBookings, setLiveBookings] = useState(getLiveBookings);

  useEffect(() => {
    const onCars = (e) => {
      if (e.detail?.cars) setLiveCars(e.detail.cars);
    };
    const onCustomers = (e) => {
      if (e.detail?.customers) setLiveCustomers(e.detail.customers);
    };
    const onInvoices = (e) => {
      if (e.detail?.invoices) setLiveInvoices(e.detail.invoices);
    };
    const onBookings = (e) => {
      if (e.detail?.bookings) setLiveBookings(e.detail.bookings);
    };

    window.addEventListener("apex-gt-cars-updated", onCars);
    window.addEventListener("apex-gt-customers-updated", onCustomers);
    window.addEventListener("apex-gt-invoices-updated", onInvoices);
    window.addEventListener("apex-gt-bookings-updated", onBookings);

    return () => {
      window.removeEventListener("apex-gt-cars-updated", onCars);
      window.removeEventListener("apex-gt-customers-updated", onCustomers);
      window.removeEventListener("apex-gt-invoices-updated", onInvoices);
      window.removeEventListener("apex-gt-bookings-updated", onBookings);
    };
  }, []);

  const rangeInvoices = useMemo(
    () =>
      filterInvoicesByRange(liveInvoices, activeRange, customFrom, customTo),
    [liveInvoices, activeRange, customFrom, customTo],
  );

  const rangeBookings = useMemo(
    () =>
      filterBookingsByRange(liveBookings, activeRange, customFrom, customTo),
    [liveBookings, activeRange, customFrom, customTo],
  );

  const rangeCustomers = useMemo(
    () =>
      filterCustomersByRange(liveCustomers, activeRange, customFrom, customTo),
    [liveCustomers, activeRange, customFrom, customTo],
  );

  // Previous period — for trend comparison (BUG-042)
  const prevRangeInvoices = useMemo(() => {
    // Previous period = same length of time, before the current range start
    const currentFiltered = rangeInvoices;
    if (currentFiltered.length === 0) return [];

    // Get the date range of current period
    const dates = currentFiltered
      .map((inv) => new Date(inv.issuedDate))
      .filter((d) => !isNaN(d));

    if (dates.length === 0) return [];

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const periodMs = maxDate - minDate || 86400000;

    // Previous period ends at minDate - 1ms, starts periodMs before that
    const prevEnd = new Date(minDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - periodMs);

    return liveInvoices.filter((inv) => {
      if (!inv.issuedDate) return false;
      const d = new Date(inv.issuedDate);
      return d >= prevStart && d <= prevEnd;
    });
  }, [rangeInvoices, liveInvoices]);

  const revenueData = useMemo(
    () => computeMonthlyRevenue(rangeInvoices),
    [rangeInvoices],
  );
  const brandData = useMemo(
    () => computeSalesByBrand(rangeInvoices, liveCars),
    [rangeInvoices, liveCars],
  );
  const customerData = useMemo(
    () => computeCustomerGrowth(rangeCustomers),
    [rangeCustomers],
  );
  const inventoryData = useMemo(
    () => computeInventoryStatus(liveCars),
    [liveCars],
  );
  const topCarsData = useMemo(
    () => computeTopCars(rangeInvoices, liveCars),
    [rangeInvoices, liveCars],
  );
  const conversionData = useMemo(
    () => computeTestDriveConversion(rangeBookings, rangeInvoices),
    [rangeBookings, rangeInvoices],
  );
  const paymentData = useMemo(
    () => computePaymentMethods(rangeInvoices),
    [rangeInvoices],
  );

  // KPI computations from revenue data
  const kpis = useMemo(
    () =>
      computeAnalyticsKPIs(
        liveCars,
        rangeCustomers,
        rangeInvoices,
        rangeBookings,
        prevRangeInvoices,
        liveCustomers,
      ),
    [
      liveCars,
      rangeCustomers,
      rangeInvoices,
      rangeBookings,
      prevRangeInvoices,
      liveCustomers,
    ],
  );

  const KPI_CARDS = [
    {
      label: "Total Revenue",
      value: fmtAED(kpis.totalRevenue),
      sub: `${kpis.paidInvoicesCount} paid invoices`,
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
      trend: null,
      trendLabel: "",
    },
    {
      label: "Total Customers",
      value: String(kpis.totalCustomers),
      sub: "in selected period",
      icon: Users,
      iconClass: "bg-emerald-400/10 text-emerald-400",
      trend: kpis.custTrend,
      trendLabel: "vs prev period",
    },
    {
      label: "Avg. Order Value",
      value: fmtAED(kpis.avgOrder),
      sub: "per paid invoice",
      icon: TrendingUp,
      iconClass: "bg-violet-400/10 text-violet-400",
      trend: null,
      trendLabel: "",
    },
    {
      label: "Test Drive Conversion",
      value: `${kpis.convRate}%`,
      sub: "drives that led to sales",
      icon: CalendarCheck,
      iconClass: "bg-amber-400/10 text-amber-400",
      trend: null,
      trendLabel: "",
    },
    {
      label: "Active Invoices",
      value: String(kpis.paidInvoicesCount),
      sub: "paid in period",
      icon: FileText,
      iconClass: "bg-rose-400/10 text-rose-400",
      trend: null,
      trendLabel: "",
    },
  ];

  const revenueCellColors = useMemo(
    () =>
      revenueData.map((entry) =>
        entry.revenue >= entry.target ? "#D4AF37" : "rgba(251,113,133,0.7)",
      ),
    [revenueData],
  );

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6">
      {/* ── Page Header + Date Range Filter ── */}
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-y-4">
        <div>
          <h1 className="text-lg font-extrabold text-text-primary">
            Analytics
          </h1>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            Live data · {rangeInvoices.length} invoices · {rangeBookings.length}{" "}
            bookings · {rangeCustomers.length} customers in period
          </p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-2 flex-wrap gap-y-4 ">
          <div className="flex bg-card border border-border rounded-xl overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setActiveRange(r);
                  setShowCustom(false);
                }}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  activeRange === r && !showCustom
                    ? "bg-gold/10 text-gold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

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

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-shrink-0">
        {KPI_CARDS.map((card, i) => (
          <AnalyticsStatCard key={card.label} {...card} delay={i * 0.05} />
        ))}
      </div>

      {/* ── Revenue Chart ── */}

      {/* ── 2×2 Chart Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
        <SalesPerformanceChart data={brandData} />
        <InventoryStatusChart data={inventoryData} />
        <CustomerGrowthChart data={customerData} />

        {/* BUG-043 FIX: controlled tab state so it doesn't reset on re-render */}
        <TopCarsChart
          topCars={topCarsData}
          conversionData={conversionData}
          paymentData={paymentData}
          activeTab={topCarsTab}
          onTabChange={setTopCarsTab}
        />
      </div>
    </div>
  );
}

export default Analytics;
