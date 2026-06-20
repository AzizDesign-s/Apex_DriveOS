// src/components/testdrives/TestDriveToolbar.jsx

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Columns,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CalendarPlus,
  Trash2,
  Tag,
  X,
  LayoutList,
  Calendar,
  Bookmark,
} from "lucide-react";
import { Button } from "../ui";
import MoreMenu from "../ui/MoreMenu";
import ColumnManager from "../ui/ColumnManager";
import SavedFiltersDropdown from "../ui/SavedFilterDropdown";
import { TESTDRIVE_FILTER_CONFIG } from "../../utils/filterConfig";
import clsx from "clsx";

function TestDriveToolbar({
  search,
  onSearch,
  filterCount,
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
  onAddBooking,
  // view toggle
  view,
  onViewChange,
  activeFilters,
  onFiltersChange,
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const hasSelection = selected?.size > 0;

  const [savedOpen, setSavedOpen] = useState(false);
  const [saveMode, setSaveMode] = useState(false);
  const savedBtnRef = useRef();

  return (
    <div className="flex flex-col gap-2">
      {/* Mobile search overlay */}
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
                  placeholder="Search customer, car, exec..."
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

      {/* Bulk bar */}
      {hasSelection && (
        <motion.div
          className="flex items-center gap-2 bg-gold/[0.04] border border-gold/15
                     rounded-xl px-4 py-2"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-bold text-gold">
            {selected.size} booking{selected.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" onClick={onClearSelected}>
            Clear
          </Button>
          <Button size="sm" variant="sky" icon={Tag} onClick={onChangeStatus}>
            Change Status
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={onDeleteSelected}
          >
            Delete
          </Button>
        </motion.div>
      )}

      {/* Main toolbar */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-3 py-2.5">
        {/* Desktop search */}
        <div className="relative flex-1 max-w-xs hidden lg:block">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          />
          <input
            className="input-luxury pl-9 py-2 text-xs w-full"
            placeholder="Search customer, car, exec..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Mobile search icon */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className={clsx(
            "lg:hidden w-8 h-8 rounded-xl border flex items-center justify-center transition-all",
            search
              ? "border-gold/40 text-gold bg-gold/5"
              : "border-border text-text-muted hover:border-gold/30 hover:text-gold",
          )}
          aria-label="Search bookings"
        >
          <Search size={14} />
        </button>

        <div className="w-px h-5 bg-border flex-shrink-0 hidden lg:block" />

        {/* Filter */}
        <Button
          size="sm"
          variant="ghost"
          icon={SlidersHorizontal}
          onClick={onFilterOpen}
          className={clsx(
            filterCount > 0 && "!border-gold/40 !text-gold",
            "h-8 ",
          )}
        >
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

        <div className="relative">
          <button
            ref={savedBtnRef}
            onClick={() => {
              setSaveMode(false);
              setSavedOpen((p) => !p);
            }}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
               text-text-muted hover:text-gold hover:border-gold/30 transition-all"
            title="Saved filters"
            aria-label="Saved filters"
          >
            <Bookmark size={14} />
          </button>
          <SavedFiltersDropdown
            isOpen={savedOpen}
            onClose={() => setSavedOpen(false)}
            anchorRef={savedBtnRef}
            storageKey={TESTDRIVE_FILTER_CONFIG.storageKey}
            currentFilters={activeFilters}
            onApply={onFiltersChange}
            saveMode={saveMode}
            onSaveComplete={() => setSavedOpen(false)}
          />
        </div>

        {/* Column manager */}
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            icon={Columns}
            onClick={onColMgrToggle}
            className={clsx(colMgrOpen && "!border-gold/40 !text-gold", "h-8")}
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

        {/* ── View toggle: Table / Calendar ── */}
        <div className="flex bg-base border border-border rounded-xl overflow-hidden flex-shrink-0">
          <button
            onClick={() => onViewChange("table")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-all",
              view === "table"
                ? "bg-gold/10 text-gold"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            <LayoutList size={13} />
            <span className="hidden sm:inline">Table</span>
          </button>
          <div className="w-px bg-border" />
          <button
            onClick={() => onViewChange("calendar")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-all",
              view === "calendar"
                ? "bg-gold/10 text-gold"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            <Calendar size={13} />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>

        <div className="w-px h-5 bg-border flex-shrink-0" />

        {/* More menu */}
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

        <Button
          variant="primary"
          size="md"
          icon={CalendarPlus}
          onClick={onAddBooking}
        >
          <span className="hidden sm:inline">Book Test Drive</span>
        </Button>
      </div>
    </div>
  );
}

export default TestDriveToolbar;
