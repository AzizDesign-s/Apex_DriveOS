// src/pages/Activity.jsx
// Sprint 4 Phase 1 — Activity Center
//
// Mirrors the Notifications page structure exactly:
//   — Same header pattern
//   — Same 4-stat summary strip
//   — Same grouped timeline (Today / Yesterday / This Week / Earlier)
//   — Same filter bar pattern
//
// KEY DIFFERENCE from Notifications:
//   — No read/unread state — activity logs are immutable records
//   — No pin/delete — logs are append-only for audit integrity
//   — Filter is by MODULE not by notification type
//   — Primary metaphor is TIMELINE not inbox

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import { loadActivityLogs } from "../utils/activityLogger";
import ActivityStats from "../components/activity/ActivityStats";
import ActivityFilterBar from "../components/activity/ActivityFilterBar";
import ActivityCard from "../components/activity/ActivityCard";
import ActivityEmptyState from "../components/activity/ActivityEmptyState";
import { Button } from "../components/ui";
import apexToast from "../utils/toast";

function Activity() {
  const [logs, setLogs] = useState(() => loadActivityLogs());
  const [activeModule, setActiveModule] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Live sync — reload when any module logs an activity
  useEffect(() => {
    const reload = () => setLogs(loadActivityLogs());
    window.addEventListener("apex-driveos-activity-updated", reload);
    window.addEventListener("storage", (e) => {
      if (e.key === "apex-driveos-activity") reload();
    });
    return () => {
      window.removeEventListener("apex-driveos-activity-updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  // Per-module counts for filter bar badges
  const counts = useMemo(() => {
    const map = { all: logs.length };
    logs.forEach((l) => {
      map[l.module] = (map[l.module] || 0) + 1;
    });
    return map;
  }, [logs]);

  // Filter + sort
  const filtered = useMemo(() => {
    let data = [...logs];
    if (activeModule !== "all") {
      data = data.filter((l) => l.module === activeModule);
    }
    return data.sort((a, b) => {
      const da = new Date(a.createdAt);
      const db = new Date(b.createdAt);
      return sortOrder === "newest" ? db - da : da - db;
    });
  }, [logs, activeModule, sortOrder]);

  // Group by date — same logic as Notifications page
  const grouped = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const groups = { today: [], yesterday: [], thisWeek: [], earlier: [] };

    filtered.forEach((l) => {
      const d = new Date(l.createdAt);
      if (d.toDateString() === today.toDateString()) groups.today.push(l);
      else if (d.toDateString() === yesterday.toDateString())
        groups.yesterday.push(l);
      else if (d >= weekAgo) groups.thisWeek.push(l);
      else groups.earlier.push(l);
    });

    return groups;
  }, [filtered]);

  const handleRefresh = useCallback(() => {
    setLogs(loadActivityLogs());
    apexToast.success("Refreshed", "Activity log updated.");
  }, []);

  // Export as CSV — future-ready, keeps audit trail portable
  const handleExport = useCallback(() => {
    const headers = [
      "ID",
      "Module",
      "Action",
      "Entity",
      "Actor",
      "Description",
      "Date",
    ];
    const rows = filtered.map((l) => [
      l.id,
      l.module,
      l.action,
      l.entityLabel,
      l.actor,
      `"${l.description.replace(/"/g, "'")}"`,
      new Date(l.createdAt).toLocaleString("en-AE"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apex-driveos-activity-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    apexToast.success(
      "Exported",
      `${filtered.length} activity logs exported as CSV.`,
    );
  }, [filtered]);

  // Section header — same as Notifications
  const SectionHeader = ({ label, count }) => (
    <div className="flex items-center gap-3 mb-3">
      <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
      </p>
      <div className="flex-1 h-px bg-border" />
      <span className="text-[9px] text-text-subtle">{count}</span>
    </div>
  );

  const renderGroup = (label, groupLogs, startIndex = 0) => {
    if (groupLogs.length === 0) return null;
    return (
      <div key={label} className="mb-5">
        <SectionHeader label={label} count={groupLogs.length} />
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {groupLogs.map((log, i) => (
              <ActivityCard key={log.id} log={log} index={startIndex + i} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6">
      {/* Page header */}
      <motion.div
        className="flex items-start justify-between flex-shrink-0"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-text-primary">
              Activity Center
            </h1>
            <span
              className="text-[10px] font-bold bg-gold/15 text-gold
                         px-2.5 py-1 rounded-full border border-gold/25"
            >
              {filtered.length} entries
            </span>
          </div>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            Complete audit trail · Every action across all modules
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats strip */}
      <ActivityStats logs={logs} />

      {/* Filter bar */}
      <ActivityFilterBar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        sortOrder={sortOrder}
        onSortToggle={() =>
          setSortOrder((p) => (p === "newest" ? "oldest" : "newest"))
        }
        counts={counts}
      />

      {/* Timeline */}
      <div className="flex-1">
        {filtered.length > 0 ? (
          <>
            {renderGroup("Today", grouped.today, 0)}
            {renderGroup("Yesterday", grouped.yesterday, grouped.today.length)}
            {renderGroup(
              "This Week",
              grouped.thisWeek,
              grouped.today.length + grouped.yesterday.length,
            )}
            {renderGroup(
              "Earlier",
              grouped.earlier,
              grouped.today.length +
                grouped.yesterday.length +
                grouped.thisWeek.length,
            )}
          </>
        ) : (
          <ActivityEmptyState filtered={activeModule !== "all"} />
        )}
      </div>
    </div>
  );
}

export default Activity;
