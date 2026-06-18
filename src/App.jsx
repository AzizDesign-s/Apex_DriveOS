// src/App.jsx
// Complete file — all fixes applied

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAppStore from "./store/useAppStore";
import { TooltipProvider } from "./components/ui/Tooltip";
import AppLayout from "./components/layout/AppLayout";
import SplashScreen from "./components/ui/SplashScreen";
import { useState } from "react";
import ToastConfig from "./components/ui/ToastConfig";

// ── Page imports ──────────────────────────────────────────────────────────────
// Not lazy-loaded yet (Phase 3 will evaluate lazy loading per route)
// All imported directly for Sprint 1.1 stability
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import TestDrives from "./pages/TestDrives";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

// ── Auth guards ───────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAppStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAppStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

// ── Loading fallback ──────────────────────────────────────────────────────────
// BUG-060 FIX: shown while any lazy component loads or Suspense boundary catches
function LoadingFallback() {
  return (
    <div className="fixed inset-0 bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 animate-spin"
          style={{
            background: "linear-gradient(135deg,#B8931F,#D4AF37,#E8C84A)",
            clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
          }}
        />
        <p className="text-[10px] text-text-subtle tracking-[0.3em] uppercase font-semibold">
          Loading...
        </p>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return (
      <>
        <ToastConfig />
        <SplashScreen onComplete={() => setSplashDone(true)} />
      </>
    );
  }

  return (
    <>
      <BrowserRouter>
        <TooltipProvider>
          <ToastConfig />
          {/* BUG-060 FIX: Suspense boundary prevents full crash */}
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* ── Public routes ── */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* ── Protected routes ── */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="customers" element={<Customers />} />
                <Route path="test-drives" element={<TestDrives />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* BUG-059 FIX: catch-all — redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
