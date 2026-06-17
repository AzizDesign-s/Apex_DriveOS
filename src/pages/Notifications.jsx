// src/pages/Notifications.jsx
// BUG-045 FIX: read from shared localStorage source
// BUG-046 + BUG-047 FIX: actions write back to same source
// BUG-048 FIX: covered by notificationUtils.js wired into modules
// BUG-049 FIX: clearReadNotifications fixed in notificationUtils.js
// BUG-050 FIX: timeAgo called at render time — acceptable for sprint 1
//             Phase 2 will use a setInterval to refresh every 60s

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Trash2 } from "lucide-react";
import {
  loadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  toggleNotificationPin,
  deleteNotification,
  clearReadNotifications,
} from "../utils/notificationUtils";
import NotificationCard from "../components/notifications/NotificationCard";
import NotificationFilterBar from "../components/notifications/NotificationFilterBar";
import NotificationEmptyState from "../components/notifications/NotificationEmptyState";
import { Button } from "../components/ui";
import apexToast from "../utils/toast";
import clsx from "clsx";

function Notifications() {
  // BUG-045 FIX: load from shared localStorage source
  const [items, setItems] = useState(() => loadNotifications());

  const [activeType, setActiveType] = useState("all");
  const [showUnread, setShowUnread] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  // BUG-045 FIX: listen for updates from other modules and Navbar
  useEffect(() => {
    // BUG-1 FIX: reload from localStorage on every update event
    // Don't trust event.detail — read source of truth directly
    const reload = () => setItems(loadNotifications());

    window.addEventListener("apex-gt-notifications-updated", reload);
    window.addEventListener("storage", (e) => {
      if (e.key === "apex-gt-notifications") reload();
    });

    return () => {
      window.removeEventListener("apex-gt-notifications-updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  // Counts for filter badges
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

  // Filtered + grouped list
  const filtered = useMemo(() => {
    let data = [...items];
    if (activeType !== "all") data = data.filter((n) => n.type === activeType);
    if (showUnread) data = data.filter((n) => !n.isRead);

    const pinned = data.filter((n) => n.isPinned);
    const unpinned = data.filter((n) => !n.isPinned);

    const sorted = unpinned.sort((a, b) => {
      const da = new Date(a.createdAt);
      const db = new Date(b.createdAt);
      return sortOrder === "newest" ? db - da : da - db;
    });

    return [...pinned, ...sorted];
  }, [items, activeType, showUnread, sortOrder]);

  // Group by date
  const grouped = useMemo(() => {
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

    filtered.forEach((n) => {
      if (n.isPinned) {
        groups.pinned.push(n);
        return;
      }
      const d = new Date(n.createdAt);
      if (d.toDateString() === today.toDateString()) groups.today.push(n);
      else if (d.toDateString() === yesterday.toDateString())
        groups.yesterday.push(n);
      else if (d >= weekAgo) groups.thisWeek.push(n);
      else groups.earlier.push(n);
    });

    return groups;
  }, [filtered]);

  // ── BUG-046 FIX: handlers write to shared localStorage ────────────────────
  const handleRead = useCallback((id) => {
    markNotificationRead(id);
    setItems(loadNotifications());
  }, []);

  // ── BUG-047 FIX: delete writes to shared localStorage ─────────────────────
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

  // BUG-049 FIX: clearReadNotifications now correctly keeps pinned + unread
  const handleClearAll = useCallback(() => {
    clearReadNotifications();
    setItems(loadNotifications());
    apexToast.info("Cleared", "Read notifications have been cleared.");
  }, []);

  // Section header
  const SectionHeader = ({ label, count }) => (
    <div className="flex items-center gap-3 mb-3">
      <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
      </p>
      <div className="flex-1 h-px bg-border" />
      <span className="text-[9px] text-text-subtle">{count}</span>
    </div>
  );

  const renderGroup = (label, groupItems, startIndex = 0) => {
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

  const hasAny = filtered.length > 0;
  const unreadCount = counts.unread;

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
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                className="text-[10px] font-bold bg-gold/15 text-gold
                               px-2.5 py-1 rounded-full border border-gold/25"
              >
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            System alerts · Updates in real time from all modules
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
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
        </div>
      </motion.div>

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

      {/* Summary strip */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: "Total", value: counts.all, color: "text-text-primary" },
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
            <p className={clsx("text-xl font-extrabold", s.color)}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Notification list */}
      <div className="flex-1">
        {hasAny ? (
          <>
            {renderGroup("📌 Pinned", grouped.pinned, 0)}
            {renderGroup("Today", grouped.today, grouped.pinned.length)}
            {renderGroup(
              "Yesterday",
              grouped.yesterday,
              grouped.pinned.length + grouped.today.length,
            )}
            {renderGroup(
              "This Week",
              grouped.thisWeek,
              grouped.pinned.length +
                grouped.today.length +
                grouped.yesterday.length,
            )}
            {renderGroup(
              "Earlier",
              grouped.earlier,
              grouped.pinned.length +
                grouped.today.length +
                grouped.yesterday.length +
                grouped.thisWeek.length,
            )}
          </>
        ) : (
          <NotificationEmptyState
            filtered={activeType !== "all" || showUnread}
          />
        )}
      </div>
    </div>
  );
}

export default Notifications;
