// src/components/inventory/InventoryToolbar.jsx
//
// The main action bar above the table.
// Contains: search, filter trigger, column manager trigger,
//           3-dot more menu, and Add Car button.
// Also renders the bulk action bar when rows are selected.
//
// Props:
//   search, onSearch
//   filterCount, onFilterOpen
//   colMgrOpen, onColMgrToggle, columns, onColumnsChange
//   selected (Set), onClearSelected, onChangeStatus, onDeleteSelected
//   onRefresh, onExport, onAddCar

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Columns,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "../ui";
import MoreMenu from "../ui/MoreMenu";
import ColumnManager from "./ColumnManager";
import clsx from "clsx";

function InventoryToolbar({
  search,
  onSearch,
  filterCount = 0,
  onFilterOpen,
  colMgrOpen,
  onColMgrToggle,
  columns,
  onColumnsChange,
  selected,
  onClearSelected,
  onChangeStatus,
  onDeleteSelected,
  onRefresh,
  onExport,
  onAddCar,
}) {
  const hasSelection = selected?.size > 0;
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 ">
      {/* ── Bulk action bar — slides in when rows are selected ── */}
      {hasSelection && (
        <motion.div
          className="flex items-center gap-2 bg-gold/[0.04] border border-gold/15
                     rounded-xl px-4 py-2 "
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
        >
          {/* Count */}
          <span className="text-xs font-bold text-gold">
            {selected.size} car{selected.size > 1 ? "s" : ""} selected
          </span>

          <div className="flex-1" />

          <Button size="sm" variant="ghost" onClick={onClearSelected}>
            Clear
          </Button>
          <Button size="sm" variant="sky" onClick={onChangeStatus}>
            Change Status
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={onDeleteSelected}
          >
            Delete Selected
          </Button>
        </motion.div>
      )}

      {/* ── Mobile search overlay ── */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSearchOpen(false)}
            />
            <motion.div
              className="fixed top-4 left-4 right-4 z-50 lg:hidden"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="bg-card border border-border rounded-2xl p-3
                              shadow-glass flex items-center gap-2"
              >
                <Search
                  size={15}
                  className="text-text-subtle flex-shrink-0 ml-1"
                />
                <input
                  className="input-luxury flex-1 py-2.5 text-sm"
                  placeholder="Search brand, model, plate..."
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
                             text-text-muted hover:text-rose-400 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main toolbar ── */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-3 py-2.5">
        {/* Desktop search — hidden on mobile */}
        <div className="relative flex-1 max-w-xs hidden lg:block">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          />
          <input
            className="input-luxury pl-9 py-2 text-xs w-full"
            placeholder="Search brand, model, plate..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Mobile search icon — visible only on mobile */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className={clsx(
            "lg:hidden w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
            search
              ? "border-gold/40 text-gold bg-gold/5"
              : "border-border text-text-muted hover:border-gold/30 hover:text-gold",
          )}
          aria-label="Search inventory"
        >
          <Search size={14} />
          {/* Dot indicator when search is active */}
          {search && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
          )}
        </button>

        <div className="w-px h-5 bg-border flex-shrink-0" />

        {/* Filter — icon only on mobile */}
        <Button
          size="sm"
          variant="ghost"
          icon={SlidersHorizontal}
          onClick={onFilterOpen}
          className={clsx(filterCount > 0 && "!border-gold/40 !text-gold"), "h-8 "}
        >
          {/* Text hidden on mobile */}
          <span className="hidden lg:inline">Filters</span>
          {filterCount > 0 && (
            <span
              className="ml-1 text-[9px] font-black bg-gold text-base
                             px-1.5 py-0.5 rounded-full leading-none"
            >
              {filterCount}
            </span>
          )}
        </Button>

        {/* Column manager — icon only on mobile */}
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            icon={Columns}
            onClick={onColMgrToggle}
            className={clsx(colMgrOpen && "!border-gold/40 !text-gold"), "h-8"}
          >
            <span className="hidden lg:inline">Columns</span>
          </Button>
          <ColumnManager
            columns={columns}
            onColumnsChange={onColumnsChange}
            isOpen={colMgrOpen}
            onClose={() => onColMgrToggle(false)}
          />
        </div>

        <div className="w-px h-5 bg-border flex-shrink-0" />

        {/* More options (3-dot) */}
        <MoreMenu
          items={[
            { label: "Refresh", icon: RefreshCw, onClick: onRefresh },
            "divider",
            {
              label: "Export Excel",
              icon: FileSpreadsheet,
              onClick: () => onExport("Excel"),
            },
            {
              label: "Export PDF",
              icon: FileText,
              onClick: () => onExport("PDF"),
            },
          ]}
        />

        <div className="flex-1" />

        {/* Add Car */}
        <Button variant="primary" size="md" icon={Plus} onClick={onAddCar}>
          Add Car
        </Button>
      </div>
    </div>
  );
}

export default InventoryToolbar;
