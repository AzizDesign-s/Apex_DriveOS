// src/utils/alertUtils.js
//
// Sprint 2 Step 5 — KPI Alert Cards.
// Computes which alerts are CURRENTLY active from live store state.
// Also handles one-time notification firing per newly-true alert,
// using a localStorage-tracked "already notified" key set to prevent
// re-notifying on every Dashboard re-render while a condition stays true.

import { notify } from "./notificationUtils";

const NOTIFIED_KEY = "apex-driveos-alert-notified-keys";

// ── Compute currently active alerts ──────────────────────────────────────────
export const computeActiveAlerts = (cars, invoices, bookings) => {
  const alerts = [];

  // ── Low Inventory Alert ──
  const availableCars = cars.filter((c) => c.status === "available");
  if (
    availableCars.length <= 3 &&
    availableCars.length >= 0 &&
    cars.length > 0
  ) {
    alerts.push({
      key: "low-inventory",
      type: "inventory",
      priority: "high",
      title: "Low Inventory",
      message: `Only ${availableCars.length} car${availableCars.length !== 1 ? "s" : ""} available. Consider restocking soon.`,
      link: "/inventory",
      linkLabel: "View Inventory",
      meta: { count: availableCars.length },
    });
  }

  // ── Pending Invoice Alert ──
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  if (overdueInvoices.length > 0) {
    alerts.push({
      key: "pending-invoices",
      type: "invoice",
      priority: "high",
      title: "Pending Invoices",
      message: `${overdueInvoices.length} invoice${overdueInvoices.length !== 1 ? "s are" : " is"} overdue. Immediate follow-up recommended.`,
      link: "/invoices",
      linkLabel: "View Invoices",
      meta: { count: overdueInvoices.length },
    });
  }

  // ── High Demand Vehicle Alert ──
  // Model with 3+ test drive requests in the last 30 days, and still available.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentBookings = bookings.filter((b) => {
    if (!b.date) return false;
    return new Date(b.date) >= thirtyDaysAgo;
  });

  const demandMap = {};
  recentBookings.forEach((b) => {
    if (!b.carName) return;
    demandMap[b.carName] = (demandMap[b.carName] || 0) + 1;
  });

  const highDemandEntry = Object.entries(demandMap)
    .filter(([model, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])[0];

  if (highDemandEntry) {
    const [model, count] = highDemandEntry;
    const stillAvailable = cars.some(
      (c) => `${c.brand} ${c.model}` === model && c.status === "available",
    );
    if (stillAvailable) {
      alerts.push({
        key: `high-demand-${model}`,
        type: "inventory",
        priority: "medium",
        title: "High Demand Vehicle",
        message: `${model} had ${count} test drive requests in the last 30 days and is still available.`,
        link: "/test-drives",
        linkLabel: "View Bookings",
        meta: { model, count },
      });
    }
  }

  // ── Upcoming Test Drive Alert ──
  // Approved bookings happening today or tomorrow.
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const upcomingBookings = bookings.filter(
    (b) =>
      b.status === "approved" &&
      (b.date === todayStr || b.date === tomorrowStr),
  );

  if (upcomingBookings.length > 0) {
    const todayCount = upcomingBookings.filter(
      (b) => b.date === todayStr,
    ).length;
    alerts.push({
      key: "upcoming-test-drives",
      type: "test_drive",
      priority: "medium",
      title: "Upcoming Test Drives",
      message: `${upcomingBookings.length} approved test drive${upcomingBookings.length !== 1 ? "s" : ""} scheduled in the next 2 days${todayCount > 0 ? ` (${todayCount} today)` : ""}.`,
      link: "/test-drives",
      linkLabel: "View Schedule",
      meta: { count: upcomingBookings.length, todayCount },
    });
  }

  return alerts;
};

// ── One-time notification firing for newly-true alerts ──────────────────────
// Called from Dashboard.jsx in a useEffect — compares active alert keys
// against the "already notified" set, fires notify() only for new ones,
// and persists the updated set so refreshing the page doesn't re-fire.
export const syncAlertsToNotifications = (activeAlerts) => {
  let notifiedKeys = [];
  try {
    const saved = localStorage.getItem(NOTIFIED_KEY);
    notifiedKeys = saved ? JSON.parse(saved) : [];
  } catch {
    notifiedKeys = [];
  }

  const currentKeys = activeAlerts.map((a) => a.key);
  const newlyTrue = activeAlerts.filter((a) => !notifiedKeys.includes(a.key));

  newlyTrue.forEach((alert) => {
    notify.alertTriggered ? notify.alertTriggered(alert) : notify.add?.(alert);
  });

  // Update stored set: keep only keys that are STILL active (so if a condition
  // clears and comes back later, it notifies again), plus add the new ones.
  const updatedKeys = [...new Set([...currentKeys])];
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(updatedKeys));
  } catch {
    /* silent */
  }

  return newlyTrue;
};
