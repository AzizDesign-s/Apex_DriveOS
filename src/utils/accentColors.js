// src/utils/accentColors.js
//
// Sprint 2.1 Message 6: the 5 accent options. Each defines RGB triplets
// (not hex strings) since Message 2's tailwind config uses
// rgb(var(--x-rgb) / <alpha-value>) syntax — values here must match
// that format exactly or opacity modifiers (bg-gold/10 etc.) will break
// again the same way they did before.

export const ACCENT_COLORS = [
  {
    id: "gold",
    label: "Gold",
    swatch: "#D4AF37",
    isDefault: true,
    values: {
      "--color-accent-rgb": "212, 175, 55",
      "--color-accent-light-rgb": "232, 200, 74",
      "--color-accent-dark-rgb": "184, 147, 31",
    },
  },
  {
    id: "blue",
    label: "Blue",
    swatch: "#3b82f6",

    values: {
      "--color-accent-rgb": "59, 130, 246",
      "--color-accent-light-rgb": "96, 165, 250",
      "--color-accent-dark-rgb": "37, 99, 235",
    },
  },

  {
    id: "purple",
    label: "Purple",
    swatch: "#a855f7",
    values: {
      "--color-accent-rgb": "168, 85, 247",
      "--color-accent-light-rgb": "192, 132, 252",
      "--color-accent-dark-rgb": "147, 51, 234",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "#10b981",
    values: {
      "--color-accent-rgb": "16, 185, 129",
      "--color-accent-light-rgb": "52, 211, 153",
      "--color-accent-dark-rgb": "5, 150, 105",
    },
  },
  {
    id: "cyan",
    label: "Cyan",
    swatch: "#06b6d4",
    values: {
      "--color-accent-rgb": "6, 182, 212",
      "--color-accent-light-rgb": "34, 211, 238",
      "--color-accent-dark-rgb": "8, 145, 178",
    },
  },
];

export const getAccentById = (id) =>
  ACCENT_COLORS.find((c) => c.id === id) ||
  ACCENT_COLORS.find((c) => c.isDefault);

// Applies an accent's CSS variables to :root — this makes the switch
// instant and global, no rebuild, no component changes needed anywhere
export const applyAccentColor = (accentId) => {
  const accent = getAccentById(accentId);
  const root = document.documentElement;
  Object.entries(accent.values).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
};
