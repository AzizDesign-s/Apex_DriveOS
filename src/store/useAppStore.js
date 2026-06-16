// src/store/useAppStore.js
// BUG-005 FIX: theme toggle was calling toggleTheme which flips the stored value
// but main.jsx was applying theme before hydration — race condition on some builds.
// Fix: apply theme inside the store action itself, not just in main.jsx.

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper — apply theme class to <html>
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

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────────────
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

      logout: () => set({ isAuthenticated: false, user: null }),

      // BUG-051 FIX (preview): setUser now exists
      setUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      // ── Sidebar ───────────────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (val) => set({ sidebarOpen: val }),

      // ── Theme ─────────────────────────────────────────────────────────────
      theme: "dark",
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === "dark" ? "light" : "dark";
          // BUG-005 FIX: apply immediately inside the action
          applyTheme(next);
          return { theme: next };
        }),

      // ── Module counts for sidebar badges ──────────────────────────────────
      // BUG-001 FIX (partial): inventoryCount was the only badge count.
      // Phase 2 will derive these from domain stores.
      inventoryCount: 0,
      setInventoryCount: (n) => set({ inventoryCount: n }),

      testDriveCount: 0,
      setTestDriveCount: (b) => set({ testDriveCount: b }),
    }),
    {
      name: "apex-gt-store",
      // BUG-061 FIX: version field — if schema changes, old localStorage is cleared
      version: 1,
      migrate: (persistedState, version) => {
        // If version is 0 (old store with no version), reset to defaults
        if (version === 0) return {};
        return persistedState;
      },
      // Only persist what's needed — not derived/transient state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    },
  ),
);

// Apply theme on initial load (before React renders)
applyTheme(useAppStore.getState().theme);

export default useAppStore;
