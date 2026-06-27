// src/pages/Notifications.jsx
// Sprint 4 Phase 2: split into two tabs — Notifications | Activity
//
// TAB 1: Notifications — business alerts only (actionable events)
//         Uses existing NotificationCard + NotificationFilterBar
//         Same behaviour as before Phase 2
//
// TAB 2: Activity — audit trail of user actions
//         Reuses ActivityCard from Phase 1
//         Reuses ActivityFilterBar from Phase 1
//         Same data source as /activity page
//
// Tab style: underline with gold indicator (matches UserFormPage tabs)

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ClipboardList, CheckCheck, Trash2 } from "lucide-react";
import {
  loadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  toggleNotificationPin,
  deleteNotification,
  clearReadNotifications,
} from "../utils/notificationUtils";
import { loadActivityLogs } from "../utils/activityLogger";
import NotificationCard from "../components/notifications/NotificationCard";
import NotificationFilterBar from "../components/notifications/NotificationFilterBar";
import NotificationEmptyState from "../components/notifications/NotificationEmptyState";
import ActivityCard from "../components/activity/ActivityCard";
import ActivityFilterBar from "../components/activity/ActivityFilterBar";
import ActivityEmptyState from "../components/activity/ActivityEmptyState";
import { Button } from "../components/ui";
import apexToast from "../utils/toast";
import clsx from "clsx";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "activity", label: "Activity", icon: ClipboardList },
];

// ── Date grouping helper — shared by both tabs ────────────────────────────────
function groupByDate(items) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const groups = {
    pinned: [],
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  };

  items.forEach((item) => {
    if (item.isPinned) {
      groups.pinned.push(item);
      return;
    }
    const d = new Date(item.createdAt);
    if (d.toDateString() === today.toDateString()) groups.today.push(item);
    else if (d.toDateString() === yesterday.toDateString())
      groups.yesterday.push(item);
    else if (d >= weekAgo) groups.thisWeek.push(item);
    else groups.earlier.push(item);
  });

  return groups;
}

