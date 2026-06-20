// src/utils/dashboardInsightUtils.js
//
// Sprint 2 Step 4 — Better Dashboard Insights.
// Pure compute functions, same pattern as analyticsUtils.js / reportUtils.js.
// Reuses computeSalesByExec from reportUtils.js — no duplicated exec logic.

import { calcInvoice } from "../data/mockData";
import { computeSalesByExec } from "./reportUtils";

// ── Fastest Selling Vehicle ──────────────────────────────────────────────────
// Shortest average gap between a car's createdAt (added to inventory)
// and the date its matching invoice was paid. Grouped by model.
export const computeFastestSellingVehicle = (cars, invoices) => {
  const paid = invoices.filter(
    (i) => i.status === "paid" && i.carId && i.issuedDate,
  );
  if (paid.length === 0) return null;

  const modelDurations = {};

  paid.forEach((inv) => {
    const car = cars.find((c) => c.id === Number(inv.carId));
    if (!car || !car.createdAt) return;

    const added = new Date(car.createdAt);
    const sold = new Date(inv.issuedDate);
    const days = Math.max(0, Math.floor((sold - added) / 86400000));

    const key = `${car.brand} ${car.model}`;
    if (!modelDurations[key])
      modelDurations[key] = { model: key, totalDays: 0, count: 0 };
    modelDurations[key].totalDays += days;
    modelDurations[key].count += 1;
  });

  const ranked = Object.values(modelDurations)
    .map((m) => ({
      model: m.model,
      avgDays: Math.round(m.totalDays / m.count),
      unitsSold: m.count,
    }))
    .sort((a, b) => a.avgDays - b.avgDays);

  return ranked[0] || null;
};

// ── Top Sales Executive ──────────────────────────────────────────────────────
// Reuses computeSalesByExec — just takes the #1 entry.
export const computeTopSalesExec = (bookings, invoices) => {
  const ranked = computeSalesByExec(bookings, invoices);
  return ranked[0] || null;
};

// ── Monthly Conversion Rate ──────────────────────────────────────────────────
// Test drives this calendar month vs how many converted to a paid invoice.
export const computeMonthlyConversionRate = (bookings, invoices) => {
  const now = new Date();
  const thisMonthBookings = bookings.filter((b) => {
    if (!b.date) return false;
    const d = new Date(b.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const converted = thisMonthBookings.filter((b) =>
    invoices.some(
      (inv) =>
        inv.status === "paid" &&
        inv.customerId === b.customerId &&
        inv.carId === b.carId,
    ),
  ).length;

  const rate =
    thisMonthBookings.length > 0
      ? Math.round((converted / thisMonthBookings.length) * 100)
      : 0;

  return { rate, totalDrives: thisMonthBookings.length, converted };
};

// ── Inventory Health Score ───────────────────────────────────────────────────
// Weighted composite: availability ratio (50%) + freshness (30%) + low-stock penalty (20%)
// Returns 0-100 score plus a qualitative label.
export const computeInventoryHealthScore = (cars) => {
  const total = cars.length;
  if (total === 0)
    return { score: 0, label: "No Data", color: "text-text-subtle" };

  const available = cars.filter((c) => c.status === "available").length;
  const availRatio = available / total;

  const now = new Date();
  const availableCars = cars.filter(
    (c) => c.status === "available" && c.createdAt,
  );
  const avgAge =
    availableCars.length > 0
      ? availableCars.reduce(
          (sum, c) =>
            sum + Math.floor((now - new Date(c.createdAt)) / 86400000),
          0,
        ) / availableCars.length
      : 0;
  // Freshness: 0 days = 100%, 90+ days = 0%
  const freshnessRatio = Math.max(0, 1 - avgAge / 90);

  // Low stock penalty: under 4 available cars triggers a penalty
  const lowStockPenalty = available <= 3 ? 0.2 : 0;

  const score = Math.round(
    availRatio * 50 + freshnessRatio * 30 + (1 - lowStockPenalty) * 20,
  );

  let label, color;
  if (score >= 80) {
    label = "Excellent";
    color = "text-emerald-400";
  } else if (score >= 60) {
    label = "Healthy";
    color = "text-sky-accent";
  } else if (score >= 40) {
    label = "Fair";
    color = "text-amber-400";
  } else {
    label = "Needs Attention";
    color = "text-rose-400";
  }

  return { score: Math.min(100, Math.max(0, score)), label, color };
};

// ── Revenue Trend Highlight ──────────────────────────────────────────────────
// Current month revenue vs previous month, plus last-6-month sparkline points.
export const computeRevenueHighlight = (invoices) => {
  const now = new Date();
  const monthly = Array(12).fill(0);

  invoices
    .filter((i) => i.status === "paid" && i.issuedDate)
    .forEach((inv) => {
      const d = new Date(inv.issuedDate);
      if (d.getFullYear() === now.getFullYear()) {
        const { total } = calcInvoice(
          inv.items || [],
          inv.discount || 0,
          inv.vatRate || 5,
        );
        monthly[d.getMonth()] += total;
      }
    });

  const currentMonth = now.getMonth();
  const thisMonthRevenue = monthly[currentMonth];
  const lastMonthRevenue = currentMonth > 0 ? monthly[currentMonth - 1] : 0;

  const trend =
    lastMonthRevenue > 0
      ? Math.round(
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
        )
      : thisMonthRevenue > 0
        ? 100
        : 0;

  // Last 6 months for sparkline, oldest to newest
  const sparkline = [];
  for (let i = 5; i >= 0; i--) {
    const idx = currentMonth - i;
    sparkline.push(idx >= 0 ? monthly[idx] : 0);
  }

  return { thisMonthRevenue, lastMonthRevenue, trend, sparkline };
};
