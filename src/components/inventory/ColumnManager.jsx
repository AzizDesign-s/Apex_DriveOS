// src/components/inventory/ColumnManager.jsx
// Toggle column visibility + drag to reorder.
// Uses @dnd-kit/sortable for drag reordering.

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Single sortable row ───────────────────────────────────────────────────────
function SortableCol({ col, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: col.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 px-2 py-2 rounded-lg
                 hover:bg-gold/5 transition-colors group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="text-text-subtle/40 hover:text-text-muted
                   cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical size={13} />
      </div>

      <span className="flex-1 text-xs text-text-muted">{col.label}</span>

      {/* Toggle */}
      {col.canHide ? (
        <button
          onClick={() => onToggle(col.id)}
          className={`transition-colors ${col.visible ? "text-gold" : "text-text-subtle/40"}`}
          aria-label={col.visible ? `Hide ${col.label}` : `Show ${col.label}`}
        >
          {col.visible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
      ) : (
        <span className="text-[9px] text-text-subtle/40 tracking-widest uppercase">
          Required
        </span>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function ColumnManager({ columns, onColumnsChange, isOpen, onClose }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const oldIdx = columns.findIndex((c) => c.id === active.id);
      const newIdx = columns.findIndex((c) => c.id === over.id);
      onColumnsChange(arrayMove(columns, oldIdx, newIdx));
    }
  };

  const handleToggle = (id) => {
    onColumnsChange(
      columns.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)),
    );
  };

  const visibleCount = columns.filter((c) => c.visible).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <motion.div
            className="absolute right-0 top-[calc(100%+6px)] w-64 z-20
                       bg-card border border-border rounded-xl shadow-glass overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-4 border-b border-border">
              <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
                Manage Columns
              </p>
              <span className="text-[9px] font-semibold text-gold">
                {visibleCount} visible
              </span>
            </div>

            <p className="px-3 py-3 text-[9px] text-text-subtle/60">
              Drag to reorder · Eye to show/hide
            </p>

            {/* Sortable list */}
            <div className="px-2 pb-3 flex flex-col gap-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columns.map((col) => (
                    <SortableCol
                      key={col.id}
                      col={col}
                      onToggle={handleToggle}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            {/* Reset */}
            <div className="px-3 py-2.5 border-t border-border">
              <button
                className="text-[10px] text-text-subtle hover:text-gold transition-colors"
                onClick={() =>
                  onColumnsChange(columns.map((c) => ({ ...c, visible: true })))
                }
              >
                Reset to default
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ColumnManager;