// ── Section header — shared by both tabs ──────────────────────────────────────
function SectionHeader({ label, count }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
      </p>
      <div className="flex-1 h-px bg-border" />
      <span className="text-[9px] text-text-subtle">{count}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Notifications() {
  // ── Active tab ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("notifications");

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 1 STATE — Notifications
  // ══════════════════════════════════════════════════════════════════════════
  const [items, setItems] = useState(() => loadNotifications());
  const [activeType, setActiveType] = useState("all");
  const [showUnread, setShowUnread] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  // Reload when other modules fire notification events
  useEffect(() => {
    const reload = () => setItems(loadNotifications());
    window.addEventListener("apex-driveos-notifications-updated", reload);
    window.addEventListener("storage", (e) => {
      if (e.key === "apex-driveos-notifications") reload();
    });
    return () => {
      window.removeEventListener("apex-driveos-notifications-updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      unread: items.filter((n) => !n.isRead).length,
      test_drive: items.filter((n) => n.type === "test_drive").length,
      invoice: items.filter((n) => n.type === "invoice").length,
      inventory: items.filter((n) => n.type === "inventory").length,
      customer: items.filter((n) => n.type === "customer").length,
      system: items.filter((n) => n.type === "system").length,
    }),
    [items],
  );

  const filteredNotifs = useMemo(() => {
    let data = [...items];
    if (activeType !== "all") data = data.filter((n) => n.type === activeType);
    if (showUnread) data = data.filter((n) => !n.isRead);

    const pinned = data.filter((n) => n.isPinned);
    const unpinned = data
      .filter((n) => !n.isPinned)
      .sort((a, b) => {
        const da = new Date(a.createdAt);
        const db = new Date(b.createdAt);
        return sortOrder === "newest" ? db - da : da - db;
      });

    return [...pinned, ...unpinned];
  }, [items, activeType, showUnread, sortOrder]);

  const groupedNotifs = useMemo(
    () => groupByDate(filteredNotifs),
    [filteredNotifs],
  );

  const handleRead = useCallback((id) => {
    markNotificationRead(id);
    setItems(loadNotifications());
  }, []);
  const handleDelete = useCallback((id) => {
    deleteNotification(id);
    setItems(loadNotifications());
    apexToast.info("Notification Removed", "Notification deleted.");
  }, []);
  const handlePin = useCallback(
    (id) => {
      const notif = items.find((n) => n.id === id);
      const pinning = !notif?.isPinned;
      toggleNotificationPin(id);
      setItems(loadNotifications());
      apexToast.success(
        pinning ? "Notification Pinned" : "Notification Unpinned",
        pinning
          ? "This notification will stay at the top."
          : "Notification unpinned.",
      );
    },
    [items],
  );
  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsRead();
    setItems(loadNotifications());
    apexToast.success("All Read", "All notifications marked as read.");
  }, []);
  const handleClearAll = useCallback(() => {
    clearReadNotifications();
    setItems(loadNotifications());
    apexToast.info("Cleared", "Read notifications have been cleared.");
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2 STATE — Activity
  // ══════════════════════════════════════════════════════════════════════════
  const [logs, setLogs] = useState(() => loadActivityLogs());
  const [activeModule, setActiveModule] = useState("all");
  const [actSortOrder, setActSortOrder] = useState("newest");

  // Reload when modules log new activity
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

  const activityCounts = useMemo(() => {
    const map = { all: logs.length };
    logs.forEach((l) => {
      map[l.module] = (map[l.module] || 0) + 1;
    });
    return map;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let data = [...logs];
    if (activeModule !== "all")
      data = data.filter((l) => l.module === activeModule);
    return data.sort((a, b) => {
      const da = new Date(a.createdAt);
      const db = new Date(b.createdAt);
      return actSortOrder === "newest" ? db - da : da - db;
    });
  }, [logs, activeModule, actSortOrder]);

  // Activity tab uses same date grouping but no "pinned" concept
  const groupedLogs = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const groups = { today: [], yesterday: [], thisWeek: [], earlier: [] };
    filteredLogs.forEach((l) => {
      const d = new Date(l.createdAt);
      if (d.toDateString() === today.toDateString()) groups.today.push(l);
      else if (d.toDateString() === yesterday.toDateString())
        groups.yesterday.push(l);
      else if (d >= weekAgo) groups.thisWeek.push(l);
      else groups.earlier.push(l);
    });
    return groups;
  }, [filteredLogs]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderNotifGroup = (label, groupItems, startIndex = 0) => {
    if (groupItems.length === 0) return null;
    return (
      <div key={label} className="mb-5">
        <SectionHeader label={label} count={groupItems.length} />
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {groupItems.map((notif, i) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onRead={handleRead}
                onPin={handlePin}
                onDelete={handleDelete}
                index={startIndex + i}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderActivityGroup = (label, groupItems, startIndex = 0) => {
    if (groupItems.length === 0) return null;
    return (
      <div key={label} className="mb-5">
        <SectionHeader label={label} count={groupItems.length} />
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {groupItems.map((log, i) => (
              <ActivityCard key={log.id} log={log} index={startIndex + i} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const unreadCount = counts.unread;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6">
      {/* ── Page header ── */}
      <motion.div
        className="flex items-start justify-between flex-shrink-0"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-text-primary">
              {activeTab === "notifications"
                ? "Notifications"
                : "Activity Center"}
            </h1>

            {/* Badge — unread count for notifications, total for activity */}
            {activeTab === "notifications" && unreadCount > 0 && (
              <span
                className="text-[10px] font-bold bg-gold/15 text-gold
                               px-2.5 py-1 rounded-full border border-gold/25"
              >
                {unreadCount} unread
              </span>
            )}
            {activeTab === "activity" && (
              <span
                className="text-[10px] font-bold bg-gold/15 text-gold
                               px-2.5 py-1 rounded-full border border-gold/25"
              >
                {filteredLogs.length} entries
              </span>
            )}
          </div>

          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            {activeTab === "notifications"
              ? "Business alerts · Actionable events from all modules"
              : "Complete audit trail · Every action across all modules"}
          </p>
        </div>

        {/* Header actions — conditional per tab */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeTab === "notifications" ? (
            <>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={CheckCheck}
                  onClick={handleMarkAllRead}
                >
                  <span className="hidden sm:inline">Mark All Read</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={handleClearAll}
                className="hover:!border-rose-400/40 hover:!text-rose-400"
              >
                <span className="hidden sm:inline">Clear Read</span>
              </Button>
            </>
          ) : // Activity tab has no header actions —
          // export is on the dedicated /activity page
          null}
        </div>
      </motion.div>

      {/* ── Tab switcher — underline style ── */}
      <div className="flex-shrink-0 border-b border-border">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-5 py-3 text-xs font-semibold",
                  "border-b-2 transition-all duration-200",
                  isActive
                    ? "border-gold text-gold"
                    : "border-transparent text-text-subtle hover:text-text-muted hover:border-border",
                )}
              >
                <tab.icon size={13} />
                {tab.label}

                {/* Tab badge */}
                {tab.id === "notifications" && unreadCount > 0 && (
                  <span
                    className={clsx(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive
                        ? "bg-gold text-base"
                        : "bg-border text-text-muted",
                    )}
                  >
                    {unreadCount}
                  </span>
                )}
                {tab.id === "activity" && (
                  <span
                    className={clsx(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive
                        ? "bg-gold text-base"
                        : "bg-border text-text-muted",
                    )}
                  >
                    {logs.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        {/* ════════════════════════════════════════════════════════════════
            TAB 1: NOTIFICATIONS
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-4 flex-1"
          >
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
              {[
                {
                  label: "Total",
                  value: counts.all,
                  color: "text-text-primary",
                },
                { label: "Unread", value: counts.unread, color: "text-gold" },
                {
                  label: "Pinned",
                  value: items.filter((n) => n.isPinned).length,
                  color: "text-sky-accent",
                },
                {
                  label: "Critical",
                  value: items.filter((n) => n.priority === "high" && !n.isRead)
                    .length,
                  color: "text-rose-400",
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className="bg-card border border-border rounded-xl px-4 py-3
                             flex items-center justify-between"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.04 }}
                >
                  <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
                    {s.label}
                  </p>
                  <p className={clsx("text-xl font-extrabold", s.color)}>
                    {s.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Filter bar */}
            <NotificationFilterBar
              activeType={activeType}
              onTypeChange={setActiveType}
              showUnread={showUnread}
              onUnreadToggle={() => setShowUnread((p) => !p)}
              sortOrder={sortOrder}
              onSortToggle={() =>
                setSortOrder((p) => (p === "newest" ? "oldest" : "newest"))
              }
              counts={counts}
            />

            {/* Notification list */}
            <div className="flex-1">
              {filteredNotifs.length > 0 ? (
                <>
                  {renderNotifGroup("📌 Pinned", groupedNotifs.pinned, 0)}
                  {renderNotifGroup(
                    "Today",
                    groupedNotifs.today,
                    groupedNotifs.pinned.length,
                  )}
                  {renderNotifGroup(
                    "Yesterday",
                    groupedNotifs.yesterday,
                    groupedNotifs.pinned.length + groupedNotifs.today.length,
                  )}
                  {renderNotifGroup(
                    "This Week",
                    groupedNotifs.thisWeek,
                    groupedNotifs.pinned.length +
                      groupedNotifs.today.length +
                      groupedNotifs.yesterday.length,
                  )}
                  {renderNotifGroup(
                    "Earlier",
                    groupedNotifs.earlier,
                    groupedNotifs.pinned.length +
                      groupedNotifs.today.length +
                      groupedNotifs.yesterday.length +
                      groupedNotifs.thisWeek.length,
                  )}
                </>
              ) : (
                <NotificationEmptyState
                  filtered={activeType !== "all" || showUnread}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB 2: ACTIVITY
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-4 flex-1"
          >
            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
              {[
                {
                  label: "Total Logs",
                  value: logs.length,
                  color: "text-text-primary",
                },
                {
                  label: "Today",
                  value: logs.filter(
                    (l) =>
                      new Date(l.createdAt).toDateString() ===
                      new Date().toDateString(),
                  ).length,
                  color: "text-gold",
                },
                {
                  label: "This Week",
                  value: logs.filter((l) => {
                    const diff = Date.now() - new Date(l.createdAt).getTime();
                    return diff <= 7 * 24 * 60 * 60 * 1000;
                  }).length,
                  color: "text-sky-accent",
                },
                {
                  label: "By Admin",
                  value: logs.filter(
                    (l) => l.actorId === "admin" || l.actorId === "system",
                  ).length,
                  color: "text-emerald-400",
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className="bg-card border border-border rounded-xl px-4 py-3
                             flex items-center justify-between"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.04 }}
                >
                  <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
                    {s.label}
                  </p>
                  <p className={clsx("text-xl font-extrabold", s.color)}>
                    {s.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Filter bar — reuse ActivityFilterBar from Phase 1 */}
            <ActivityFilterBar
              activeModule={activeModule}
              onModuleChange={setActiveModule}
              sortOrder={actSortOrder}
              onSortToggle={() =>
                setActSortOrder((p) => (p === "newest" ? "oldest" : "newest"))
              }
              counts={activityCounts}
            />

            {/* Activity timeline */}
            <div className="flex-1">
              {filteredLogs.length > 0 ? (
                <>
                  {renderActivityGroup("Today", groupedLogs.today, 0)}
                  {renderActivityGroup(
                    "Yesterday",
                    groupedLogs.yesterday,
                    groupedLogs.today.length,
                  )}
                  {renderActivityGroup(
                    "This Week",
                    groupedLogs.thisWeek,
                    groupedLogs.today.length + groupedLogs.yesterday.length,
                  )}
                  {renderActivityGroup(
                    "Earlier",
                    groupedLogs.earlier,
                    groupedLogs.today.length +
                      groupedLogs.yesterday.length +
                      groupedLogs.thisWeek.length,
                  )}
                </>
              ) : (
                <ActivityEmptyState filtered={activeModule !== "all"} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Notifications;
