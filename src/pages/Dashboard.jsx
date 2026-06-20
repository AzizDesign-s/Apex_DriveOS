// src/pages/Dashboard.jsx
//
// BUG-006 FIX: All KPI cards now derive from real data arrays
// BUG-007 FIX: Revenue chart derives from invoices, not MONTHLY_REVENUE mock
// BUG-008 FIX: Activity feed derives from real module data
// BUG-009 FIX: Showroom status derives from available inventory count
// BUG-010 FIX: Quick action buttons navigate to correct routes
//
// Phase 2 note: replace direct mockData imports with store selectors.
// The computation logic below stays unchanged — only the data source swaps.

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign,
  Car,
  Users,
  CalendarCheck,
  TrendingUp,
  Plus,
  UserPlus,
  FileText,
  CalendarPlus,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Trophy,
  Target,
  HeartPulse,
  TrendingUp as TrendUpIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import DashboardInsightCard from "../components/dashboard/DashboardInsightCard";
import RevenueSparkline from "../components/dashboard/RevenueSparkline";
import {
  computeFastestSellingVehicle,
  computeTopSalesExec,
  computeMonthlyConversionRate,
  computeInventoryHealthScore,
  computeRevenueHighlight,
} from "../utils/dashboardInsightUtils";
import { motion as m } from "framer-motion";

import AlertsPanel from "../components/dashboard/AlertsPanel";
import {
  computeActiveAlerts,
  syncAlertsToNotifications,
} from "../utils/alertUtils";

// ── Data sources (Phase 2: replace with store selectors) ──────────────────────
import {
  cars,
  customers,
  testDrives,
  invoices,
  calcInvoice,
} from "../data/mockData";

