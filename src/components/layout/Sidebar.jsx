// src/components/layout/Sidebar.jsx
//
// ─── WHAT THIS FILE DOES ──────────────────────────────────────────────────────
// The floating glassmorphism sidebar that lives on the left side of every page.
// It is NOT inside the page flow — it floats using absolute positioning inside
// the AppLayout wrapper.
//
// KEY CONCEPTS used here:
//   - Framer Motion: animates width (expand/collapse) and item entrance
//   - useLocation (React Router): knows which page is active
//   - useNavigate (React Router): changes page when a nav item is clicked
//   - Zustand: reads sidebarOpen state + toggleSidebar action
//   - Responsive: on mobile it slides in as a drawer with a backdrop overlay
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { loadNotifications } from "../../utils/notificationUtils";
import Tooltip from "../ui/Tooltip";
import {
  LayoutDashboard,
  Car,
  Users,
  CalendarCheck,
  FileText,
  BarChart2,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users as UsersIcon,
  Shield,
  FileChartColumnIncreasing,
} from "lucide-react";
import useAppStore from "../../store/useAppStore";
import { notifications as notifData } from "../../data/mockData";
import apexToast from "../../utils/toast";
import clsx from "clsx";

// ─── NAV STRUCTURE ────────────────────────────────────────────────────────────
// Defining nav items as data (not hardcoded JSX) means:
//   1. Easy to add/remove items later
//   2. We loop over them instead of copy-pasting JSX
//   3. Clean separation of data from presentation
// ─────────────────────────────────────────────────────────────────────────────

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
// Framer Motion variants let you name animation states and switch between them.
// 'open' = expanded sidebar, 'closed' = icon-only collapsed state
// ─────────────────────────────────────────────────────────────────────────────

const sidebarVariants = {
  open: { width: 240 },
  closed: { width: 72 },
};

const unreadCount = notifData.filter((n) => !n.isRead).length;

// Drawer (mobile) slides in from left
const drawerVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: -280, opacity: 0 },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

