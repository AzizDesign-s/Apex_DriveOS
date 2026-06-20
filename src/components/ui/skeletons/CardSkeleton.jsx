// src/components/ui/skeletons/CardSkeleton.jsx
//
// Mirrors the StatCard / ReportSummaryCard / DashboardInsightCard shape —
// icon badge top-right, label, big value, optional sub-line.

import SkeletonBase from "./SkeletonBase";

function CardSkeleton({ count = 4, variant = "stat" }) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-${Math.min(count, 4)} gap-3`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <SkeletonBase className="h-2.5 w-16" />
            <SkeletonBase
              className="w-8 h-8 flex-shrink-0"
              rounded="rounded-lg"
            />
          </div>
          <SkeletonBase className="h-6 w-20" />
          {variant === "stat" && <SkeletonBase className="h-2.5 w-24" />}
        </div>
      ))}
    </div>
  );
}

export default CardSkeleton;
