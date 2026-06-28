// src/components/layout/Sidebar.jsx
// Fixes applied:
//   BUG-1: brand="product-current" so custom company logo actually reflects
//   FIX: merged two separate count-update useEffects into one — previously
//        both registered apex-driveos-cars/users/notifications listeners,
//        meaning every handler fired twice per event
//   FIX: moved all useState declarations above the useEffects that reference
//        them, eliminating the fragile temporal ordering

import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "../branding/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";
import { loadNotifications } from "../../utils/notificationUtils";
import SidebarFooterBrand from "./SidebarFooterBrand";
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
  TrendingUp,
  Wrench,
  Tag,
} from "lucide-react";
import useAppStore from "../../store/useAppStore";
import apexToast from "../../utils/toast";
import clsx from "clsx";

// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const sidebarVariants = {
  open: { width: 240 },
  closed: { width: 72 },
};

const drawerVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: -280, opacity: 0 },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getLiveCount = (key, filterFn) => {
  try {
    const saved = localStorage.getItem(key);
    const arr = saved ? JSON.parse(saved) : [];
    return filterFn ? arr.filter(filterFn).length : arr.length;
  } catch {
    return 0;
  }
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
function Sidebar({ isMobile = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { sidebarOpen, toggleSidebar, logout, user } = useAppStore();
  const company = useAppStore((s) => s.company);

  // ── All count state — declared BEFORE any useEffect that references them ───
  const [inventoryCount, setInventoryCount] = useState(() =>
    getLiveCount("apex-driveos-cars", (c) => c.status === "available"),
  );
  const [testDriveCount, setTestDriveCount] = useState(() =>
    getLiveCount("apex-driveos-bookings", (b) => b.status === "pending"),
  );
  const [userCount, setUserCount] = useState(() =>
    getLiveCount("apex-driveos-users"),
  );
  const [notifCount, setNotifCount] = useState(() =>
    getLiveCount("apex-driveos-notifications", (n) => !n.isRead),
  );
  const [leadCount, setLeadCount] = useState(() =>
    getLiveCount("apex-driveos-leads", (l) => l.status === "new_inquiry"),
  );
  const [serviceCount, setServiceCount] = useState(() =>
    getLiveCount(
      "apex-driveos-service",
      (o) => o.status === "pending" || o.status === "in_progress",
    ),
  );

  // ── Mobile auto-collapse on route change ─────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth < 1024 && sidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  // ── FIX: single unified useEffect for ALL count updates ──────────────────────
  // Previously there were two separate useEffects both registering listeners
  // for the same events (apex-driveos-cars-updated, apex-driveos-users-updated,
  // apex-driveos-notifications-updated) — every handler was firing TWICE per event.
  // Merged into one, with clean removal of all listeners on unmount.
  useEffect(() => {
    const onCars = () =>
      setInventoryCount(
        getLiveCount("apex-driveos-cars", (c) => c.status === "available"),
      );
    const onBookings = () =>
      setTestDriveCount(
        getLiveCount("apex-driveos-bookings", (b) => b.status === "pending"),
      );
    const onUsers = () => setUserCount(getLiveCount("apex-driveos-users"));
    const onNotifs = () =>
      setNotifCount(
        getLiveCount("apex-driveos-notifications", (n) => !n.isRead),
      );

    const onLeads = () =>
      // ← ADD
      setLeadCount(
        getLiveCount("apex-driveos-leads", (l) => l.status === "new_inquiry"),
      );
    const onService = () =>
      setServiceCount(
        getLiveCount(
          "apex-driveos-service",
          (o) => o.status === "pending" || o.status === "in_progress",
        ),
      );

    // Count update via custom event (explicit count in detail)
    const onCountUpdate = (e) => {
      if (e.detail?.count !== undefined) setNotifCount(e.detail.count);
    };

    // Count update via localStorage storage event (cross-tab)
    const onStorage = (e) => {
      if (e.key === "apex-driveos-notifications") {
        const notifs = loadNotifications();
        setNotifCount(notifs.filter((n) => !n.isRead).length);
      }
    };

    window.addEventListener("apex-driveos-cars-updated", onCars);
    window.addEventListener("apex-driveos-bookings-updated", onBookings);
    window.addEventListener("apex-driveos-users-updated", onUsers);
    window.addEventListener("apex-driveos-notifications-updated", onNotifs);
    window.addEventListener("apex-driveos-leads-updated", onLeads);
    window.addEventListener("apex-driveos-notif-count-updated", onCountUpdate);
    window.addEventListener("apex-driveos-service-updated", onService);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("apex-driveos-cars-updated", onCars);
      window.removeEventListener("apex-driveos-bookings-updated", onBookings);
      window.removeEventListener("apex-driveos-users-updated", onUsers);
      window.removeEventListener("apex-driveos-service-updated", onService);
      window.removeEventListener(
        "apex-driveos-notifications-updated",
        onNotifs,
      );
      window.removeEventListener("apex-driveos-leads-updated", onLeads);
      window.removeEventListener(
        "apex-driveos-notif-count-updated",
        onCountUpdate,
      );
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // ── Badge resolver ────────────────────────────────────────────────────────────
  const getBadge = (item) => {
    if (item.path === "/notifications")
      return notifCount > 0 ? String(notifCount) : null;
    if (item.path === "/inventory")
      return inventoryCount > 0 ? String(inventoryCount) : null;
    if (item.path === "/test-drives")
      return testDriveCount > 0 ? String(testDriveCount) : null;
    if (item.path === "/users") return userCount > 0 ? String(userCount) : null;
    if (item.path === "/service")
      return serviceCount > 0 ? String(serviceCount) : null;
    if (item.path === "/leads")
      // ← ADD
      return leadCount > 0 ? String(leadCount) : null;
    return item.badge || null;
  };

  // ── Nav structure ─────────────────────────────────────────────────────────────
  const NAV_SECTIONS = [
    {
      label: "Main",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: UsersIcon, label: "Users", path: "/users" },
        { icon: Car, label: "Inventory", path: "/inventory" },
        { icon: Users, label: "Customers", path: "/customers" },
        { icon: TrendingUp, label: "Leads", path: "/leads" },
        { icon: Wrench, label: "Service", path: "/service" },
        { icon: CalendarCheck, label: "Test Drives", path: "/test-drives" },
      ],
    },
    {
      label: "Finance",
      items: [
        { icon: FileText, label: "Invoices", path: "/invoices" },
        { icon: Tag, label: "Promotions", path: "/promotions" },
        { icon: BarChart2, label: "Analytics", path: "/analytics" },
        { icon: FileChartColumnIncreasing, label: "Reports", path: "/reports" },
      ],
    },
    {
      label: "System",
      items: [
        { icon: Bell, label: "Notifications", path: "/notifications" },

        { icon: Settings, label: "Settings", path: "/settings" },
      ],
    },
  ];

  const isOpen = isMobile ? true : sidebarOpen;

  const handleLogout = () => {
    logout();
    apexToast.info("Logged Out", "You have been signed out successfully.");
    navigate("/login");
  };

  // ── Inner sidebar content (shared between desktop + mobile) ──────────────────
  const SidebarContent = () => (
    <>
      {/* ── Logo — BUG-1 FIX: was brand="product" (static), now
          brand="product-current" so the custom company logo from
          Settings → Company actually reflects here ── */}
      <div className="flex items-center gap-4 px-1 py-5">
        <div
          className={clsx(
            "flex items-center flex-shrink-0 transition-all duration-300",
            sidebarOpen ? "w-12 h-12 justify-center" : "w-8 h-8 justify-start",
          )}
        >
          <BrandLogo
            brand="product-current"
            variant="icon"
            className="w-full h-full object-contain"
          />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-black tracking-[0.1em] text-gold-gradient">
                {company.name}
              </p>
              <p className="text-[10px] tracking-[0.1em] text-text-subtle uppercase mt-0.5">
                {company.isCustomBranding
                  ? company.tagline || "Luxury Automotive"
                  : "Luxury Automotive"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav Sections ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
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

            {section.items.map((item, i) => {
              const isActive = location.pathname === item.path;
              const badge = getBadge(item);
              return (
                <Tooltip
                  key={item.path}
                  content={
                    !isOpen
                      ? badge
                        ? `${item.label} (${badge})`
                        : item.label
                      : null
                  }
                  side="right"
                >
                  <motion.button
                    onClick={() => navigate(item.path)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={clsx(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "transition-all duration-200 relative group mb-0.5",
                      !isOpen && "justify-center bg-transparent",
                      isActive
                        ? "bg-gold/10 text-text-primary"
                        : "text-text-muted hover:bg-gold/5 hover:text-text-primary",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className={clsx(
                          "absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-gold to-gold-light rounded-r-full",
                          !isOpen && "w-0",
                        )}
                      />
                    )}

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

                          {badge && (
                            <span
                              className="text-[9px] font-bold bg-gold/15 text-gold
                                         px-2 py-0.5 rounded-full ml-auto"
                            >
                              {badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Collapsed tooltip */}
                    {!isOpen && (
                      <div
                        className="absolute left-full ml-3 px-2.5 py-1.5 bg-card
                                   border border-border rounded-lg text-xs font-medium
                                   text-text-primary whitespace-nowrap opacity-0 pointer-events-none
                                   group-hover:opacity-100 transition-opacity duration-200 z-50
                                   shadow-card"
                      >
                        {item.label}
                        {badge && (
                          <span className="ml-2 text-gold">{badge}</span>
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

      {/* ── Bottom: Nexora footer + User Card + Logout ── */}
      <div className="mt-auto pt-4 border-t border-border space-y-2">
        <SidebarFooterBrand />

        {/* User info card */}
        <Tooltip
          content={!isOpen ? `${user?.name} · Admin` : null}
          side="right"
        >
          <div
            className={clsx(
              "flex items-center gap-3 p-2.5 rounded-xl",
              "bg-gold/[0.04] border border-gold/[0.08]",
              !isOpen && "justify-center bg-transparent border-none",
            )}
          >
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

  // ── MOBILE: Full drawer ───────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
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

  // ── DESKTOP: Floating sidebar ─────────────────────────────────────────────────
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

      {/* Collapse / Expand toggle */}
      <motion.button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 -translate-y-1/2
                   w-6 h-6 rounded-full bg-card border border-border
                   flex items-center justify-center
                   text-text-muted hover:text-gold hover:border-gold/40
                   transition-colors duration-200 z-30 shadow-card"
        animate={{ rotate: sidebarOpen ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronLeft size={13} />
      </motion.button>
    </motion.aside>
  );
}

export default Sidebar;
