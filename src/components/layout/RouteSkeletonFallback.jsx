// src/components/layout/RouteSkeletonFallback.jsx
//
// Replaces the generic spinner in App.jsx's Suspense fallback with a
// destination-shaped skeleton, based on the current route.

import { useLocation } from "react-router-dom";
import { TableSkeleton, CardSkeleton, ChartSkeleton } from "../ui/skeletons";

const TABLE_ROUTES = [
  "/inventory",
  "/customers",
  "/users",
  "/invoices",
  "/test-drives",
];
const DASHBOARD_LIKE_ROUTES = ["/dashboard", "/analytics", "/reports"];

function RouteSkeletonFallback() {
  const location = useLocation();
  const path = location.pathname;

  if (TABLE_ROUTES.includes(path)) {
    return (
      <div className="flex flex-col gap-3 h-full p-3">
        <CardSkeleton count={4} />
        <TableSkeleton rows={7} columns={5} />
      </div>
    );
  }

  if (DASHBOARD_LIKE_ROUTES.includes(path)) {
    return (
      <div className="flex flex-col gap-4 h-full p-3">
        <CardSkeleton count={4} />
        <ChartSkeleton variant="bar" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton variant="bar" height={160} />
          <ChartSkeleton variant="donut" height={160} />
        </div>
      </div>
    );
  }

  // Settings, Roles-in-Settings, or any unmatched route — simple generic spinner
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

export default RouteSkeletonFallback;
