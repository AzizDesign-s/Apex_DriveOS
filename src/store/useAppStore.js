import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── WHY persist? ────────────────────────────────────────────────────────────
// By default Zustand state lives in memory only.
// When the browser refreshes, memory is wiped → state resets → user gets
// kicked back to login even though they were authenticated.
//
// zustand/middleware `persist` automatically:
//   1. Saves selected state to localStorage on every change
//   2. Reads it back on app start before first render
//   3. Rehydrates the store so the user stays logged in
// ─────────────────────────────────────────────────────────────────────────────

const useAppStore = create(
  persist(
    (set) => ({
      // ── Sidebar ──────────────────────────────────────────────────────────
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // ── Auth ─────────────────────────────────────────────────────────────
      isAuthenticated: false,
      user: null,
      login: (userData) => set({ isAuthenticated: true, user: userData }),
      logout: () => set({ isAuthenticated: false, user: null }),

      // ── Theme ─────────────────────────────────────────────────────────────
      theme: "dark",
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === "dark" ? "light" : "dark";
          if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
          } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
          }
          return { theme: newTheme };
        }),
    }),
    {
      // The key used in localStorage — open DevTools → Application → Local Storage
      // and you'll see "apex-gt-store" saved there after login
      name: "apex-gt-store",

      // ── IMPORTANT: Only persist what matters ──────────────────────────────
      // We don't want to persist sidebarOpen because on mobile a closed
      // sidebar on refresh feels broken. We only persist auth + theme.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        theme: state.theme,
      }),
    },
  ),
);

export default useAppStore;
