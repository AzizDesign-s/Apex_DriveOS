// src/utils/filterConfigs.js
//
// Describes each module's filter shape so the generic FilterChip and
// SavedFiltersDropdown components can render human-readable chips and
// save/restore filter combos without module-specific code.
//
// Shape per key:
//   type: 'multi' (array of values, e.g. status[])
//       | 'single' (one value, e.g. roleId)
//       | 'range'  (paired from/to or min/max keys)
//   label: prefix shown on the chip (e.g. "Status: Active")
//   formatValue: optional — transforms raw value into display text
//       (e.g. roleId '2' → 'Sales Executive')

export const INVENTORY_FILTER_CONFIG = {
  storageKey: "apex-gt-saved-filters-inventory",
  fields: [
    { key: "status", type: "multi", label: "Status" },
    { key: "fuel", type: "multi", label: "Fuel" },
    { key: "bodyType", type: "multi", label: "Body Type" },
    { key: "transmission", type: "multi", label: "Transmission" },
    { key: "brand", type: "single", label: "Brand" },
    {
      key: "priceMin",
      type: "range",
      label: "Min Price",
      pairWith: "priceMax",
      rangeLabel: "Price",
    },
  ],
  presets: [
    { label: "Available Only", filters: { status: ["available"] } },
    {
      label: "Low Stock Flags",
      filters: { status: ["reserved", "maintenance"] },
    },
  ],
};

export const CUSTOMER_FILTER_CONFIG = {
  storageKey: "apex-gt-saved-filters-customers",
  fields: [
    { key: "status", type: "multi", label: "Status" },
    { key: "source", type: "single", label: "Source" },
  ],
  presets: [
    { label: "VIP Only", filters: { status: ["vip"] } },
    { label: "Prospects", filters: { status: ["prospect"] } },
  ],
};

export const USER_FILTER_CONFIG = {
  storageKey: "apex-gt-saved-filters-users",
  fields: [
    { key: "status", type: "multi", label: "Status" },
    {
      key: "roleId",
      type: "single",
      label: "Role",
      formatValue: (val, ctx) =>
        ctx?.roles?.find((r) => String(r.id) === String(val))?.name || val,
    },
    { key: "department", type: "single", label: "Department" },
  ],
  presets: [
    { label: "Active Only", filters: { status: ["active"] } },
    { label: "Invited", filters: { status: ["invited"] } },
  ],
};

export const INVOICE_FILTER_CONFIG = {
  storageKey: "apex-gt-saved-filters-invoices",
  fields: [
    { key: "status", type: "multi", label: "Status" },
    { key: "method", type: "single", label: "Method" },
    {
      key: "from",
      type: "range",
      label: "From",
      pairWith: "to",
      rangeLabel: "Due Date",
    },
    {
      key: "minAmt",
      type: "range",
      label: "Min Amt",
      pairWith: "maxAmt",
      rangeLabel: "Amount",
    },
  ],
  presets: [
    { label: "Overdue Only", filters: { status: ["overdue"] } },
    {
      label: "Unpaid",
      filters: { status: ["sent", "partially_paid", "overdue"] },
    },
  ],
};

export const TESTDRIVE_FILTER_CONFIG = {
  storageKey: "apex-gt-saved-filters-testdrives",
  fields: [
    { key: "status", type: "multi", label: "Status" },
    { key: "exec", type: "single", label: "Exec" },
    {
      key: "from",
      type: "range",
      label: "From",
      pairWith: "to",
      rangeLabel: "Date",
    },
  ],
  presets: [
    { label: "Pending Approval", filters: { status: ["pending"] } },
    { label: "Upcoming", filters: { status: ["approved"] } },
  ],
};
