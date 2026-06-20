// src/components/dashboard/AlertsPanel.jsx

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import AlertCard from "./AlertCard";

function AlertsPanel({ alerts = [], onAction }) {
  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-5 flex-shrink-0"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-text-primary">
            Action Alerts
          </h3>
          <p className="text-[10px] text-text-subtle mt-0.5">
            Things that need your attention right now
          </p>
        </div>
        {alerts.length > 0 && (
          <span className="text-[10px] font-bold bg-rose-400/10 text-rose-400 px-2 py-1 rounded-full">
            {alerts.length} active
          </span>
        )}
      </div>

      {alerts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <AnimatePresence mode="popLayout">
            {alerts.map((alert, i) => (
              <AlertCard
                key={alert.key}
                alert={alert}
                onAction={onAction}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-3">
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-text-primary">All clear</p>
          <p className="text-[10px] text-text-subtle mt-1">
            No alerts need your attention right now
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default AlertsPanel;
