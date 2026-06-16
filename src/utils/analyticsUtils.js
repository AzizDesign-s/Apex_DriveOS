// src/utils/analyticsUtils.js
//
// Pure computation functions for Analytics module.
// Each function accepts raw data arrays and returns chart-ready data.
// Phase 2: replace getLiveX() calls with Zustand store selectors.
// The functions themselves don't change — only their callers do.

import { calcInvoice } from "../data/mockData";

// ── Live data readers ─────────────────────────────────────────────────────────
// Same localStorage bridge pattern as all other modules.

export const getLiveCars = () => {
  try {
    const saved = localStorage.getItem("apex-gt-cars");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const getLiveCustomers = () => {
  try {
    const saved = localStorage.getItem("apex-gt-customers");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const getLiveInvoices = () => {
  try {
    const saved = localStorage.getItem("apex-gt-invoices");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const getLiveBookings = () => {
  try {
    const saved = localStorage.getItem("apex-gt-bookings");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// ── Date range filter ─────────────────────────────────────────────────────────
// Returns start date for each range option.

export const getRangeStart = (range) => {
  const now = new Date();
  switch (range) {
    case "7D": {
      const d = new Date(now);
      d.setDate(now.getDate() - 7);
      return d;
    }
    case "30D": {
      const d = new Date(now);
      d.setDate(now.getDate() - 30);
      return d;
    }
    case "90D": {
      const d = new Date(now);
      d.setDate(now.getDate() - 90);
      return d;
    }
    case "This Year": {
      return new Date(now.getFullYear(), 0, 1);
    }
    default:
      return null;
  }
};

// Filter invoices by date range
export const filterInvoicesByRange = (
  invoices,
  range,
  customFrom,
  customTo,
) => {
  if (customFrom && customTo) {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    to.setHours(23, 59, 59);
    return invoices.filter((inv) => {
      if (!inv.issuedDate) return false;
      const d = new Date(inv.issuedDate);
      return d >= from && d <= to;
    });
  }

  const start = getRangeStart(range);
  if (!start) return invoices;

  return invoices.filter((inv) => {
    if (!inv.issuedDate) return false;
    return new Date(inv.issuedDate) >= start;
  });
};

// Filter bookings by date range
export const filterBookingsByRange = (
  bookings,
  range,
  customFrom,
  customTo,
) => {
  if (customFrom && customTo) {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    to.setHours(23, 59, 59);
    return bookings.filter((b) => {
      if (!b.date) return false;
      const d = new Date(b.date);
      return d >= from && d <= to;
    });
  }

  const start = getRangeStart(range);
  if (!start) return bookings;

  return bookings.filter((b) => {
    if (!b.date) return false;
    return new Date(b.date) >= start;
  });
};

// Filter customers by date range
export const filterCustomersByRange = (
  customers,
  range,
  customFrom,
  customTo,
) => {
  if (customFrom && customTo) {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    to.setHours(23, 59, 59);
    return customers.filter((c) => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d >= from && d <= to;
    });
  }

  const start = getRangeStart(range);
  if (!start) return customers;

  return customers.filter((c) => {
    if (!c.createdAt) return false;
    return new Date(c.createdAt) >= start;
  });
};

// ── BUG-041 FIX: Monthly Revenue ─────────────────────────────────────────────
// Groups invoices by month and calculates revenue per month.
// BUG-041 was that the range filter only changed activeRange state
// but charts still used hardcoded MONTHLY_REVENUE — this derives from real invoices.

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

export const computeMonthlyRevenue = (invoices) => {
  const monthlyRevenue = Array(12).fill(0);
  const monthlyTarget = [
    1000000, 1000000, 1200000, 1200000, 1500000, 1500000, 1800000, 1800000,
    2000000, 2000000, 2200000, 2200000,
  ];

  invoices.forEach((inv) => {
    if (!inv.issuedDate) return;
    const month = new Date(inv.issuedDate).getMonth();
    const { total } = calcInvoice(
      inv.items || [],
      inv.discount || 0,
      inv.vatRate || 5,
    );
    monthlyRevenue[month] += total;
  });

  // Only return months that have activity or are in the past
  const currentMonth = new Date().getMonth();
  return MONTH_LABELS.map((month, i) => ({
    month,
    revenue: monthlyRevenue[i],
    target: monthlyTarget[i],
  })).filter((_, i) => i <= currentMonth || monthlyRevenue[i] > 0);
};

// ── BUG-040 FIX: Sales by Brand ──────────────────────────────────────────────
// Derives from sold cars (status === 'sold') and paid invoices.

const BRAND_COLORS = {
  Mercedes: "#D4AF37",
  BMW: "#38BDF8",
  "Rolls Royce": "#A78BFA",
  Ferrari: "#FB7185",
  Lamborghini: "#FBBF24",
  Porsche: "#10B981",
};

const getBrandColor = (brand, index) => {
  // Try exact match first
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (brand.toLowerCase().includes(key.toLowerCase())) return color;
  }
  // Fallback palette
  const fallback = [
    "#D4AF37",
    "#38BDF8",
    "#A78BFA",
    "#FB7185",
    "#FBBF24",
    "#10B981",
  ];
  return fallback[index % fallback.length];
};

export const computeSalesByBrand = (invoices, cars) => {
  const brandMap = {};

  // Count from invoices (most accurate — reflects actual sales)
  invoices
    .filter((inv) => inv.status === "paid" && inv.carName)
    .forEach((inv) => {
      // Extract brand from car name
      const brandMatch = cars.find((c) => c.id === Number(inv.carId));
      const brand = brandMatch?.brand || inv.carName.split(" ")[0];

      if (!brandMap[brand]) {
        brandMap[brand] = { brand, sales: 0, revenue: 0 };
      }
      brandMap[brand].sales += 1;
      const { total } = calcInvoice(
        inv.items || [],
        inv.discount || 0,
        inv.vatRate || 5,
      );
      brandMap[brand].revenue += total;
    });

  // Also count from cars marked as sold (catches sales without invoices)
  cars
    .filter((c) => c.status === "sold")
    .forEach((car) => {
      if (!brandMap[car.brand]) {
        brandMap[car.brand] = { brand: car.brand, sales: 0, revenue: 0 };
      }
      // Only add if not already counted via invoice
      const alreadyCounted = invoices.some(
        (inv) => inv.status === "paid" && inv.carId === car.id,
      );
      if (!alreadyCounted) {
        brandMap[car.brand].sales += 1;
        brandMap[car.brand].revenue += car.price || 0;
      }
    });

  return Object.values(brandMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)
    .map((item, i) => ({
      ...item,
      color: getBrandColor(item.brand, i),
    }));
};

// ── BUG-040 FIX: Customer Growth ─────────────────────────────────────────────
// Groups customers by month of createdAt.

export const computeCustomerGrowth = (customers) => {
  const monthlyNew = Array(12).fill(0);
  const monthlyReturning = Array(12).fill(0);

  customers.forEach((c) => {
    if (!c.createdAt) return;
    const month = new Date(c.createdAt).getMonth();
    if (c.purchases?.length > 0) {
      monthlyReturning[month] += 1;
    } else {
      monthlyNew[month] += 1;
    }
  });

  const currentMonth = new Date().getMonth();
  let runningTotal = 0;

  return MONTH_LABELS.map((month, i) => {
    runningTotal += monthlyNew[i] + monthlyReturning[i];
    return {
      month,
      total: runningTotal,
      new: monthlyNew[i],
      returning: monthlyReturning[i],
    };
  }).filter((_, i) => i <= currentMonth);
};

// ── BUG-040 FIX: Inventory Status ────────────────────────────────────────────
// Derived directly from live cars array.

export const computeInventoryStatus = (cars) =>
  [
    {
      name: "Available",
      value: cars.filter((c) => c.status === "available").length,
      color: "#10B981",
    },
    {
      name: "Reserved",
      value: cars.filter((c) => c.status === "reserved").length,
      color: "#38BDF8",
    },
    {
      name: "Sold",
      value: cars.filter((c) => c.status === "sold").length,
      color: "#D4AF37",
    },
    {
      name: "Maintenance",
      value: cars.filter((c) => c.status === "maintenance").length,
      color: "#FB7185",
    },
  ].filter((d) => d.value > 0);

// ── BUG-040 FIX: Top Cars ────────────────────────────────────────────────────
// Derived from paid invoices + sold cars.

export const computeTopCars = (invoices, cars) => {
  const carMap = {};

  invoices
    .filter((inv) => inv.status === "paid" && inv.carName)
    .forEach((inv) => {
      const key = inv.carName;
      if (!carMap[key]) {
        carMap[key] = {
          model: inv.carName,
          brand: cars.find((c) => c.id === Number(inv.carId))?.brand || "",
          sold: 0,
          revenue: 0,
        };
      }
      carMap[key].sold += 1;
      const { total } = calcInvoice(
        inv.items || [],
        inv.discount || 0,
        inv.vatRate || 5,
      );
      carMap[key].revenue += total;
    });

  return Object.values(carMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

// ── BUG-040 FIX: Test Drive Conversion ───────────────────────────────────────
// Groups bookings by month, calculates conversion to sale.

export const computeTestDriveConversion = (bookings, invoices) => {
  const monthlyDrives = Array(12).fill(0);
  const monthlyConverted = Array(12).fill(0);

  bookings.forEach((b) => {
    if (!b.date) return;
    const month = new Date(b.date).getMonth();
    monthlyDrives[month] += 1;

    // Converted = customer who test-drove also has a paid invoice for same car
    const hasInvoice = invoices.some(
      (inv) =>
        inv.status === "paid" &&
        inv.customerId === b.customerId &&
        inv.carId === b.carId,
    );
    if (hasInvoice) monthlyConverted[month] += 1;
  });

  const currentMonth = new Date().getMonth();
  return MONTH_LABELS.map((month, i) => ({
    month,
    drives: monthlyDrives[i],
    converted: monthlyConverted[i],
  })).filter((_, i) => i <= currentMonth && monthlyDrives[i] > 0);
};

// ── BUG-040 FIX: Payment Method Breakdown ────────────────────────────────────

const PAYMENT_COLORS = {
  Cash: "#D4AF37",
  "Bank Transfer": "#38BDF8",
  Card: "#10B981",
  Cheque: "#A78BFA",
};

export const computePaymentMethods = (invoices) => {
  const methodMap = {};

  invoices
    .filter((inv) => inv.status === "paid" && inv.method)
    .forEach((inv) => {
      if (!methodMap[inv.method]) {
        methodMap[inv.method] = { method: inv.method, count: 0, revenue: 0 };
      }
      methodMap[inv.method].count += 1;
      const { total } = calcInvoice(
        inv.items || [],
        inv.discount || 0,
        inv.vatRate || 5,
      );
      methodMap[inv.method].revenue += total;
    });

  return Object.values(methodMap).map((item) => ({
    ...item,
    color: PAYMENT_COLORS[item.method] || "#D4AF37",
  }));
};

// ── BUG-042 FIX: Real KPI computations ───────────────────────────────────────

export const computeAnalyticsKPIs = (
  cars,
  customers,
  invoices,
  bookings,
  prevInvoices,
  prevCustomers,
) => {
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((sum, inv) => {
    const { total } = calcInvoice(
      inv.items || [],
      inv.discount || 0,
      inv.vatRate || 5,
    );
    return sum + total;
  }, 0);

  const prevRevenue = prevInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, inv) => {
      const { total } = calcInvoice(
        inv.items || [],
        inv.discount || 0,
        inv.vatRate || 5,
      );
      return sum + total;
    }, 0);

  const soldCars = cars.filter((c) => c.status === "sold").length;
  const totalCustomers = customers.length;
  const prevCustCount = prevCustomers.length;

  const totalDrives = bookings.length;
  const converted = bookings.filter((b) =>
    invoices.some(
      (inv) =>
        inv.status === "paid" &&
        inv.customerId === b.customerId &&
        inv.carId === b.carId,
    ),
  ).length;
  const convRate =
    totalDrives > 0 ? Math.round((converted / totalDrives) * 100) : 0;

  const avgOrder =
    paidInvoices.length > 0
      ? Math.round(totalRevenue / paidInvoices.length)
      : 0;

  // BUG-042 FIX: real trend percentages — compare current vs previous period
  const revTrend =
    prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;

  const custTrend =
    prevCustCount > 0
      ? Math.round(((totalCustomers - prevCustCount) / prevCustCount) * 100)
      : 0;

  return {
    totalRevenue,
    paidInvoicesCount: paidInvoices.length,
    soldCars,
    totalCars: cars.length,
    totalCustomers,
    convRate,
    avgOrder,
    revTrend,
    custTrend,
  };
};
