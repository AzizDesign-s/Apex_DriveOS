// src/components/ui/skeletons/DrawerSkeleton.jsx
//
// Mirrors a Detail Drawer — avatar header, KPI pills, section rows.
// Used inside drawer bodies if/when a record needs to be fetched async.

import SkeletonBase from "./SkeletonBase";

function DrawerSkeleton() {
  return (
    <div className="px-2 py-4">
      {/* Header block */}
      <div className="flex items-start gap-4 px-2 pb-4 border-b border-border mb-4">
        <SkeletonBase
          className="w-14 h-14 flex-shrink-0"
          rounded="rounded-2xl"
        />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <SkeletonBase className="h-4 w-2/3" />
          <SkeletonBase className="h-3 w-1/3" />
        </div>
      </div>

      {/* KPI pills */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-base border border-border rounded-xl p-3 flex flex-col items-center gap-2"
          >
            <SkeletonBase className="h-2.5 w-12" />
            <SkeletonBase className="h-4 w-8" />
          </div>
        ))}
      </div>

      {/* Detail rows */}
      <SkeletonBase className="h-2.5 w-32 mb-3" />
      <div className="grid grid-cols-2 gap-2 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-base border border-border rounded-xl p-3 flex flex-col gap-1.5"
          >
            <SkeletonBase className="h-2 w-14" />
            <SkeletonBase className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Timeline-style section */}
      <SkeletonBase className="h-2.5 w-28 mb-3" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 mb-3">
          <SkeletonBase
            className="w-7 h-7 flex-shrink-0"
            rounded="rounded-lg"
          />
          <div className="flex-1 flex flex-col gap-1.5">
            <SkeletonBase className="h-3 w-3/4" />
            <SkeletonBase className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default DrawerSkeleton;
