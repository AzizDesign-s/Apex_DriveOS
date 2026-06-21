// src/store/useAppStore.js
// Complete file — all fixes from Module 1, Module 9, Module 10 applied

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_COMPANY_INFO } from "../data/mockData";

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
        email: "admin@apexgt.ae",
        role: "Super Admin",
        phone: "+971 50 000 0000",
        avatar: null,
      },

      login: (userData) =>
        set({
          isAuthenticated: true,
          user: userData || {
            name: "Admin User",
            email: "admin@apexgt.ae",
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
    }),
    {
      name: "apex-gt-store",

      // BUG-061 FIX: version field — stale localStorage auto-migrates
      version: 1,
      migrate: (persistedState, version) => {
        // Version 0 = old store without version field → reset to clean defaults
        if (version === 0) {
          return {
            isAuthenticated: false,
            user: null,
            sidebarOpen: true,
            theme: "dark",
          };
        }
        return persistedState;
      },

      // Only persist what matters — never persist derived/transient counts
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user, // includes avatar as data URL
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    },
  ),
);

// Apply theme on initial load before React renders
applyTheme(useAppStore.getState().theme);

export default useAppStore;
