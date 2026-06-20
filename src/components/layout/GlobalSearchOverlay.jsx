// src/components/layout/GlobalSearchOverlay.jsx
//
// Full search overlay — replaces the inline mobile/desktop search blocks
// previously embedded directly in Navbar.jsx. Handles query, results,
// recent searches, and keyboard navigation.

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Clock,
  Car,
  Users,
  UserCog,
  FileText,
  CalendarCheck,
  ArrowRight,
  CornerDownLeft,
} from "lucide-react";
import {
  globalSearch,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from "../../utils/globalSearchUtils";
import clsx from "clsx";

const ENTITY_CONFIG = {
  vehicle: { icon: Car, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  customer: { icon: Users, color: "text-violet-400", bg: "bg-violet-400/10" },
  user: { icon: UserCog, color: "text-sky-accent", bg: "bg-sky-accent/10" },
  invoice: { icon: FileText, color: "text-gold", bg: "bg-gold/10" },
  test_drive: {
    icon: CalendarCheck,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
};

function GlobalSearchOverlay({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef();

  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState(() => getRecentSearches());
  const [activeIndex, setActiveIndex] = useState(0);

  const { groups, total } = useMemo(() => globalSearch(query), [query]);

  // Flatten for keyboard navigation
  const flatResults = useMemo(() => groups.flatMap((g) => g.results), [groups]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setRecents(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = (result) => {
    addRecentSearch(query);
    navigate(result.path, { state: { openRecordId: result.id } });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (!flatResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flatResults[activeIndex];
      if (target) handleSelect(target);
    }
  };

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2
                       sm:w-full sm:max-w-xl z-50"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="bg-card border border-border rounded-2xl shadow-glass overflow-hidden">
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search size={16} className="text-text-subtle flex-shrink-0" />
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent border-0 outline-none text-sm text-text-primary
                             placeholder:text-text-subtle"
                  placeholder="Search vehicles, customers, users, invoices, test drives..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-text-subtle hover:text-text-muted transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="hidden sm:flex w-7 h-7 rounded-lg border border-border items-center justify-center
                             text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all flex-shrink-0"
                  aria-label="Close search"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Results / recents body */}
              <div className="max-h-[60vh] overflow-y-auto scrollbar-none">
                {/* Empty query → recent searches */}
                {!query && (
                  <div className="px-2 py-3">
                    {recents.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between px-3 mb-1.5">
                          <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
                            Recent Searches
                          </p>
                          <button
                            onClick={() => {
                              clearRecentSearches();
                              setRecents([]);
                            }}
                            className="text-[10px] text-text-subtle hover:text-rose-400 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        {recents.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(r)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left
                                       text-xs text-text-muted hover:bg-gold/5 hover:text-text-primary transition-colors"
                          >
                            <Clock
                              size={12}
                              className="text-text-subtle flex-shrink-0"
                            />
                            {r}
                          </button>
                        ))}
                      </>
                    ) : (
                      <p className="text-xs text-text-subtle text-center py-8">
                        Start typing to search across the platform
                      </p>
                    )}
                  </div>
                )}

                {/* Query with no matches */}
                {query && query.trim().length >= 2 && total === 0 && (
                  <p className="text-xs text-text-subtle text-center py-10">
                    No results for "{query}"
                  </p>
                )}

                {/* Query too short */}
                {query && query.trim().length < 2 && (
                  <p className="text-xs text-text-subtle text-center py-10">
                    Keep typing… (2+ characters)
                  </p>
                )}

                {/* Grouped results */}
                {query && total > 0 && (
                  <div className="px-2 py-2">
                    {groups.map((group) => (
                      <div key={group.entity} className="mb-2 last:mb-0">
                        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase px-3 mb-1">
                          {group.label}
                        </p>
                        {group.results.map((result) => {
                          runningIndex += 1;
                          const idx = runningIndex;
                          const cfg = ENTITY_CONFIG[result.entity];
                          const Icon = cfg.icon;
                          const isActive = idx === activeIndex;
                          return (
                            <button
                              key={`${result.entity}-${result.id}`}
                              onClick={() => handleSelect(result)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className={clsx(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                isActive ? "bg-gold/8" : "hover:bg-gold/[0.04]",
                              )}
                            >
                              <div
                                className={clsx(
                                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                                  cfg.bg,
                                  cfg.color,
                                )}
                              >
                                <Icon size={13} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-text-primary truncate">
                                  {result.title}
                                </p>
                                <p className="text-[10px] text-text-subtle truncate">
                                  {result.subtitle}
                                </p>
                              </div>
                              {isActive ? (
                                <CornerDownLeft
                                  size={12}
                                  className="text-gold flex-shrink-0"
                                />
                              ) : (
                                <ArrowRight
                                  size={12}
                                  className="text-text-subtle/40 flex-shrink-0"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-base/40">
                <span className="flex items-center gap-1.5 text-[9px] text-text-subtle">
                  <kbd className="bg-card border border-border rounded px-1.5 py-0.5">
                    ↑↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span className="flex items-center gap-1.5 text-[9px] text-text-subtle">
                  <kbd className="bg-card border border-border rounded px-1.5 py-0.5">
                    ↵
                  </kbd>{" "}
                  Select
                </span>
                <span className="flex items-center gap-1.5 text-[9px] text-text-subtle">
                  <kbd className="bg-card border border-border rounded px-1.5 py-0.5">
                    Esc
                  </kbd>{" "}
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GlobalSearchOverlay;
