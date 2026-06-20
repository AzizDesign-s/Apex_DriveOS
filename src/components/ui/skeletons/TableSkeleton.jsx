// src/components/ui/skeletons/TableSkeleton.jsx
//
// Mirrors the actual table chrome (header bar, rows with avatar+text pattern,
// pagination footer) so the layout doesn't jump when real data arrives.

import { motion } from "framer-motion";
import SkeletonBase from "./SkeletonBase";

function TableSkeleton({ rows = 6, columns = 5, showAvatar = true }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
      {/* Toolbar-shaped placeholder */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <SkeletonBase className="w-3.5 h-3.5" rounded="rounded" />
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBase key={i} className="h-3 flex-1 max-w-[100px]" />
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1">
        {Array.from({ length: rows }).map((_, r) => (
          <motion.div
            key={r}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 last:border-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: r * 0.04 }}
          >
            <SkeletonBase
              className="w-3.5 h-3.5 flex-shrink-0"
              rounded="rounded"
            />
            {showAvatar && (
              <SkeletonBase
                className="w-9 h-9 flex-shrink-0"
                rounded="rounded-xl"
              />
            )}
            <div className="flex-1 flex flex-col gap-1.5">
              <SkeletonBase className="h-3 w-2/5" />
              <SkeletonBase className="h-2.5 w-1/3" />
            </div>
            {Array.from({ length: Math.max(0, columns - 2) }).map((_, c) => (
              <SkeletonBase
                key={c}
                className="h-3 w-16 flex-shrink-0 hidden sm:block"
              />
            ))}
            <SkeletonBase
              className="w-20 h-6 flex-shrink-0"
              rounded="rounded-full"
            />
          </motion.div>
        ))}
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <SkeletonBase className="h-2.5 w-32" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBase key={i} className="w-7 h-7" rounded="rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TableSkeleton;
