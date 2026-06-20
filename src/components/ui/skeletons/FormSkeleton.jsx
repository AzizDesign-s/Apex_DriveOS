// src/components/ui/skeletons/FormSkeleton.jsx
//
// Mirrors a FormPage's tabbed layout — header, tab bar, field groups.

import SkeletonBase from "./SkeletonBase";

function FormSkeleton({ fields = 5 }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-9 h-9" rounded="rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <SkeletonBase className="h-3.5 w-40" />
            <SkeletonBase className="h-2.5 w-28" />
          </div>
        </div>
        <SkeletonBase className="h-9 w-28" rounded="rounded-xl" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-4 px-4 py-3 border-b border-border flex-shrink-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBase key={i} className="h-3.5 w-24" />
        ))}
      </div>

      {/* Form fields */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="bg-card border border-border rounded-2xl p-5">
          <SkeletonBase className="h-3 w-32 mb-4" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: fields }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <SkeletonBase className="h-2.5 w-20" />
                <SkeletonBase className="h-9 w-full" rounded="rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormSkeleton;
