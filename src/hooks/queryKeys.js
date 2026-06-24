// src/hooks/queryKeys.js
//
// Centralized TanStack Query cache key factory.
//
// WHY this matters — the problem it solves:
// TanStack Query uses "keys" to identify cached data, like labels on boxes.
// When you fetch vehicles, the cache stores the result under a key.
// When you add a new vehicle, you need to tell React Query "invalidate the
// vehicles cache" so the list refetches and shows the new vehicle.
//
// WITHOUT a key factory, you'd write strings like:
//   useQuery({ queryKey: ['vehicles', 'list'] })
//   queryClient.invalidateQueries({ queryKey: ['vehicles', 'list'] })
//
// The problem: if you typo 'vehicle' vs 'vehicles' in one place, the
// invalidation silently fails — the list doesn't update after mutations
// and you spend hours debugging why.
//
// WITH a key factory:
//   useQuery({ queryKey: vehicleKeys.list(filters) })
//   queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
//
// One typo is impossible — it's a function call, not a string.
// Also gives you precise control: invalidate just the list, or just one
// vehicle's detail, or everything vehicle-related at once.
//
// STRUCTURE per module:
//   .all        — parent key, invalidating this invalidates EVERYTHING
//                 in that module (use after deleting a record)
//   .lists()    — all list queries (any filter combination)
//   .list(f)    — a specific filtered list
//   .details()  — all detail queries
//   .detail(id) — one specific record's detail

export const vehicleKeys = {
  all: ["vehicles"],
  lists: () => [...vehicleKeys.all, "list"],
  list: (filters) => [...vehicleKeys.lists(), { filters }],
  details: () => [...vehicleKeys.all, "detail"],
  detail: (id) => [...vehicleKeys.details(), id],
  stats: () => [...vehicleKeys.all, "stats"],
};

export const customerKeys = {
  all: ["customers"],
  lists: () => [...customerKeys.all, "list"],
  list: (filters) => [...customerKeys.lists(), { filters }],
  details: () => [...customerKeys.all, "detail"],
  detail: (id) => [...customerKeys.details(), id],
  stats: () => [...customerKeys.all, "stats"],
};

export const testDriveKeys = {
  all: ["testDrives"],
  lists: () => [...testDriveKeys.all, "list"],
  list: (filters) => [...testDriveKeys.lists(), { filters }],
  details: () => [...testDriveKeys.all, "detail"],
  detail: (id) => [...testDriveKeys.details(), id],
  stats: () => [...testDriveKeys.all, "stats"],
};

export const invoiceKeys = {
  all: ["invoices"],
  lists: () => [...invoiceKeys.all, "list"],
  list: (filters) => [...invoiceKeys.lists(), { filters }],
  details: () => [...invoiceKeys.all, "detail"],
  detail: (id) => [...invoiceKeys.details(), id],
  stats: () => [...invoiceKeys.all, "stats"],
};

export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
};

export const roleKeys = {
  all: ["roles"],
  lists: () => [...roleKeys.all, "list"],
  list: (filters) => [...roleKeys.lists(), { filters }],
  details: () => [...roleKeys.all, "detail"],
  detail: (id) => [...roleKeys.details(), id],
};

export const notificationKeys = {
  all: ["notifications"],
  lists: () => [...notificationKeys.all, "list"],
  list: (filters) => [...notificationKeys.lists(), { filters }],
  unread: () => [...notificationKeys.all, "unread"],
};

export const settingsKeys = {
  all: ["settings"],
  company: () => [...settingsKeys.all, "company"],
  invoice: () => [...settingsKeys.all, "invoice"],
  appearance: () => [...settingsKeys.all, "appearance"],
};

export const dashboardKeys = {
  all: ["dashboard"],
  kpis: () => [...dashboardKeys.all, "kpis"],
  alerts: () => [...dashboardKeys.all, "alerts"],
  activity: () => [...dashboardKeys.all, "activity"],
};

export const activityKeys = {
  all: ["activity"],
  lists: () => [...activityKeys.all, "list"],
  list: (filters) => [...activityKeys.lists(), { filters }],
};
