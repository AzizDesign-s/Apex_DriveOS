// src/utils/reportUtils.js
//
// Compute functions specific to Reports that don't exist in analyticsUtils.js.
// Reports adds new filter dimensions (Model, Sales Exec, Status) and new
// breakdowns (by-exec performance, stock aging, customer distribution).
//
// Reuses calcInvoice from mockData — same source of truth as everywhere else.

import { calcInvoice } from "../data/mockData";

// ── Additional filter dimensions ────────────────────────────────────────────

export const filterByModel = (items, model, modelKey = "carName") => {
  if (!model) return items;
  return items.filter((item) => (item[modelKey] || "").includes(model));
};

export const filterByExec = (bookings, exec) => {
  if (!exec) return bookings;
  return bookings.filter((b) => b.exec === exec);
};

export const filterByStatus = (items, statusList) => {
  if (!statusList?.length) return items;
  return items.filter((item) => statusList.includes(item.status));
};

export const filterByBrand = (items, brand, cars = []) => {
  if (!brand) return items;
  return items.filter((item) => {
    const car = cars.find((c) => c.id === Number(item.carId));
    return car?.brand === brand;
  });
};

// ── Sales Performance by Executive ──────────────────────────────────────────
// Test Drive brief: "Top Sales Executive" needs real per-exec numbers.

export const computeSalesByExec = (bookings, invoices) => {
  const execMap = {};

  bookings.forEach((b) => {
    if (!b.exec) return;
    if (!execMap[b.exec]) {
      execMap[b.exec] = {
        exec: b.exec,
        totalDrives: 0,
        converted: 0,
        revenue: 0,
      };
    }
    execMap[b.exec].totalDrives += 1;

    const matchedInvoice = invoices.find(
      (inv) =>
        inv.status === "paid" &&
        inv.customerId === b.customerId &&
        inv.carId === b.carId,
    );
    if (matchedInvoice) {
      execMap[b.exec].converted += 1;
      const { total } = calcInvoice(
        matchedInvoice.items || [],
        matchedInvoice.discount || 0,
        matchedInvoice.vatRate || 5,
      );
      execMap[b.exec].revenue += total;
    }
  });

  return Object.values(execMap)
    .map((e) => ({
      ...e,
      conversionRate:
        e.totalDrives > 0 ? Math.round((e.converted / e.totalDrives) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

// ── Stock Status / Aging Overview ───────────────────────────────────────────
// Inventory brief: "Stock Status Overview"

export const computeStockStatusOverview = (cars) => {
  const now = new Date();

  const aged = cars
    .filter((c) => c.status === "available")
    .map((c) => {
      const created = c.createdAt ? new Date(c.createdAt) : now;
      const days = Math.floor((now - created) / 86400000);
      return { ...c, daysInStock: days };
    });

  const buckets = {
    fresh: aged.filter((c) => c.daysInStock <= 30).length,
    aging: aged.filter((c) => c.daysInStock > 30 && c.daysInStock <= 90).length,
    stale: aged.filter((c) => c.daysInStock > 90).length,
  };

  const slowestMoving = [...aged]
    .sort((a, b) => b.daysInStock - a.daysInStock)
    .slice(0, 5);

  return { buckets, slowestMoving, totalAvailable: aged.length };
};

// ── Customer Distribution (by status + source) ──────────────────────────────
// Customer brief: "Customer Distribution"

export const computeCustomerDistribution = (customers) => {
  const byStatus = {};
  const bySource = {};

  customers.forEach((c) => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    bySource[c.source] = (bySource[c.source] || 0) + 1;
  });

  const STATUS_COLORS = {
    active: "#10B981",
    prospect: "#FBBF24",
    vip: "#D4AF37",
    inactive: "#94A3B8",
    blacklisted: "#FB7185",
  };
  const SOURCE_COLORS = [
    "#D4AF37",
    "#38BDF8",
    "#A78BFA",
    "#10B981",
    "#FB7185",
    "#FBBF24",
    "#94A3B8",
  ];

  return {
    byStatus: Object.entries(byStatus).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || "#94A3B8",
    })),
    bySource: Object.entries(bySource).map(([name, value], i) => ({
      name,
      value,
      color: SOURCE_COLORS[i % SOURCE_COLORS.length],
    })),
  };
};

// ── Most Requested Vehicles (Test Drive brief) ──────────────────────────────

export const computeMostRequestedVehicles = (bookings) => {
  const carMap = {};
  bookings.forEach((b) => {
    if (!b.carName) return;
    carMap[b.carName] = (carMap[b.carName] || 0) + 1;
  });
  return Object.entries(carMap)
    .map(([model, requests]) => ({ model, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5);
};

// ── Revenue by Model (Sales brief — more granular than by-brand) ───────────

export const computeRevenueByModel = (invoices) => {
  const modelMap = {};
  invoices
    .filter((inv) => inv.status === "paid" && inv.carName)
    .forEach((inv) => {
      if (!modelMap[inv.carName])
        modelMap[inv.carName] = { model: inv.carName, units: 0, revenue: 0 };
      modelMap[inv.carName].units += 1;
      const { total } = calcInvoice(
        inv.items || [],
        inv.discount || 0,
        inv.vatRate || 5,
      );
      modelMap[inv.carName].revenue += total;
    });
  return Object.values(modelMap).sort((a, b) => b.revenue - a.revenue);
};

// ── Unique value extractors for filter dropdowns ────────────────────────────

export const getUniqueBrands = (cars) =>
  [...new Set(cars.map((c) => c.brand))].sort();
export const getUniqueModels = (cars, brand = null) => {
  const filtered = brand ? cars.filter((c) => c.brand === brand) : cars;
  return [...new Set(filtered.map((c) => c.model))].sort();
};
export const getUniqueExecs = (bookings) =>
  [...new Set(bookings.map((b) => b.exec).filter(Boolean))].sort();
