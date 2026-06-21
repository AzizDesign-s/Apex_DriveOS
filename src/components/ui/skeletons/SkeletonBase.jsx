// src/components/ui/skeletons/SkeletonBase.jsx
//
// The shimmer building block every other skeleton composes from.
// Uses the same gold-tinted shimmer language as the rest of the app
// (subtle, not a generic gray pulse — matches the luxury aesthetic).

import { motion } from "framer-motion";
import clsx from "clsx";

function SkeletonBase({ className = "", rounded = "rounded-lg" }) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-base border border-border",
        rounded,
        className,
      )}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,55,0.06), transparent)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default SkeletonBase;
