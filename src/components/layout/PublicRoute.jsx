// src/components/layout/PublicRoute.jsx
//
// ─── WHY THIS EXISTS ─────────────────────────────────────────────────────────
// This is the opposite of ProtectedRoute.
// It wraps /login so that if an already-authenticated user tries to
// visit /login (by typing it manually or using the back button after logout),
// they get redirected to /dashboard instead.
//
// Without this, a logged-in user can visit /login which is confusing UX.
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet } from "react-router-dom";
import useAppStore from "../../store/useAppStore";

function PublicRoute() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Already logged in → send to dashboard, not login
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
