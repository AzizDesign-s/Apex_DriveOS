// src/components/notifications/NotificationEmptyState.jsx

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

function NotificationEmptyState({ filtered = false }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-20 h-20 rounded-3xl bg-card border border-border
                      flex items-center justify-center mb-5"
      >
        <Bell size={32} className="text-text-subtle/30" />
      </div>
      <h3 className="text-base font-extrabold text-text-primary mb-2">
        {filtered ? "No matching notifications" : "All caught up!"}
      </h3>
      <p className="text-xs text-text-subtle max-w-xs leading-relaxed">
        {filtered
          ? "Try changing your filter or check back later."
          : "You have no notifications right now. New alerts for test drives, invoices and inventory will appear here."}
      </p>
    </motion.div>
  );
}

export default NotificationEmptyState;
