// src/utils/globalSearchUtils.js
//
// Cross-module search — reads live data straight from localStorage,
// same pattern as every other module. Returns grouped, ranked results.

const getArray = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// ── Recent searches — session-only, last 5, in-memory via sessionStorage ─────
const RECENT_KEY = "apex-driveos-recent-searches";

export const getRecentSearches = () => {
  try {
    const saved = sessionStorage.getItem(RECENT_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const addRecentSearch = (query) => {
  if (!query.trim()) return;
  const existing = getRecentSearches().filter(
    (q) => q.toLowerCase() !== query.toLowerCase(),
  );
  const updated = [query, ...existing].slice(0, 5);
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    /* silent */
  }
  return updated;
};

export const clearRecentSearches = () => {
  try {
    sessionStorage.removeItem(RECENT_KEY);
  } catch {
    /* silent */
  }
};

// ── Per-entity search ──────────────────────────────────────────────────────

const searchCars = (query) => {
  const cars = getArray("apex-driveos-cars");
  const q = query.toLowerCase();
  return cars
    .filter((c) =>
      `${c.brand} ${c.model} ${c.plate} ${c.variant || ""}`
        .toLowerCase()
        .includes(q),
    )
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      entity: "vehicle",
      path: "/inventory",
      title: `${c.brand} ${c.model}`,
      subtitle: `${c.plate} · ${c.status}`,
    }));
};

const searchCustomers = (query) => {
  const customers = getArray("apex-driveos-customers");
  const q = query.toLowerCase();
  return customers
    .filter((c) =>
      `${c.name} ${c.customerId} ${c.email} ${c.mobile}`
        .toLowerCase()
        .includes(q),
    )
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      entity: "customer",
      path: "/customers",
      title: c.name,
      subtitle: `${c.customerId} · ${c.email}`,
    }));
};

const searchUsers = (query) => {
  const users = getArray("apex-driveos-users");
  const q = query.toLowerCase();
  return users
    .filter((u) =>
      `${u.fullName} ${u.employeeId} ${u.email}`.toLowerCase().includes(q),
    )
    .slice(0, 5)
    .map((u) => ({
      id: u.id,
      entity: "user",
      path: "/users",
      title: u.fullName,
      subtitle: `${u.employeeId} · ${u.email}`,
    }));
};

const searchInvoices = (query) => {
  const invoices = getArray("apex-driveos-invoices");
  const q = query.toLowerCase();
  return invoices
    .filter((i) =>
      `${i.invoiceId} ${i.customerName} ${i.carName}`.toLowerCase().includes(q),
    )
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      entity: "invoice",
      path: "/invoices",
      title: i.invoiceId,
      subtitle: `${i.customerName} · ${i.status}`,
    }));
};

const searchBookings = (query) => {
  const bookings = getArray("apex-driveos-bookings");
  const q = query.toLowerCase();
  return bookings
    .filter((b) =>
      `${b.bookingId} ${b.customerName} ${b.carName}`.toLowerCase().includes(q),
    )
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      entity: "test_drive",
      path: "/test-drives",
      title: b.bookingId,
      subtitle: `${b.customerName} · ${b.carName}`,
    }));
};

// ── Combined search — grouped by entity, ranked by entity priority ──────────
export const globalSearch = (query) => {
  if (!query || query.trim().length < 2) return { groups: [], total: 0 };

  const groups = [
    { entity: "vehicle", label: "Vehicles", results: searchCars(query) },
    { entity: "customer", label: "Customers", results: searchCustomers(query) },
    { entity: "user", label: "Users", results: searchUsers(query) },
    { entity: "invoice", label: "Invoices", results: searchInvoices(query) },
    {
      entity: "test_drive",
      label: "Test Drives",
      results: searchBookings(query),
    },
  ].filter((g) => g.results.length > 0);

  const total = groups.reduce((sum, g) => sum + g.results.length, 0);
  return { groups, total };
};