function Sidebar({ isMobile = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    sidebarOpen,
    toggleSidebar,
    logout,

    user,
  } = useAppStore();

  // On mobile, sidebar is always 'open' width — it's a full drawer
  // On desktop, width is controlled by sidebarOpen state

  useEffect(() => {
    if (window.innerWidth < 1024) {
      // Only collapse if it's currently open
      if (sidebarOpen) toggleSidebar();
    }
  }, [location.pathname]);

  useEffect(() => {
    const onCountUpdate = (e) => {
      if (e.detail?.count !== undefined) {
        setNotifCount(e.detail.count);
      }
    };

    const onStorageUpdate = (e) => {
      if (e.key === "apex-gt-notifications") {
        const notifs = loadNotifications();
        setNotifCount(notifs.filter((n) => !n.isRead).length);
      }
    };

    window.addEventListener("apex-gt-notif-count-updated", onCountUpdate);
    window.addEventListener("storage", onStorageUpdate);

    return () => {
      window.removeEventListener("apex-gt-notif-count-updated", onCountUpdate);
      window.removeEventListener("storage", onStorageUpdate);
    };
  }, []);

  const getLiveCount = (key, filterFn) => {
    try {
      const saved = localStorage.getItem(key);
      const arr = saved ? JSON.parse(saved) : [];
      return filterFn ? arr.filter(filterFn).length : arr.length;
    } catch {
      return 0;
    }
  };

  const [inventoryCount, setInventoryCount] = useState(() =>
    getLiveCount("apex-gt-cars", (c) => c.status === "available"),
  );
  const [testDriveCount, setTestDriveCount] = useState(() =>
    getLiveCount("apex-gt-bookings", (b) => b.status === "pending"),
  );
  const [userCount, setUserCount] = useState(() =>
    getLiveCount("apex-gt-users"),
  );
  const [notifCount, setNotifCount] = useState(() =>
    getLiveCount("apex-gt-notifications", (n) => !n.isRead),
  );

  useEffect(() => {
    const onCars = () =>
      setInventoryCount(
        getLiveCount("apex-gt-cars", (c) => c.status === "available"),
      );
    const onBookings = () =>
      setTestDriveCount(
        getLiveCount("apex-gt-bookings", (b) => b.status === "pending"),
      );
    const onUsers = () => setUserCount(getLiveCount("apex-gt-users"));
    const onNotifs = () =>
      setNotifCount(getLiveCount("apex-gt-notifications", (n) => !n.isRead));

    window.addEventListener("apex-gt-cars-updated", onCars);
    window.addEventListener("apex-gt-bookings-updated", onBookings);
    window.addEventListener("apex-gt-users-updated", onUsers);
    window.addEventListener("apex-gt-notifications-updated", onNotifs);

    return () => {
      window.removeEventListener("apex-gt-cars-updated", onCars);
      window.removeEventListener("apex-gt-bookings-updated", onBookings);
      window.removeEventListener("apex-gt-users-updated", onUsers);
      window.removeEventListener("apex-gt-notifications-updated", onNotifs);
    };
  }, []);

  // In getBadge() (or wherever badges are resolved per nav item):
  const getBadge = (item) => {
    if (item.path === "/notifications")
      return notifCount > 0 ? String(notifCount) : null;
    if (item.path === "/inventory")
      return inventoryCount > 0 ? String(inventoryCount) : null;
    if (item.path === "/test-drives")
      return testDriveCount > 0 ? String(testDriveCount) : null;
    if (item.path === "/users") return userCount > 0 ? String(userCount) : null;
    return item.badge || null;
  };

  const NAV_SECTIONS = [
    {
      label: "Main",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard",
          badge: null,
        },
        {
          icon: UsersIcon,
          label: "Users",
          path: "/users",
          badge: userCount > 0 ? String(userCount) : null,
        },

        {
          icon: Car,
          label: "Inventory",
          path: "/inventory",
          badge: inventoryCount > 0 ? String(inventoryCount) : null,
        },
        { icon: Users, label: "Customers", path: "/customers", badge: null },
        {
          icon: CalendarCheck,
          label: "Test Drives",
          path: "/test-drives",
          badge: testDriveCount > 0 ? String(testDriveCount) : null,
        },
      ],
    },
    {
      label: "Finance",
      items: [
        { icon: FileText, label: "Invoices", path: "/invoices", badge: null },
        {
          icon: BarChart2,
          label: "Analytics",
          path: "/analytics",
          badge: null,
        },
        {
          icon: FileChartColumnIncreasing,
          label: "Reports",
          path: "/reports",
          badge: null,
        },
      ],
    },

    {
      label: "System",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          path: "/notifications",
          badge: notifCount > 0 ? String(notifCount) : null,
        },
        { icon: Settings, label: "Settings", path: "/settings", badge: null },
      ],
    },
  ];

  const isOpen = isMobile ? true : sidebarOpen;

  const handleLogout = () => {
    logout();
    apexToast.info("logged Out", "You have been signed out sucessfully.");
    navigate("/login");
  };

  // ── Inner sidebar content (shared between desktop + mobile) ─────────────────

  const SidebarContent = () => (
    <>
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-2 pb-5 mb-2 border-b border-border overflow-hidden">
        {/* Diamond logo mark */}
        <div className="splash-diamond w-7 h-7 flex-shrink-0 flex items-center justify-center">
          <span className="text-[8px] font-black text-base tracking-wider">
            GT
          </span>
        </div>

        {/* Brand name — hidden when sidebar collapsed */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-black tracking-[0.2em] text-gold-gradient">
                APEX GT
              </p>
              <p className="text-[9px] tracking-[0.2em] text-text-subtle uppercase mt-0.5">
                Management
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav Sections ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            {/* Section label — hidden when collapsed */}
            <AnimatePresence>
              {isOpen && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[9px] font-semibold tracking-[0.25em] text-text-subtle
                             uppercase px-3 mb-2 mt-1"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Nav Items */}

            {section.items.map((item, i) => {
              // Check if this item matches the current URL
              const isActive = location.pathname === item.path;
              return (
                <Tooltip
                  key={item.path}
                  content={
                    !isOpen
                      ? item.badge
                        ? `${item.label} (${item.badge})`
                        : item.label
                      : null
                  }
                  side="right"
                >
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)} // Stagger entrance: each item delays slightly after the previous
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={clsx(
                      // Base styles always applied
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "transition-all duration-200 relative group mb-0.5",
                      // Justify center when collapsed (icon only)
                      !isOpen && "justify-center bg-transparent",
                      // Active vs inactive styles
                      isActive
                        ? "bg-gold/10 text-text-primary"
                        : "text-text-muted hover:bg-gold/5 hover:text-text-primary",
                    )}
                  >
                    {/* Active left border indicator */}

                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className={clsx(
                          "absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-gold to-gold-light rounded-r-full",
                          !isOpen && "w-0",
                        )}
                      />
                    )}

                    {/* Icon wrapper */}
                    <div
                      className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        "transition-colors duration-200",
                        isActive
                          ? "bg-gold/15 text-gold"
                          : "text-text-subtle group-hover:text-text-muted",
                      )}
                    >
                      <item.icon size={17} />
                    </div>

                    {/* Label + badge — hidden when collapsed */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between flex-1 overflow-hidden"
                        >
                          <span
                            className={clsx(
                              "text-[13px] whitespace-nowrap",
                              isActive ? "font-semibold" : "font-medium",
                            )}
                          >
                            {item.label}
                          </span>

                          {item.badge && (
                            <span
                              className="text-[9px] font-bold bg-gold/15 text-gold
                                           px-2 py-0.5 rounded-full ml-auto"
                            >
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tooltip on hover when collapsed */}
                    {!isOpen && (
                      <div
                        className="absolute left-full ml-3 px-2.5 py-1.5 bg-card
                  border border-border rounded-lg text-xs font-medium
                  text-text-primary whitespace-nowrap opacity-0 pointer-events-none
                  group-hover:opacity-100 transition-opacity duration-200 z-50
                  shadow-card"
                      >
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 text-gold">{item.badge}</span>
                        )}
                      </div>
                    )}
                  </motion.button>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom: User Card + Logout ── */}
      <div className="mt-auto pt-4 border-t border-border space-y-2">
        {/* User info card */}
        <Tooltip content={!isOpen ? "Admin · Super Admin" : null} side="right">
          <div
            className={clsx(
              "flex items-center gap-3 p-2.5 rounded-xl",
              "bg-gold/[0.04] border border-gold/[0.08]",
              !isOpen && "justify-center bg-transparent border-none",
            )}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0
                  flex items-center justify-center text-sm font-bold text-[#0B0F14]"
              style={{
                background: user?.avatar
                  ? "transparent"
                  : "linear-gradient(135deg,#B8931F,#D4AF37,#E8C84A)",
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "Admin"}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0] || "A"
              )}
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-semibold text-text-primary whitespace-nowrap">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] text-text-subtle whitespace-nowrap">
                    Admin
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tooltip>

        {/* Logout button */}
        <Tooltip content={!isOpen ? "Sign Out" : null} side="right">
          <button
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
              "text-text-subtle hover:text-red-400 hover:bg-red-500/5",
              "transition-all duration-200 group",
              !isOpen && "justify-center hover:bg-transparent",
            )}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          group-hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] font-medium whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </Tooltip>
      </div>
    </>
  );

  // ── MOBILE: Full drawer ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Dark overlay behind drawer */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar} // tap outside to close
            />

            {/* Drawer panel */}
            <motion.aside
              className="fixed top-0 left-0 bottom-0 w-[260px] z-40
                         bg-card/95 border-r border-border bg-base/20 backdrop-blur-sm
                         flex flex-col p-5"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // ── DESKTOP: Floating sidebar ────────────────────────────────────────────────
  return (
    <motion.aside
      className="fixed top-3 left-3 bottom-3 z-20
             bg-card/85 backdrop-blur-[20px]
             border border-border rounded-[20px]
             flex flex-col p-4
             shadow-glass overflow-hidden"
      style={{
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
      variants={sidebarVariants}
      animate={sidebarOpen ? "open" : "closed"}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <SidebarContent />

      {/* ── Collapse / Expand toggle button ── */}
      {/*  Lives on the right edge of the sidebar  */}
      <motion.button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 -translate-y-1/2
                   w-6 h-6 rounded-full bg-card border border-border
                   flex items-center justify-center
                   text-text-muted hover:text-gold hover:border-gold/40
                   transition-colors duration-200 z-30 shadow-card"
        // Rotate the arrow when toggling
        animate={{ rotate: sidebarOpen ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronLeft size={13} />
      </motion.button>
    </motion.aside>
  );
}

export default Sidebar;
