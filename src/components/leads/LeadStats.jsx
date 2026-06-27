// src/components/leads/LeadStats.jsx
// 4 KPI pills above the Kanban board.
// Same pattern as other module Stats components.

import { motion } from "framer-motion";
import clsx from "clsx";

function LeadStats({ leads }) {
  const total = leads.length;
  const newInquiry = leads.filter((l) => l.status === "new_inquiry").length;
  const active = leads.filter((l) =>
    ["contacted", "interested", "reserved"].includes(l.status),
  ).length;
  const won = leads.filter((l) => l.status === "won").length;
  const lost = leads.filter((l) => l.status === "lost").length;
  const conversion = total > 0 ? Math.round((won / total) * 100) : 0;

  const stats = [
    { label: "Total Leads", value: total, color: "text-text-primary" },
    { label: "New Inquiries", value: newInquiry, color: "text-sky-accent" },
    { label: "Active", value: active, color: "text-gold" },
    { label: "Conversion", value: `${conversion}%`, color: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bg-card border border-border rounded-xl px-4 py-3
                     flex items-center justify-between"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
            {s.label}
          </p>
          <p className={clsx("text-xl font-extrabold", s.color)}>{s.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default LeadStats;
