// src/components/ui/FilterChip.jsx

import { motion } from "framer-motion";
import { X } from "lucide-react";

function FilterChip({ label, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full
                 bg-gold/8 border border-gold/25 text-[11px] font-semibold text-gold flex-shrink-0"
    >
      {label}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full flex items-center justify-center
                   hover:bg-gold/20 transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        <X size={10} />
      </button>
    </motion.div>
  );
}

export default FilterChip;
