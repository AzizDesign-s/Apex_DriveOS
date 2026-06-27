// src/components/leads/LeadKanban.jsx
// The full Kanban board — 6 columns with drag-and-drop between them.
//
// DRAG AND DROP ARCHITECTURE (@dnd-kit):
//   DndContext      — root context, handles all drag events
//   DragOverlay     — renders a floating clone of the card being dragged
//                     (prevents layout shift in the source column)
//   SortableContext — per column, makes cards sortable within it
//   useDroppable    — per column (in LeadColumn), accepts drops
//   useSortable     — per card (in LeadCard), makes it draggable
//
// DRAG FLOW:
//   onDragStart → capture the active lead id
//   onDragOver  → detect which column the card is hovering over
//   onDragEnd   → commit the move: update lead status + call onLeadMove
//
// Cross-module sync (car status, customer creation) is handled by
// the parent Leads.jsx via the onLeadMove callback — this component
// only manages the visual board state.

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import LeadColumn from "./LeadColumn";
import LeadCard from "./LeadCard";
import { LEAD_COLUMNS } from "../../data/mockLeads";

function LeadKanban({ leads, onLeadMove, onView, onAddLead }) {
  // ── Active drag state ─────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState(null);

  // The lead object currently being dragged — used by DragOverlay
  const activeLead = useMemo(
    () => leads.find((l) => String(l.id) === activeId) || null,
    [activeId, leads],
  );

  // ── Sensors ───────────────────────────────────────────────────────────────
  // PointerSensor with a small activation distance prevents accidental
  // drags when the user just clicks a card to open the detail drawer.
  // Without activationConstraint, any mousedown starts a drag,
  // which would prevent the onClick on LeadCard from firing.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // px — must move 6px before drag starts
      },
    }),
  );

  // ── Group leads by column ─────────────────────────────────────────────────
  const columnLeads = useMemo(() => {
    const map = {};
    LEAD_COLUMNS.forEach((col) => {
      map[col.id] = [];
    });
    leads.forEach((lead) => {
      if (map[lead.status]) map[lead.status].push(lead);
    });
    return map;
  }, [leads]);

  // ── Find which column a lead is in ───────────────────────────────────────
  const findColumnOfLead = (leadId) => {
    for (const col of LEAD_COLUMNS) {
      if (columnLeads[col.id]?.some((l) => String(l.id) === leadId)) {
        return col.id;
      }
    }
    return null;
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => {
    setActiveId(String(active.id));
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;

    const activeLeadId = String(active.id);
    const overId = String(over.id);

    const activeColId = findColumnOfLead(activeLeadId);

    // Determine if we're over a column directly or over another card
    const overColId = LEAD_COLUMNS.find((c) => c.id === overId)
      ? overId
      : findColumnOfLead(overId);

    // Same column — no cross-column logic needed here
    // (reordering within same column handled by onDragEnd)
    if (!activeColId || !overColId || activeColId === overColId) return;
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const activeLeadId = String(active.id);
    const overId = String(over.id);

    const activeColId = findColumnOfLead(activeLeadId);

    // Determine destination column
    const destColId = LEAD_COLUMNS.find((c) => c.id === overId)
      ? overId
      : findColumnOfLead(overId);

    if (!activeColId || !destColId) return;

    if (activeColId === destColId) {
      // ── Reorder within same column ────────────────────────────────────
      // We don't persist sort order (leads are sorted by createdAt in Leads.jsx)
      // so we just ignore same-column reorders.
      // If you want persistent ordering, this is where to add it.
      return;
    }

    // ── Move to different column = status change ───────────────────────
    const lead = leads.find((l) => String(l.id) === activeLeadId);
    if (!lead) return;

    // Notify parent — parent handles localStorage + cross-module sync
    onLeadMove(lead, activeColId, destColId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* ── Board: horizontal scroll ── */}
      <div className="flex gap-4 h-full overflow-x-auto pb-2 scrollbar-none">
        {LEAD_COLUMNS.map((column) => (
          <LeadColumn
            key={column.id}
            column={column}
            leads={columnLeads[column.id] || []}
            onView={onView}
            onAddLead={onAddLead}
            allLeads={leads}
          />
        ))}
      </div>

      {/* ── Drag overlay — floating ghost card ── */}
      <DragOverlay>
        {activeLead ? (
          <motion.div
            initial={{ scale: 1.02, rotate: 1 }}
            className="rotate-1 shadow-glass"
          >
            <LeadCard
              lead={activeLead}
              onView={() => {}}
              isCarReservedByOther={false}
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default LeadKanban;
