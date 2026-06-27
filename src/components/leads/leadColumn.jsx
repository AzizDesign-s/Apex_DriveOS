// src/components/leads/LeadColumn.jsx
// A single droppable Kanban column.
// Uses @dnd-kit/sortable's SortableContext to make cards
// reorderable within the column AND accept drops from other columns.
//
// VISUAL:
//   — Column header: colored dot + label + count
//   — Scrollable card list
//   — Drop zone highlight when dragging over

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import LeadCard from "./LeadCard";
import clsx from "clsx";

function LeadColumn({
  column,
  leads,
  onView,
  onAddLead,
  reservedCarIds = new Set(),
  allLeads = [],
}) {
  // ── @dnd-kit droppable ────────────────────────────────────────────────────
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  // A card should show the "car reserved" warning if:
  // — its car is in the reservedCarIds set (reserved by ANOTHER lead)
  // — AND this lead is NOT the one that reserved it (i.e. not in reserved/won column)
  const isCarReservedByOther = (lead) => {
    if (!lead.interestedCarId) return false;
    if (lead.status === "reserved" || lead.status === "won") return false;
    // Check if any OTHER lead has reserved this car
    return allLeads.some(
      (l) =>
        l.id !== lead.id &&
        l.interestedCarId === lead.interestedCarId &&
        l.status === "reserved",
    );
  };

  const cardIds = leads.map((l) => String(l.id));

  return (
    <div className="flex flex-col w-[280px] flex-shrink-0 h-full">
      {/* ── Column header ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {/* Colored dot */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: column.color }}
          />
          <h3 className="text-xs font-bold text-text-primary">
            {column.label}
          </h3>
          {/* Lead count badge */}
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: `${column.color}18`,
              color: column.color,
            }}
          >
            {leads.length}
          </span>
        </div>

        {/* Add lead to this column — only for new_inquiry */}
        {column.id === "new_inquiry" && (
          <button
            onClick={() => onAddLead(column.id)}
            className="w-6 h-6 rounded-lg border border-border flex items-center
                       justify-center text-text-subtle hover:text-gold
                       hover:border-gold/40 transition-all"
            title="Add new lead"
            aria-label="Add new lead"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {/* ── Drop zone ── */}
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 rounded-2xl p-2 transition-all duration-200 overflow-y-auto",
          "scrollbar-none min-h-[200px]",
          isOver
            ? "bg-gold/[0.04] border border-gold/20"
            : "bg-base/40 border border-border",
        )}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onView={onView}
                  isCarReservedByOther={isCarReservedByOther(lead)}
                />
              ))}
            </AnimatePresence>

            {/* Empty column placeholder */}
            {leads.length === 0 && (
              <motion.div
                className="flex flex-col items-center justify-center py-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: `${column.color}12` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: `${column.color}40` }}
                  />
                </div>
                <p className="text-[12px] text-text-subtle font-medium">
                  No leads here
                </p>
                <p className="text-[10px] text-text-subtle/60 mt-0.5">
                  {column.description}
                </p>
              </motion.div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default LeadColumn;
