// src/components/layout/Navbar.jsx

import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  loadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from "../../utils/notificationUtils";
import GlobalSearchOverlay from "./GlobalSearchOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Sun, Moon, Bell, ChevronDown, Search, X } from "lucide-react";
import useAppStore from "../../store/useAppStore";

// ── Import the SAME notification data source as the Notifications page ────────
// BUG-002 FIX: Navbar and Notifications page were reading from different sources.
// Both now read from the same array. Phase 2 will replace this with useNotificationStore.
import { notifications as rawNotifications } from "../../data/mockData";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/roles": "Roles",
  "/inventory": "Inventory",
  "/customers": "Customers",
  "/test-drives": "Test Drives",
  "/invoices": "Invoices",
  "/analytics": "Analytics",
  "/leads": "Leads",

  "/notifications": "Notifications / Analytics",
  "/settings": "Settings",
  "/reports": "Reports",
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, toggleSidebar, user } = useAppStore();

  const [notifItems, setNotifItems] = useState(() => loadNotifications());
  const [notifOpen, setNotifOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const company = useAppStore((s) => s.company);

  // BUG-002 FIX: Read from the same source as the Notifications page.
  // BUG-003 FIX: Track read state locally so bell clears when items are read.
  // Phase 2 will lift this into useNotificationStore.
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-driveos-read-notif-ids");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persist readIds whenever they change
  useEffect(() => {
    localStorage.setItem(
      "apex-driveos-read-notif-ids",
      JSON.stringify([...readIds]),
    );
  }, [readIds]);

  useEffect(() => {
    const reload = () => setNotifItems(loadNotifications());

    const onStorage = (e) => {
      if (e.key === "apex-driveos-notifications") reload(); // ← matches real storage key
    };

    window.addEventListener("apex-driveos-notifications-updated", reload); // ← matches dispatch
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("apex-driveos-notifications-updated", reload);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // BUG-001 FIX: unreadCount derived from the shared notifications array
  // minus the locally-tracked read IDs.

  // Latest 4 for the dropdown preview
  const previewNotifs = useMemo(
    () =>
      [...notifItems]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4),
    [notifItems],
  );

  const unreadCount = useMemo(
    () => notifItems.filter((n) => !n.isRead).length,
    [notifItems],
  );
  const markNavRead = (id) => {
    markNotificationRead(id);
    setNotifItems(loadNotifications());
  };

  const markAllNavRead = () => {
    markAllNotificationsRead();
    setNotifItems(loadNotifications());
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";

  // Type → color dot
  const TYPE_DOT = {
    test_drive: "bg-sky-accent",
    invoice: "bg-gold",
    inventory: "bg-emerald-400",
    customer: "bg-violet-400",
    system: "bg-text-subtle",
  };

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <>
      <GlobalSearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* ── Navbar bar ── */}
      <div
        className="h-16 mx-3 mt-3 flex-shrink-0
                      bg-card/85 backdrop-blur-[20px]
                      border border-border rounded-2xl
                      flex items-center px-4 gap-4
                      shadow-card z-10"
      >
        {/* Mobile hamburger */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center
                     text-text-muted hover:text-text-primary hover:bg-card
                     transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Page title */}
        <div className="flex-shrink-0">
          <h1 className="text-base font-bold text-text-primary leading-none">
            {pageTitle}
          </h1>
          <p className="text-[10px] text-text-subtle tracking-widest mt-0.5 uppercase">
            {company.name} / {pageTitle}
          </p>
        </div>

        {/* Desktop search pill */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 ml-auto
                     px-3 py-2 rounded-xl border border-border transition-all duration-200
                     text-xs text-text-subtle bg-card/50
                     hover:border-gold/30 hover:text-text-muted"
          style={{ flex: 1, maxWidth: "220px" }}
        >
          <Search size={13} className="flex-shrink-0" />
          <span className="truncate">Search anything...</span>
          <kbd
            className="ml-auto text-[9px] bg-border/60 text-text-subtle
                          px-1.5 py-0.5 rounded tracking-wide flex-shrink-0"
          >
            ⌘K
          </kbd>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-2">
          {/* Mobile search icon */}
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
                       transition-all duration-200 text-xs font-medium"
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
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

          {/* ── Notification bell ── */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((p) => !p)}
              className="relative w-8 h-8 rounded-xl border border-border
                         bg-card/50 flex items-center justify-center
                         text-text-muted hover:text-gold hover:border-gold/30
                         transition-all"
              aria-label={`Notifications — ${unreadCount} unread`}
            >
              <Bell size={15} />
              {/* BUG-003 FIX: dot only shows when there are actually unread items */}
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full
                                 bg-gold border-2 border-card flex items-center justify-center
                                 text-[8px] font-black text-[#0B0F14] px-0.5"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
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
                    {/* Dropdown header */}
                    <div
                      className="flex items-center justify-between px-4 py-3
                                    border-b border-border"
                    >
                      <p className="text-sm font-semibold text-text-primary">
                        Notifications
                      </p>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <>
                            <span
                              className="text-[10px] bg-gold/15 text-gold
                                             px-2 py-0.5 rounded-full font-bold"
                            >
                              {unreadCount} new
                            </span>
                            {/* BUG-003 FIX: Mark all read button */}
                            <button
                              onClick={markAllNavRead}
                              className="text-[10px] text-text-subtle hover:text-gold
                                         transition-colors"
                            >
                              Mark all read
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Preview items — latest 4 */}
                    {previewNotifs.map((n, idx) => {
                      const isUnread = !readIds.has(n.id) && !n.isRead;
                      return (
                        <div
                          key={n.id ?? `notif-${idx}`}
                          className={`flex items-start gap-3 px-4 py-3 cursor-pointer
                                      hover:bg-gold/5 transition-colors
                                      border-b border-border last:border-0
                                      ${isUnread ? "bg-gold/[0.02]" : ""}`}
                          onClick={() => {
                            markNavRead(n.id);
                            setNotifOpen(false);
                            navigate("/notifications");
                          }}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0
                                          ${TYPE_DOT[n.type] || "bg-text-subtle"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-semibold leading-tight
                                          ${isUnread ? "text-text-primary" : "text-text-muted"}`}
                            >
                              {n.title}
                            </p>
                            <p className="text-[10px] text-text-muted mt-0.5 truncate">
                              {n.message.slice(0, 60)}…
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-[10px] text-text-subtle">
                              {timeAgo(n.createdAt)}
                            </span>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Footer */}
                    <div className="px-4 py-3 text-center border-t border-border">
                      <button
                        className="text-xs text-gold hover:text-gold/80 transition-colors font-medium"
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        View all notifications →
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
              className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 flex items-center
                  justify-center text-xs font-bold text-[#0B0F14]"
              style={{
                background: user?.avatar
                  ? "transparent"
                  : "linear-gradient(135deg,#B8931F,#D4AF37,#E8C84A)",
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0] || "A"
              )}
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