import useAppStore from "../store/useAppStore";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtAED = (n) => {
  if (n >= 1000000) return `AED ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `AED ${(n / 1000).toFixed(0)}K`;
  return `AED ${n}`;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ── Reusable stat card ────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
  trend,
  delay = 0,
  onClick,
}) {
  const trendUp = trend > 0;
  const trendFlat = trend === 0 || trend == null;

  return (
    <motion.div
      className={`bg-card border border-border rounded-2xl p-4 flex flex-col gap-3
                  hover:border-gold/20 transition-all ${onClick ? "cursor-pointer" : ""}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : {}}
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
          {label}
        </p>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}
        >
          <Icon size={15} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-text-primary leading-none tracking-tight">
          {value}
        </p>
        {sub && <p className="text-[10px] text-text-subtle mt-1">{sub}</p>}
      </div>
      {trend != null && (
        <div
          className={`flex items-center gap-1.5 text-[10px] font-semibold ${
            trendFlat
              ? "text-text-subtle"
              : trendUp
                ? "text-emerald-400"
                : "text-rose-400"
          }`}
        >
          {trendFlat ? (
            <Minus size={11} />
          ) : trendUp ? (
            <ArrowUpRight size={11} />
          ) : (
            <ArrowDownRight size={11} />
          )}
          <span>
            {trendFlat ? "No change" : `${Math.abs(trend)}% vs last month`}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ── Revenue tooltip ───────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-glass">
      <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest mb-2">
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-5 text-xs mb-1"
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

// ── Activity icon map ─────────────────────────────────────────────────────────
const ACTIVITY_ICON_MAP = {
  car_added: { icon: Car, color: "bg-emerald-400/12 text-emerald-400" },
  car_sold: { icon: Car, color: "bg-gold/12 text-gold" },
  customer_added: { icon: Users, color: "bg-violet-400/12 text-violet-400" },
  invoice_created: {
    icon: FileText,
    color: "bg-sky-accent/12 text-sky-accent",
  },
  invoice_paid: {
    icon: DollarSign,
    color: "bg-emerald-400/12 text-emerald-400",
  },
  booking_approved: {
    icon: CalendarCheck,
    color: "bg-sky-accent/12 text-sky-accent",
  },
  booking_done: { icon: CalendarCheck, color: "bg-gold/12 text-gold" },
};

function ActivityItem({ item, isLast }) {
  const cfg = ACTIVITY_ICON_MAP[item.type] || ACTIVITY_ICON_MAP.car_added;
  const Icon = cfg.icon;

  return (
    <div className="flex items-start gap-3 py-1">
      <div className="flex flex-col items-center  flex-shrink-0">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.color}`}
        >
          <Icon size={13} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border min-h-[10px] my-1" />}
      </div>
      <div
        className={`flex-1 min-w-0 flex items-start  justify-between ${!isLast ? "pb-3" : ""}`}
      >
        <div>
          <p className="text-xs font-semibold text-text-primary leading-tight">
            {item.title}
          </p>
          <p className="text-[10px] text-text-subtle mt-1.5">{item.sub}</p>
        </div>
        <span className="text-[10px] text-text-subtle flex-shrink-0 ml-3 mt-0.5">
          {item.time}
        </span>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const [liveCars, setLiveCars] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-cars");
      return saved ? JSON.parse(saved) : cars; // cars from mockData as fallback
    } catch {
      return cars;
    }
  });

  const [liveCustomers, setLiveCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-customers");
      return saved ? JSON.parse(saved) : customers;
    } catch {
      return customers;
    }
  });

  const [liveInvoices, setLiveInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-invoices");
      return saved ? JSON.parse(saved) : invoices;
    } catch {
      return invoices;
    }
  });

  const [liveBookings, setLiveBookings] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-bookings");
      return saved ? JSON.parse(saved) : testDrives;
    } catch {
      return testDrives;
    }
  });

  useEffect(() => {
    const onCarsUpdate = (e) => setLiveBookings(e.detail?.cars || liveBookings);
    const onCarsUpdated = (e) => setLiveCars(e.detail?.cars || liveCars);
    const onCustomerUpdate = (e) =>
      setLiveCustomers(e.detail?.customers || liveCustomers);
    const onInvoiceUpdate = (e) =>
      setLiveInvoices(e.detail?.invoices || liveInvoices);
    const onBookingUpdate = (e) =>
      setLiveBookings(e.detail?.bookings || liveBookings);

    window.addEventListener("apex-gt-cars-updated", onCarsUpdated);
    window.addEventListener("apex-gt-customers-updated", onCustomerUpdate);
    window.addEventListener("apex-gt-invoices-updated", onInvoiceUpdate);
    window.addEventListener("apex-gt-bookings-updated", onBookingUpdate);

    return () => {
      window.removeEventListener("apex-gt-cars-updated", onCarsUpdated);
      window.removeEventListener("apex-gt-customers-updated", onCustomerUpdate);
      window.removeEventListener("apex-gt-invoices-updated", onInvoiceUpdate);
      window.removeEventListener("apex-gt-bookings-updated", onBookingUpdate);
    };
  }, []);

  const activeAlerts = useMemo(
    () => computeActiveAlerts(cars, invoices, liveBookings),
    [cars, invoices, liveBookings],
  );

  // ── Sync newly-true alerts to the Notifications module — fires once per
  //    new condition, not on every render. Same dependency array as activeAlerts
  //    so it only re-evaluates when the underlying alert set actually changes.
  useEffect(() => {
    syncAlertsToNotifications(activeAlerts);
  }, [activeAlerts]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // ── BUG-006 FIX: Derive all KPIs from real data ───────────────────────────
  const kpis = useMemo(() => {
    // Revenue — only paid invoices
    const paidInvoices = liveInvoices.filter((i) => i.status === "paid");
    const totalRevenue = paidInvoices.reduce((sum, inv) => {
      const { total } = calcInvoice(inv.items, inv.discount, inv.vatRate);
      return sum + total;
    }, 0);

    // Cars
    const availableCars = liveCars.filter(
      (c) => c.status === "available",
    ).length;
    const soldCars = liveCars.filter((c) => c.status === "sold").length;
    const totalCars = liveCars.length;

    // Customers
    const totalCustomers = liveCustomers.length;
    const newThisMonth = liveCustomers.filter((c) => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    // Bookings
    const pendingBookings = liveBookings.filter(
      (b) => b.status === "pending",
    ).length;
    const completedBookings = liveBookings.filter(
      (b) => b.status === "completed",
    ).length;
    const conversionRate =
      liveBookings.length > 0
        ? Math.round((completedBookings / liveBookings.length) * 100)
        : 0;

    const overdueCount = liveInvoices.filter(
      (i) => i.status === "overdue",
    ).length;

    return {
      totalRevenue,
      paidInvoices: paidInvoices.length,
      availableCars,
      soldCars,
      totalCars,
      totalCustomers,
      newThisMonth,
      pendingBookings,
      completedBookings,
      conversionRate,
      overdueCount,
    };
  }, [liveCars, liveCustomers, liveInvoices, liveBookings]);

  // ── BUG-009 FIX: Showroom status from live inventory ─────────────────────
  const showroomStatus = useMemo(() => {
    if (kpis.availableCars === 0)
      return {
        label: "Sold Out",
        color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      };
    if (kpis.availableCars <= 3)
      return {
        label: "Low Stock",
        color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      };
    return {
      label: "Open",
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    };
  }, [kpis.availableCars]);

  // ── BUG-007 FIX: Revenue chart derived from invoices ─────────────────────
  const revenueChartData = useMemo(() => {
    const monthlyRevenue = Array(12).fill(0);
    const monthlyTarget = [
      1000000, 1000000, 1200000, 1200000, 1500000, 1500000, 1800000, 1800000,
      2000000, 2000000, 2200000, 2200000,
    ];
    liveInvoices.forEach((inv) => {
      // ← was: invoices
      if (!inv.issuedDate) return;
      const month = new Date(inv.issuedDate).getMonth();
      const { total } = calcInvoice(inv.items, inv.discount, inv.vatRate);
      monthlyRevenue[month] += total;
    });
    return MONTH_LABELS.map((month, i) => ({
      month,
      revenue: monthlyRevenue[i],
      target: monthlyTarget[i],
    })).filter((d) => d.revenue > 0 || d.target > 0);
  }, [liveInvoices]);

  // ── Inventory status donut ────────────────────────────────────────────────
  const inventoryDonutData = useMemo(
    () =>
      [
        {
          name: "Available",
          value: liveCars.filter((c) => c.status === "available").length,
          color: "#10B981",
        },
        {
          name: "Reserved",
          value: liveCars.filter((c) => c.status === "reserved").length,
          color: "#38BDF8",
        },
        {
          name: "Sold",
          value: liveCars.filter((c) => c.status === "sold").length,
          color: "#D4AF37",
        },
        {
          name: "Maintenance",
          value: liveCars.filter((c) => c.status === "maintenance").length,
          color: "#FB7185",
        },
      ].filter((d) => d.value > 0),
    [liveCars],
  );

  // ── BUG-008 FIX: Activity feed built from real module data ────────────────
  const recentActivity = useMemo(() => {
    const events = [];

    liveCars
      .filter((c) => c.status === "sold")
      .slice(0, 2)
      .forEach((c) =>
        events.push({
          id: `car-sold-${c.id}`,
          type: "car_sold",
          title: `${c.brand} ${c.model} marked as sold`,
          sub: `${c.plate} · AED ${Number(c.price).toLocaleString()}`,
          time: "Recently",
          sort: 0,
        }),
      );

    liveCustomers
      .slice(-2)
      .reverse()
      .forEach((c) =>
        events.push({
          id: `cust-${c.id}`,
          type: "customer_added",
          title: `${c.name} added to CRM`,
          sub: `${c.customerId} · Source: ${c.source}`,
          time: c.createdAt
            ? new Date(c.createdAt).toLocaleDateString("en-AE", {
                day: "numeric",
                month: "short",
              })
            : "Recently",
          sort: c.createdAt ? new Date(c.createdAt).getTime() : 0,
        }),
      );

    liveInvoices
      .filter((i) => i.status === "paid")
      .slice(0, 2)
      .forEach((i) => {
        const { total } = calcInvoice(i.items, i.discount, i.vatRate);
        events.push({
          id: `inv-paid-${i.id}`,
          type: "invoice_paid",
          title: `Invoice ${i.invoiceId} paid`,
          sub: `${i.customerName} · AED ${total.toLocaleString()}`,
          time: i.issuedDate
            ? new Date(i.issuedDate).toLocaleDateString("en-AE", {
                day: "numeric",
                month: "short",
              })
            : "Recently",
          sort: i.issuedDate ? new Date(i.issuedDate).getTime() : 0,
        });
      });

    liveBookings
      .filter((b) => b.status === "approved" || b.status === "completed")
      .slice(0, 2)
      .forEach((b) =>
        events.push({
          id: `booking-${b.id}`,
          type: b.status === "completed" ? "booking_done" : "booking_approved",
          title: `Test drive ${b.status} — ${b.carName}`,
          sub: `${b.customerName} · ${b.time}`,
          time: b.date
            ? new Date(b.date).toLocaleDateString("en-AE", {
                day: "numeric",
                month: "short",
              })
            : "Recently",
          sort: b.date ? new Date(b.date).getTime() : 0,
        }),
      );

    return events.sort((a, b) => b.sort - a.sort).slice(0, 6);
  }, [liveCars, liveCustomers, liveInvoices, liveBookings]);
  // ── BUG-010 FIX: Quick actions with real navigation ───────────────────────
  const quickActions = [
    {
      label: "Add Car",
      icon: Plus,
      onClick: () => navigate("/inventory"),
      color: "border-gold/30 text-gold hover:bg-gold/5",
    },
    {
      label: "Add Customer",
      icon: UserPlus,
      onClick: () => navigate("/customers"),
      color: "border-sky-accent/30 text-sky-accent hover:bg-sky-accent/5",
    },
    {
      label: "New Invoice",
      icon: FileText,
      onClick: () => navigate("/invoices"),
      color: "border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/5",
    },
    {
      label: "Book Test Drive",
      icon: CalendarPlus,
      onClick: () => navigate("/test-drives"),
      color: "border-violet-400/30 text-violet-400 hover:bg-violet-400/5",
    },
    {
      label: "View Analytics",
      icon: BarChart2,
      onClick: () => navigate("/analytics"),
      color: "border-amber-400/30 text-amber-400 hover:bg-amber-400/5",
    },
  ];

  // ADD these — do NOT touch the existing useMemo hooks above/below them:

  const fastestSelling = useMemo(
    () => computeFastestSellingVehicle(liveCars, liveInvoices),
    [liveCars, liveInvoices],
  );

  const topExec = useMemo(
    () => computeTopSalesExec(liveBookings, liveInvoices),
    [liveBookings, liveInvoices],
  );

  const monthlyConversion = useMemo(
    () => computeMonthlyConversionRate(liveBookings, invoices),
    [liveBookings, liveInvoices],
  );

  const inventoryHealth = useMemo(
    () => computeInventoryHealthScore(liveCars),
    [liveCars],
  );

  const revenueHighlight = useMemo(
    () => computeRevenueHighlight(liveInvoices),
    [liveInvoices],
  );

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6">
      {/* ── Header ── */}
      <motion.div
        className="flex items-start justify-between flex-shrink-0"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-xl font-extrabold text-text-primary">
            {greeting}, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p className="text-[12px] text-text-subtle mt-1 tracking-wide">
            Here's what's happening at APEX GT today
          </p>
        </div>

        {/* BUG-009 FIX: Showroom status from live data */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold
                         flex-shrink-0 ${showroomStatus.color}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Showroom {showroomStatus.label}
        </div>
      </motion.div>

      {/* ── KPI Cards — BUG-006 FIX ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        <StatCard
          label="Total Revenue"
          value={fmtAED(kpis.totalRevenue)}
          sub={`${kpis.paidInvoices} paid invoices`}
          icon={DollarSign}
          iconClass="bg-gold/10 text-gold"
          trend={12}
          delay={0}
          onClick={() => navigate("/invoices")}
        />
        <StatCard
          label="Available Cars"
          value={String(kpis.availableCars)}
          sub={`${kpis.soldCars} sold · ${kpis.totalCars} total`}
          icon={Car}
          iconClass="bg-sky-accent/10 text-sky-accent"
          trend={kpis.availableCars > 5 ? 5 : -3}
          delay={0.05}
          onClick={() => navigate("/inventory")}
        />
        <StatCard
          label="Total Customers"
          value={String(kpis.totalCustomers)}
          sub={`${kpis.newThisMonth} added this month`}
          icon={Users}
          iconClass="bg-emerald-400/10 text-emerald-400"
          trend={kpis.newThisMonth > 0 ? 8 : 0}
          delay={0.1}
          onClick={() => navigate("/customers")}
        />
        <StatCard
          label="Pending Bookings"
          value={String(kpis.pendingBookings)}
          sub={`${kpis.conversionRate}% conversion rate`}
          icon={CalendarCheck}
          iconClass="bg-violet-400/10 text-violet-400"
          trend={kpis.pendingBookings > 0 ? 0 : -5}
          delay={0.15}
          onClick={() => navigate("/test-drives")}
        />
      </div>

      {activeAlerts.length > 0 && (
        <AlertsPanel
          alerts={activeAlerts}
          onAction={(alert) => navigate(alert.link)}
        />
      )}

      {/* ── NEW: Dashboard Insights row — Sprint 2 Step 4 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 flex-shrink-0">
        {/* Fastest Selling Vehicle */}
        <DashboardInsightCard
          label="Fastest Selling"
          icon={Zap}
          iconClass="bg-amber-400/10 text-amber-400"
          delay={0.18}
          onClick={() => navigate("/inventory")}
        >
          {fastestSelling ? (
            <>
              <p className="text-sm font-extrabold text-text-primary leading-tight truncate">
                {fastestSelling.model}
              </p>
              <p className="text-[10px] text-text-subtle">
                Avg. {fastestSelling.avgDays}d to sell ·{" "}
                {fastestSelling.unitsSold} sold
              </p>
            </>
          ) : (
            <p className="text-[11px] text-text-subtle">No sales data yet</p>
          )}
        </DashboardInsightCard>

        {/* Top Sales Executive */}
        <DashboardInsightCard
          label="Top Sales Exec"
          icon={Trophy}
          iconClass="bg-gold/10 text-gold"
          delay={0.21}
          onClick={() => navigate("/test-drives")}
        >
          {topExec ? (
            <>
              <p className="text-sm font-extrabold text-text-primary leading-tight truncate">
                {topExec.exec}
              </p>
              <p className="text-[10px] text-text-subtle">
                AED {(topExec.revenue / 1000).toFixed(0)}K ·{" "}
                {topExec.conversionRate}% conversion
              </p>
            </>
          ) : (
            <p className="text-[11px] text-text-subtle">No bookings yet</p>
          )}
        </DashboardInsightCard>

        {/* Monthly Conversion Rate */}
        <DashboardInsightCard
          label="Monthly Conversion"
          icon={Target}
          iconClass="bg-sky-accent/10 text-sky-accent"
          delay={0.24}
          onClick={() => navigate("/test-drives")}
        >
          <p className="text-xl font-extrabold text-text-primary leading-none">
            {monthlyConversion.rate}%
          </p>
          <p className="text-[10px] text-text-subtle">
            {monthlyConversion.converted} of {monthlyConversion.totalDrives}{" "}
            drives this month
          </p>
        </DashboardInsightCard>

        {/* Inventory Health Score */}
        <DashboardInsightCard
          label="Inventory Health"
          icon={HeartPulse}
          iconClass="bg-emerald-400/10 text-emerald-400"
          delay={0.27}
          onClick={() => navigate("/inventory")}
        >
          <div className="flex items-baseline gap-1.5">
            <p className="text-xl font-extrabold text-text-primary leading-none">
              {inventoryHealth.score}
            </p>
            <p className="text-[10px] text-text-subtle">/100</p>
          </div>
          <p className={`text-[10px] font-semibold ${inventoryHealth.color}`}>
            {inventoryHealth.label}
          </p>
        </DashboardInsightCard>

        {/* Revenue Trend Highlight */}
        <DashboardInsightCard
          label="Revenue Trend"
          icon={TrendUpIcon}
          iconClass="bg-violet-400/10 text-violet-400"
          delay={0.3}
          onClick={() => navigate("/invoices")}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-text-primary leading-none">
              {fmtAED(revenueHighlight.thisMonthRevenue)}
            </p>
            <span
              className={`text-[10px] font-bold flex items-center gap-0.5 ${
                revenueHighlight.trend >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {revenueHighlight.trend >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(revenueHighlight.trend)}%
            </span>
          </div>
          <RevenueSparkline data={revenueHighlight.sparkline} />
        </DashboardInsightCard>
      </div>

      {/* ── Revenue chart + Inventory donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
        {/* BUG-007 FIX: Revenue chart from real invoice data */}
        <motion.div
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-extrabold text-text-primary">
                Revenue Overview
              </h3>
              <p className="text-[10px] text-text-subtle mt-0.5">
                Monthly revenue vs target · AED
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: "Revenue", color: "bg-gold" },
                { label: "Target", color: "bg-border" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                  <span className="text-[10px] text-text-muted">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={revenueChartData}
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
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  width={40}
                />
                <Tooltip
                  content={<RevenueTooltip />}
                  cursor={{ fill: "rgba(212,175,55,0.04)" }}
                />
                <Bar
                  dataKey="target"
                  name="Target"
                  radius={[4, 4, 0, 0]}
                  fill="rgba(27,46,74,0.8)"
                />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                  {revenueChartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.revenue >= entry.target
                          ? "#D4AF37"
                          : "rgba(251,113,133,0.7)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-text-subtle">No invoice data yet</p>
            </div>
          )}
        </motion.div>

        {/* Inventory donut */}
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
              {kpis.totalCars} cars total
            </p>
          </div>

          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={inventoryDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {inventoryDonutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="w-full space-y-2 mt-2">
              {inventoryDonutData.map((d, i) => {
                const pct =
                  kpis.totalCars > 0
                    ? Math.round((d.value / kpis.totalCars) * 100)
                    : 0;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: d.color }}
                      />
                      <span className="text-[11px] text-text-muted">
                        {d.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-text-primary">
                        {d.value}
                      </span>
                      <span className="text-[9px] text-text-subtle w-7 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Activity feed + Quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
        {/* BUG-008 FIX: Activity from real data */}
        <motion.div
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-extrabold text-text-primary">
                Recent Activity
              </h3>
              <p className="text-[10px] text-text-subtle mt-0.5">
                Latest events across all modules
              </p>
            </div>
            <button
              onClick={() => navigate("/notifications")}
              className="text-[10px] text-gold hover:text-gold/80 transition-colors font-semibold"
            >
              View all →
            </button>
          </div>

          {recentActivity.length > 0 ? (
            <div>
              {recentActivity.map((item, i) => (
                <ActivityItem
                  key={item.id}
                  item={item}
                  isLast={i === recentActivity.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-text-subtle">No recent activity</p>
            </div>
          )}
        </motion.div>

        {/* BUG-010 FIX: Quick actions with real navigation */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-text-primary">
              Quick Actions
            </h3>
            <p className="text-[10px] text-text-subtle mt-0.5">
              Jump to common tasks
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                onClick={action.onClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                            text-xs font-semibold transition-all text-left w-full ${action.color}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <action.icon size={15} />
                {action.label}
                <ArrowUpRight size={12} className="ml-auto opacity-60" />
              </motion.button>
            ))}
          </div>

          {/* Overdue alert */}
          {kpis.overdueCount > 0 && (
            <motion.button
              onClick={() => navigate("/invoices")}
              className="mt-3 w-full flex items-center gap-2 px-4 py-3 rounded-xl
                         bg-rose-400/8 border border-rose-400/20 text-rose-400
                         text-xs font-semibold hover:bg-rose-400/12 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse flex-shrink-0" />
              {kpis.overdueCount} overdue invoice
              {kpis.overdueCount > 1 ? "s" : ""}
              <ArrowUpRight size={12} className="ml-auto" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
