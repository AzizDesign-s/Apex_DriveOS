// src/components/ui/skeletons/ChartSkeleton.jsx
//
// Two shapes: 'bar' (fake bar chart silhouette) and 'donut' (fake pie).
// Mirrors RevenueChart / InventoryStatusChart containers.

import { motion } from "framer-motion";
import SkeletonBase from "./SkeletonBase";

function ChartSkeleton({ variant = "bar", height = 200, title = true }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      {title && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col gap-1.5">
            <SkeletonBase className="h-3.5 w-32" />
            <SkeletonBase className="h-2.5 w-24" />
          </div>
          <SkeletonBase className="h-3 w-20" />
        </div>
      )}

      {variant === "bar" && (
        <div className="flex items-end gap-2.5" style={{ height }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const h = 30 + Math.abs(Math.sin(i * 1.3)) * 65;
            return (
              <motion.div
                key={i}
                className="flex-1"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <SkeletonBase
                  className="w-full h-full"
                  rounded="rounded-t-md"
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {variant === "donut" && (
        <div className="flex items-center gap-4" style={{ height }}>
          <SkeletonBase
            className="w-32 h-32 flex-shrink-0"
            rounded="rounded-full"
          />
          <div className="flex-1 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonBase className="h-2.5 w-20" />
                <SkeletonBase className="h-2.5 w-8" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartSkeleton;
