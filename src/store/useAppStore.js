// src/store/useAppStore.js
// Sprint 2.1 Message 6: adds accentColor state + applyAccentColor wiring.
// Message 5's company state (already present in your file) is preserved
// unchanged. FIX: company and accentColor are now correctly included in
// partialize — previously company would have reset on every refresh
// since it wasn't in the persisted whitelist.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_COMPANY_INFO } from "../data/mockData";
import { applyAccentColor } from "../utils/accentColors";

// ── Theme helper ──────────────────────────────────────────────────────────────
const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
};

// ── Store ─────────────────────────────────────────────────────────────────────
const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth ────────────────────────────────────────────────────────────────
      isAuthenticated: false,
      user: {
        name: "Admin User",
        email: "admin@apexdriveos.ae",
        role: "Super Admin",
        phone: "+971 50 000 0000",
        avatar: null,
      },

      login: (userData) =>
        set({
          isAuthenticated: true,
          user: userData || {
            name: "Admin User",
            email: "admin@apexdriveos.ae",
            role: "Super Admin",
          },
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
        }),

      // BUG-051 FIX: setUser merges partial updates
      // BUG-3 FIX: avatar is included in user object and persisted
      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      // ── Sidebar ─────────────────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (val) => set({ sidebarOpen: val }),

      // ── Company branding (Sprint 2.1 Message 5) ──────────────────────────────
      company: {
        name: DEFAULT_COMPANY_INFO.name,
        tagline: DEFAULT_COMPANY_INFO.tagline,
        logo: null, // null = use default BrandLogo asset
        isCustomBranding: false, // false = showing Apex DriveOS default
      },

      setCompany: (companyData) =>
        set((state) => ({
          company: {
            ...state.company,
            ...companyData,
            // Flips true the moment EITHER name or logo diverges from default —
            // this is what BrandLogo's 'product-current' check reads
            isCustomBranding:
              (companyData.name &&
                companyData.name !== DEFAULT_COMPANY_INFO.name) ||
              !!companyData.logo ||
              state.company.isCustomBranding,
          },
        })),

      resetCompanyToDefault: () =>
        set({
          company: {
            name: DEFAULT_COMPANY_INFO.name,
            tagline: DEFAULT_COMPANY_INFO.tagline,
            logo: null,
            isCustomBranding: false,
          },
        }),

      // ── Theme ────────────────────────────────────────────────────────────────
      theme: "dark",
      toggleTheme: () =>
        set((state) => {
          // BUG-005 FIX: apply immediately inside the action
          const next = state.theme === "dark" ? "light" : "dark";
          applyTheme(next);
          return { theme: next };
        }),

      // ── Accent Color (Sprint 2.1 Message 6) ──────────────────────────────────
      accentColor: "gold", // confirmed default per Sprint 2.1 brief

      setAccentColor: (accentId) =>
        set((state) => {
          applyAccentColor(accentId); // apply immediately — same pattern
          // as toggleTheme above
          return { accentColor: accentId };
        }),
    }),
    {
      name: "apex-driveos-store",

      // BUG-061 FIX: version field — stale localStorage auto-migrates
      // Sprint 2.1: bumped 1 → 2 to seed company + accentColor for any
      // existing persisted state from before this sprint
      version: 2,
      migrate: (persistedState, version) => {
        // Version 0 = old store without version field → reset to clean defaults
        if (version === 0) {
          return {
            isAuthenticated: false,
            user: null,
            sidebarOpen: true,
            theme: "dark",
            company: {
              name: DEFAULT_COMPANY_INFO.name,
              tagline: DEFAULT_COMPANY_INFO.tagline,
              logo: null,
              isCustomBranding: false,
            },
            accentColor: "gold",
          };
        }
        // Version 1 = had company already, but not accentColor yet
        if (version === 1) {
          return {
            ...persistedState,
            accentColor: "gold",
          };
        }
        return persistedState;
      },

      // FIX: company and accentColor were missing from this whitelist —
      // without being listed here, neither one actually survives a page
      // refresh despite the state existing at runtime. Now both persist.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user, // includes avatar as data URL
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        company: state.company,
        accentColor: state.accentColor,
      }),
    },
  ),
);

// Apply theme + accent color on initial load before React renders —
// prevents a flash of default styling before saved preferences kick in
applyTheme(useAppStore.getState().theme);
applyAccentColor(useAppStore.getState().accentColor);

export default useAppStore;
