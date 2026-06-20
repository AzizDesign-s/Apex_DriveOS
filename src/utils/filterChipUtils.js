// src/utils/filterChipUtils.js
//
// Pure functions that turn { activeFilters, config } into a list of
// renderable chip objects. Used by FilterChipRow for ALL 5 modules.

export const buildFilterChips = (activeFilters, config, ctx = {}) => {
  const chips = [];

  config.fields.forEach((field) => {
    const value = activeFilters[field.key];

    if (field.type === "multi") {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => {
          chips.push({
            id: `${field.key}:${v}`,
            label: `${field.label}: ${formatLabel(v, field, ctx)}`,
            onRemove: () => ({
              ...activeFilters,
              [field.key]: value.filter((x) => x !== v),
            }),
          });
        });
      }
    }

    if (field.type === "single") {
      if (value) {
        chips.push({
          id: `${field.key}`,
          label: `${field.label}: ${formatLabel(value, field, ctx)}`,
          onRemove: () => ({ ...activeFilters, [field.key]: "" }),
        });
      }
    }

    if (field.type === "range") {
      const from = activeFilters[field.key];
      const to = activeFilters[field.pairWith];
      if (from || to) {
        const label =
          from && to
            ? `${field.rangeLabel}: ${from} – ${to}`
            : from
              ? `${field.rangeLabel}: from ${from}`
              : `${field.rangeLabel}: up to ${to}`;
        chips.push({
          id: `${field.key}-range`,
          label,
          onRemove: () => ({
            ...activeFilters,
            [field.key]: "",
            [field.pairWith]: "",
          }),
        });
      }
    }
  });

  return chips;
};

const formatLabel = (value, field, ctx) =>
  field.formatValue ? field.formatValue(value, ctx) : value;

export const countActiveFilters = (activeFilters, config) => {
  let count = 0;
  config.fields.forEach((field) => {
    const value = activeFilters[field.key];
    if (field.type === "multi") count += value?.length || 0;
    if (field.type === "single") count += value ? 1 : 0;
    if (field.type === "range")
      count +=
        activeFilters[field.key] || activeFilters[field.pairWith] ? 1 : 0;
  });
  return count;
};
