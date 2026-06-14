// src/components/invoices/InvoiceStats.jsx

import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Coins,
  XCircle,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import clsx from "clsx";

const PILLS = [
  {
    key: "total",
    label: "Total",
    icon: FileText,
    iconClass: "bg-gold/10 text-gold",
  },
  {
    key: "paid",
    label: "Paid",
    icon: CheckCircle,
    iconClass: "bg-emerald-400/10 text-emerald-400",
  },
  {
    key: "overdue",
    label: "Overdue",
    icon: AlertCircle,
    iconClass: "bg-rose-400/10 text-rose-400",
  },
  {
    key: "sent",
    label: "Sent",
    icon: Send,
    iconClass: "bg-sky-accent/10 text-sky-accent",
  },
  {
    key: "partially_paid",
    label: "Part. Paid",
    icon: Coins,
    iconClass: "bg-violet-400/10 text-violet-400",
  },
  {
    key: "draft",
    label: "Draft",
    icon: FileText,
    iconClass: "bg-text-subtle/10 text-text-subtle",
  },
  {
    key: "revenue",
    label: "Revenue",
    icon: DollarSign,
    iconClass: "bg-gold/10 text-gold",
    isAmount: true,
  },
];

function InvoiceStats({ stats = {} }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PILLS.map(({ key, label, icon: Icon, iconClass, isAmount }, i) => (
        <motion.div
          key={key}
          className="flex items-center gap-3 bg-card border border-border rounded-xl
                     px-3 py-2.5 flex-1 min-w-[90px]
                     hover:border-gold/20 transition-colors cursor-default"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <div
            className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              iconClass,
            )}
          >
            <Icon size={15} />
          </div>
          <div>
            <p
              className="text-[9px] font-bold tracking-[0.2em] text-text-subtle
                          uppercase leading-none mb-1"
            >
              {label}
            </p>
            <p className="text-sm font-extrabold text-text-primary leading-none">
              {isAmount
                ? `AED ${
                    stats[key] >= 1000000
                      ? `${(stats[key] / 1000000).toFixed(1)}M`
                      : (stats[key] || 0).toLocaleString()
                  }`
                : (stats[key] ?? 0)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default InvoiceStats;
