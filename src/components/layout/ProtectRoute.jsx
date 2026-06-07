// src/components/layout/ProtectedRoute.jsx
//
// ─── WHY THIS EXISTS ─────────────────────────────────────────────────────────
// This component wraps any route that requires the user to be logged in.
// It checks Zustand (which now reads from localStorage on startup).
//
// Two cases:
//   isAuthenticated = true  → render the page normally
//   isAuthenticated = false → redirect to /login immediately
//
// Without this, someone could manually type /dashboard in the URL
// and reach it without logging in.
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet } from "react-router-dom";
import useAppStore from "../../store/useAppStore";

function ProtectedRoute() {
  // Read auth state from Zustand (already rehydrated from localStorage)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // If not logged in → kick to login page
  // 'replace' means the login page replaces the history entry so
  // pressing Back doesn't loop them back to the protected page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in → render whatever child route is matched
  // <Outlet /> is React Router's way of saying "render the child route here"
  return <Outlet />;
}

export default ProtectedRoute;
