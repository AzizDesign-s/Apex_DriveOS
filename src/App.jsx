import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ToastConfig from "./components/ui/ToastConfig";
import ProtectedRoute from "./components/layout/ProtectRoute";
import PublicRoute from "./components/layout/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <BrowserRouter>
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
            {/* All future pages go here — they're all auto-protected */}
          </Route>
        </Route>

        {/* ── Fallback — unknown URLs go to login ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
