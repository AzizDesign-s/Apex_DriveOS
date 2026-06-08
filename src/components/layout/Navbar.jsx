// src/components/layout/Navbar.jsx
//
// ─── WHAT THIS FILE DOES ──────────────────────────────────────────────────────
// The top bar that appears on every page inside the app shell.
// It shows: page title, breadcrumb, search, theme toggle,
//           notification bell, and user profile.
//
// KEY CONCEPTS:
//   - useLocation: reads current URL to display correct page title
//   - Zustand: reads theme + toggleTheme + toggleSidebar (for mobile menu)
//   - The title is auto-derived from the URL — no manual prop needed
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Sun, Moon, Bell, ChevronDown } from "lucide-react";
import useAppStore from "../../store/useAppStore";
import clsx from "clsx";

// Map URL paths → human-readable page titles
// When we add new pages, we just add an entry here
const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventory",
  "/customers": "Customers",
  "/test-drives": "Test Drives",
  "/invoices": "Invoices",
  "/analytics": "Analytics",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme, toggleSidebar, user } = useAppStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Derive page title from current URL
  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      className="h-16 mx-3 mt-3 flex-shrink-0
                    bg-card/85  backdrop-blur-[20px]
                    border border-border rounded-2xl
                    flex items-center px-5 gap-4
                    shadow-card z-10"
      style={{
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* ── Mobile hamburger menu ── */}
      {/*  Only visible on mobile — triggers the drawer sidebar  */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center
                   text-text-muted hover:text-text-primary hover:bg-card
                   transition-colors flex-shrink-0"
      >
        <Menu size={18} />
      </button>

      {/* ── Page Title + Breadcrumb ── */}
      <div className="flex-shrink-0">
        {/* Show greeting on dashboard, page title everywhere else */}
        <h1 className="text-lg font-bold text-text-primary leading-none">
          {pageTitle === "Dashboard"
            ? `${getGreeting()}, ${user?.name || "Admin"} 👋`
            : pageTitle}
        </h1>
        <p className="text-[10px] text-text-subtle tracking-widest mt-1.5 uppercase">
          APEX GT / {pageTitle}
        </p>
      </div>

      {/* ── Search Bar ── */}
      {/*  ml-auto pushes everything after it to the right  */}
      <div className="relative ml-auto max-w-[280px] w-full hidden md:block">
        <Search
          size={14}
          className={clsx(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
            searchFocused ? "text-gold" : "text-text-subtle",
          )}
        />
        <input
          type="text"
          placeholder="Search cars, customers..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="input-luxury pl-9 py-2 text-xs"
        />
      </div>

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl
                     border border-border bg-card/50
                     text-text-muted hover:text-gold hover:border-gold/30
                     transition-all duration-200 text-xs font-medium tracking-wide"
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            // Spin the icon when switching
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </motion.div>
          <span className="hidden sm:inline">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </motion.button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl border border-border
                       bg-card/50 flex items-center justify-center
                       text-text-muted hover:text-gold hover:border-gold/30
                       transition-all duration-200"
          >
            <Bell size={16} />
            {/* Unread dot */}
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full
                             bg-gold border border-card"
            />
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <>
                {/* Close on outside click */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotifOpen(false)}
                />

                <motion.div
                  className="absolute right-0 top-11 w-80 bg-card/95 backdrop-blur-[20px]
                             border border-border rounded-2xl shadow-glass z-20 overflow-hidden"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3
                                  border-b border-border"
                  >
                    <p className="text-sm font-semibold text-text-primary">
                      Notifications
                    </p>
                    <span
                      className="text-[10px] bg-gold/15 text-gold
                                     px-2 py-0.5 rounded-full font-bold"
                    >
                      5 new
                    </span>
                  </div>

                  {/* Notification items */}
                  {[
                    {
                      title: "Test Drive Approved",
                      sub: "Mohammed Al-Rashid · AMG GT",
                      time: "2m ago",
                      dot: "bg-emerald-400",
                    },
                    {
                      title: "New Invoice Created",
                      sub: "Invoice #INV-0042 · AED 380K",
                      time: "15m ago",
                      dot: "bg-gold",
                    },
                    {
                      title: "Low Inventory Alert",
                      sub: "Only 2 Ferrari 488 remaining",
                      time: "1h ago",
                      dot: "bg-red-400",
                    },
                    {
                      title: "New Customer Inquiry",
                      sub: "Sarah Johnson · Rolls Royce",
                      time: "3h ago",
                      dot: "bg-sky-accent",
                    },
                  ].map((notif, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-4 py-3
                                 hover:bg-gold/5 transition-colors cursor-pointer
                                 border-b border-border/50 last:border-0"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.dot}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5 truncate">
                          {notif.sub}
                        </p>
                      </div>
                      <span className="text-[10px] text-text-subtle flex-shrink-0 mt-0.5">
                        {notif.time}
                      </span>
                    </div>
                  ))}

                  {/* Footer */}
                  <div className="px-4 py-3 text-center">
                    <button
                      className="text-xs text-gold hover:text-gold-light
                                       transition-colors font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border ml-1">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-dark to-gold
                          flex items-center justify-center text-xs font-bold
                          text-base flex-shrink-0"
          >
            {user?.name?.[0] || "A"}
          </div>

          {/* Name + role — hidden on small screens */}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-text-primary leading-none">
              {user?.name || "Admin"}
            </p>
            <p className="text-[10px] text-text-subtle mt-0.5">
              {user?.role || "Super Admin"}
            </p>
          </div>

          <ChevronDown size={13} className="text-text-subtle hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
