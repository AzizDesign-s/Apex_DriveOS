// src/components/activity/ActivityEmptyState.jsx

import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

function ActivityEmptyState({ filtered = false }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(212,175,55,0.08)" }}
      >
        <ClipboardList size={22} className="text-gold/50" />
      </div>
      <p className="text-sm font-bold text-text-primary mb-1">
        {filtered ? "No matching activity" : "No activity yet"}
      </p>
      <p className="text-[11px] text-text-subtle max-w-xs leading-relaxed">
        {filtered
          ? "Try adjusting your module filter or sort order."
          : "Activity logs will appear here as your team performs actions across all modules."}
      </p>
    </motion.div>
  );
}

export default ActivityEmptyState;
