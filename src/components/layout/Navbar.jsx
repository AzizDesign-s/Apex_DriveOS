// src/components/layout/Navbar.jsx
// Add these imports at the top:
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sun, Moon, Bell, ChevronDown, Search, X } from "lucide-react";
import useAppStore from "../../store/useAppStore";

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

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* ── Mobile / Global Search Overlay ───────────────────────────────── */}
      {/* Same pattern as InventoryToolbar mobile search                      */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSearchClose}
            />

            {/* Search popup — top center */}
            <motion.div
              className="fixed top-4 left-4 right-4 z-50 max-w-xl mx-auto"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              <div
                className="bg-card border border-border rounded-2xl p-3
                              shadow-glass flex items-center gap-3"
              >
                <Search
                  size={16}
                  className="text-text-subtle flex-shrink-0 ml-1"
                />
                <input
                  className="input-luxury flex-1 py-2.5 text-sm bg-transparent
                             border-0 outline-none ring-0 focus:ring-0
                             placeholder:text-text-subtle"
                  placeholder="Search cars, customers, invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && handleSearchClose()}
                  autoFocus
                />
                {/* Clear query button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-text-subtle hover:text-text-muted transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                {/* Divider */}
                <div className="w-px h-5 bg-border flex-shrink-0" />
                {/* Close button */}
                <button
                  onClick={handleSearchClose}
                  className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
                             text-text-muted hover:text-rose-400 hover:border-rose-400/40
                             transition-all flex-shrink-0"
                  aria-label="Close search"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Search hint */}
              <p className="text-[10px] text-text-subtle/50 text-center mt-2 tracking-wide">
                Press{" "}
                <kbd className="bg-card border border-border rounded px-1.5 py-0.5 text-[9px]">
                  Esc
                </kbd>{" "}
                to close
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Navbar bar ───────────────────────────────────────────────────── */}
      <div
        className="h-16 mx-3 mt-3 flex-shrink-0
                      bg-card/85 backdrop-blur-[20px]
                      border border-border rounded-2xl
                      flex items-center px-4 justify-between gap-4
                      shadow-card z-10"
        style={{
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Mobile hamburger */}
        <div className="flex justify-start items-center gap-1">
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center
                     text-text-muted hover:text-text-primary hover:bg-card
                     transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Page title + breadcrumb */}
          <div className="flex-shrink-0">
            <h1 className="text-base sm:text-sm font-bold text-text-primary  leading-none">
              {pageTitle}
            </h1>
            <p className="lg:text-[10px] text-[7px] text-text-subtle tracking-widest text-wrap mt-1.5 uppercase">
              APEX GT / {pageTitle}
            </p>
          </div>
        </div>

        {/* ── Search button — always icon, expands on click ── */}
        {/* On desktop: shows in the middle area                */}
        {/* On mobile: compact icon on the right               */}
        <button
          onClick={() => setSearchOpen(true)}
          className={`
            hidden md:flex items-center gap-2 ml-auto
            px-3 py-2 rounded-xl border transition-all duration-200
            text-xs text-text-subtle
            ${
              searchQuery
                ? "border-gold/40 text-gold bg-gold/5"
                : "border-border hover:border-gold/30 hover:text-text-muted bg-card/50"
            }
          `}
          style={{ maxWidth: "220px", flex: 1 }}
        >
          <Search size={13} className="flex-shrink-0" />
          <span className="truncate">
            {searchQuery || "Search anything..."}
          </span>
          {/* Keyboard shortcut hint */}
          <kbd
            className="ml-auto text-[9px] bg-border/60 text-text-subtle
                          px-1.5 py-0.5 rounded tracking-wide flex-shrink-0"
          >
            ⌘K
          </kbd>
        </button>

        {/* ── Right side actions ── */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-2">
          {/* Mobile search icon only */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden w-8 h-8 rounded-xl border border-border flex items-center justify-center
                       text-text-muted hover:text-gold hover:border-gold/30 transition-all"
            aria-label="Search"
          >
            <Search size={15} />
          </button>

          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl
                       border border-border bg-card/50
                       text-text-muted hover:text-gold hover:border-gold/30
                       transition-all duration-200 text-xs font-medium tracking-wide"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
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

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 rounded-xl border border-border
                         bg-card/50 flex items-center justify-center
                         text-text-muted hover:text-gold hover:border-gold/30
                         transition-all"
              aria-label="Notifications"
            >
              <Bell size={15} />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full
                               bg-gold border border-card"
              />
            </button>

            {/* Notification dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setNotifOpen(false)}
                  />
                  <motion.div
                    className="absolute right-0 top-11 w-80 bg-card 
                               border border-border rounded-2xl shadow-glass z-20 overflow-hidden"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                  >
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

                    {/* TODO: replace with real notifications from Zustand/API */}
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
                        dot: "bg-rose-400",
                      },
                      {
                        title: "New Customer Inquiry",
                        sub: "Sarah Johnson · Rolls Royce",
                        time: "3h ago",
                        dot: "bg-sky-accent",
                      },
                    ].map((n, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-4 py-3
                                   hover:bg-gold/5 transition-colors cursor-pointer
                                   border-b border-border last:border-0"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.dot}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-text-muted mt-0.5 truncate">
                            {n.sub}
                          </p>
                        </div>
                        <span className="text-[10px] text-text-subtle flex-shrink-0 mt-0.5">
                          {n.time}
                        </span>
                      </div>
                    ))}

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

          {/* User profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-border ml-1">
            <div
              className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-dark to-gold
                            flex items-center justify-center text-xs font-bold
                            text-base flex-shrink-0"
            >
              {user?.name?.[0] || "A"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-text-primary leading-none">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-text-subtle mt-0.5">
                {user?.role || "Super Admin"}
              </p>
            </div>
            <ChevronDown
              size={12}
              className="text-text-subtle hidden sm:block"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
