import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ToastConfig from "./components/ui/ToastConfig";
import { TooltipProvider } from "./components/ui/Tooltip";
import ProtectedRoute from "./components/layout/ProtectRoute";
import PublicRoute from "./components/layout/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import TestDrives from "./pages/TestDrives";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

import Notifications from "./pages/Notifications";

const App = () => {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <ToastConfig />

        <Routes>
          {/* ── Public routes (redirect to dashboard if already logged in) ── */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* ── Protected routes (redirect to login if not authenticated) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customers" element={<Customers />} />
              <Route path="test-drives" element={<TestDrives />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              {/* All future pages go here — they're all auto-protected */}
            </Route>
          </Route>

          {/* ── Fallback — unknown URLs go to login ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;
