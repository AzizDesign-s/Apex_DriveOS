// src/components/ErrorBoundary.jsx
// Sprint 4 Phase 10 — Global error boundary.
//
// WHY A CLASS COMPONENT:
// React error boundaries MUST be class components — there is no
// hook equivalent for componentDidCatch. This is the one place
// in the codebase where we use a class component intentionally.
//
// TWO VARIANTS via the `variant` prop:
//   "app"  — for the protected app shell (dark, full-screen)
//   "auth" — for the login page (same dark bg, simpler message)
//
// RECOVERY OPTIONS shown to the user:
//   1. Refresh the page     — clears React state, re-mounts everything
//   2. Clear page data      — wipes the specific localStorage key for
//                             the crashed module, then refreshes
//                             (last resort — shouldn't lose critical data
//                              since everything is also in seed mockData)
//   3. Go to Dashboard      — navigate away from the broken page
//                             (only shown in "app" variant)
//
// ERROR REPORTING:
//   Logs to console in development.
//   In production you'd replace console.error with a real
//   error reporting service (Sentry, LogRocket, etc.)

import { Component } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // Fires when a descendant component throws during render,
  // lifecycle methods, or constructors.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Fires after getDerivedStateFromError — gives us the component
  // stack trace for debugging.
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(
      "[Apex DriveOS] Render error caught by ErrorBoundary:",
      error,
    );
    console.error("Component stack:", errorInfo.componentStack);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  // Clears ALL apex-driveos-* localStorage keys for domain data
  // (keeps UI preference keys: cols, saved-filters, etc.)
  // Then refreshes so the app re-seeds from mockData.js
  handleClearData = () => {
    const domainKeys = [
      "apex-driveos-cars",
      "apex-driveos-customers",
      "apex-driveos-bookings",
      "apex-driveos-invoices",
      "apex-driveos-users",
      "apex-driveos-roles",
      "apex-driveos-notifications",
      "apex-driveos-activity",
      "apex-driveos-leads",
      "apex-driveos-service",
      "apex-driveos-promotions",
    ];
    domainKeys.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  handleDashboard = () => {
    // Reset error state and navigate to dashboard
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/dashboard";
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, variant = "app" } = this.props;

    if (!hasError) return children;

    const isApp = variant === "app";
    const isDev = import.meta.env.DEV;

    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Error icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl bg-rose-400/10 border
                            border-rose-400/20 flex items-center justify-center"
            >
              <AlertTriangle size={28} className="text-rose-400" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-extrabold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-text-subtle leading-relaxed">
              {isApp
                ? "Apex DriveOS encountered an unexpected error. Your data is safe — this is a display issue only."
                : "The login page encountered an error. Refreshing usually fixes this."}
            </p>
          </div>

          {/* Error detail — dev only */}
          {isDev && error && (
            <div
              className="mb-6 bg-rose-400/[0.06] border border-rose-400/20
                            rounded-xl p-4 overflow-auto max-h-32"
            >
              <p
                className="text-[10px] font-bold text-rose-400 uppercase
                            tracking-wide mb-1"
              >
                Error (dev only)
              </p>
              <p className="text-[10px] text-rose-400/80 font-mono leading-relaxed">
                {error.message}
              </p>
              {errorInfo && (
                <p
                  className="text-[9px] text-text-subtle font-mono mt-2
                              leading-relaxed whitespace-pre-wrap"
                >
                  {errorInfo.componentStack?.slice(0, 300)}...
                </p>
              )}
            </div>
          )}

          {/* Recovery actions */}
          <div className="space-y-3">
            {/* Primary: refresh */}
            <button
              onClick={this.handleRefresh}
              className="w-full flex items-center justify-center gap-2.5
                         py-3 px-5 rounded-xl font-semibold text-sm
                         bg-gold text-base hover:bg-gold/90
                         transition-all active:scale-[0.98]"
            >
              <RefreshCw size={15} />
              Refresh Page
            </button>

            {/* App only: go to dashboard */}
            {isApp && (
              <button
                onClick={this.handleDashboard}
                className="w-full flex items-center justify-center gap-2.5
                           py-3 px-5 rounded-xl font-semibold text-sm
                           bg-card border border-border text-text-primary
                           hover:border-gold/30 hover:text-gold
                           transition-all active:scale-[0.98]"
              >
                <LayoutDashboard size={15} />
                Go to Dashboard
              </button>
            )}

            {/* Last resort: clear data */}
            <button
              onClick={this.handleClearData}
              className="w-full flex items-center justify-center gap-2.5
                         py-3 px-5 rounded-xl font-semibold text-sm
                         border border-border text-text-subtle
                         hover:border-rose-400/30 hover:text-rose-400
                         transition-all active:scale-[0.98]"
            >
              <Trash2 size={15} />
              Clear App Data & Restart
            </button>

            {/* Warning about clear data */}
            <p className="text-[9px] text-text-subtle text-center leading-relaxed">
              "Clear App Data" resets all records to seed data.
              <br />
              UI preferences (columns, filters, theme) are preserved.
            </p>
          </div>

          {/* Brand footer */}
          <p className="text-center text-[10px] text-text-subtle/50 mt-8 tracking-widest">
            APEX DRIVEOS · AjiX TECHNOLOGIES
          </p>
        </motion.div>
      </div>
    );
  }
}

export default ErrorBoundary;
