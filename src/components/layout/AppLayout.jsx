// src/components/layout/AppLayout.jsx
//
// ─── WHAT THIS FILE DOES ──────────────────────────────────────────────────────
// This is the master wrapper that holds ALL protected pages together.
// Structure:
//
//   AppLayout
//   ├── Sidebar (desktop — floats absolutely)
//   ├── Sidebar (mobile — drawer, conditionally rendered)
//   └── Main area
//       ├── Navbar
//       └── <Outlet /> ← React Router renders the active page here
//
// WHY <Outlet />?
//   React Router's <Outlet> is a placeholder. When the URL is /dashboard,
//   React Router puts <Dashboard /> in place of <Outlet />.
//   When URL changes to /inventory, it puts <Inventory /> there instead.
//   The Sidebar and Navbar stay mounted — only the content area swaps.
//
// WHY position:relative on the outer div?
//   The desktop Sidebar uses position:absolute to float.
//   It needs a positioned parent to anchor to — that's this div.
// ─────────────────────────────────────────────────────────────────────────────

import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useAppStore from "../../store/useAppStore";

const AppLayout = () => {
  const location = useLocation();
  const { sidebarOpen } = useAppStore();

  // How much to push the main content right based on sidebar state
  // Desktop: 240px expanded, 72px collapsed + 12px gap on each side
  const mainMargin = sidebarOpen ? "lg:ml-[252px]" : "lg:ml-[84px]";
  return (
    // Outer shell — full viewport, relative so sidebar can float inside it
    <div className="relative flex min-h-screen bg-base overflow-hidden">
      {/* ── Desktop Sidebar (floats absolutely) ── */}
      <div className="hidden lg:block">
        <Sidebar isMobile={false} />
      </div>

      {/* ── Mobile Sidebar (drawer overlay) ── */}
      <div className="lg:hidden">
        <Sidebar isMobile={true} />
      </div>

      {/* ── Main content area ── */}
      {/*  margin-left pushes content away from the floating sidebar  */}
      {/*  transition makes it animate smoothly when sidebar collapses  */}

      <div
        className={`flex flex-col flex-1 min-w-0 min-h-screen
        transition-all duration-300 ease-in-out
        ${mainMargin}`}
      >
        {/* Top navbar */}
        <Navbar />

        {/* Page content — Outlet renders the active page here */}

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 pt-4">
          {/*
            AnimatePresence + motion.div here creates a page transition:
            When the URL changes, the old page fades out while the new one fades in.
            key={location.pathname} tells AnimatePresence that a new page
            is mounting whenever the URL changes.
          */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
