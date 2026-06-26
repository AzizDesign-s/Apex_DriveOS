// src/utils/notificationUtils.js
//
// Notification creation and management utilities.
// Both Navbar and Notifications page read from the same localStorage key.
// Phase 2: replace with useNotificationStore actions.

// ── Storage key ───────────────────────────────────────────────────────────────
const LS_KEY = "apex-driveos-notifications";

// ── Load all notifications ────────────────────────────────────────────────────
export const loadNotifications = () => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
    // First load — seed from mockData
    const { notifications } = require("../data/mockData");
    localStorage.setItem(LS_KEY, JSON.stringify(notifications));
    return notifications;
  } catch {
    return [];
  }
};

const syncCountToStore = (notifications) => {
  try {
    // Dynamic import avoids circular dependency
    // useAppStore → notificationUtils → useAppStore
    const unread = notifications.filter((n) => !n.isRead).length;
    // Dispatch a separate count event that Sidebar listens to
    window.dispatchEvent(
      new CustomEvent("apex-driveos-notif-count-updated", {
        detail: { count: unread },
      }),
    );
  } catch {
    /* silent */
  }
};

// ── Save all notifications ────────────────────────────────────────────────────
export const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(notifications));
  } catch {
    /* silent */
  }

  try {
    window.dispatchEvent(
      new CustomEvent("apex-driveos-notifications-updated", {
        detail: { notifications },
      }),
    );
    // BUG-2 FIX: also dispatch count update for Sidebar badge
    syncCountToStore(notifications);
  } catch {
    /* silent */
  }
};

let notifCounter = 0;
// ── Create a single notification ──────────────────────────────────────────────
// type: 'test_drive' | 'invoice' | 'inventory' | 'customer' | 'system'
// priority: 'high' | 'medium' | 'low'
export const createNotification = ({
  type,
  priority = "medium",
  title,
  message,
  link = null,
  linkLabel = null,
  meta = {},
}) => {
  const existing = loadNotifications();
  notifCounter += 1;
  const newNotif = {
    id: `${Date.now()}-${notifCounter}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    priority,
    title,
    message,
    link,
    linkLabel,
    meta,
    isRead: false,
    isPinned: false,
    createdAt: new Date().toISOString(),
  };
  const updated = [newNotif, ...existing];
  saveNotifications(updated);
  return newNotif;
};

// ── Mark a notification as read ───────────────────────────────────────────────
export const markNotificationRead = (id) => {
  const existing = loadNotifications();
  const updated = existing.map((n) =>
    n.id === id ? { ...n, isRead: true } : n,
  );
  saveNotifications(updated);
};

// ── Mark all as read ──────────────────────────────────────────────────────────
export const markAllNotificationsRead = () => {
  const existing = loadNotifications();
  const updated = existing.map((n) => ({ ...n, isRead: true }));
  saveNotifications(updated);
};

// ── Pin / unpin ───────────────────────────────────────────────────────────────
export const toggleNotificationPin = (id) => {
  const existing = loadNotifications();
  const updated = existing.map((n) =>
    n.id === id ? { ...n, isPinned: !n.isPinned } : n,
  );
  saveNotifications(updated);
};

// ── Delete single ─────────────────────────────────────────────────────────────
export const deleteNotification = (id) => {
  const existing = loadNotifications();
  const updated = existing.filter((n) => n.id !== id);
  saveNotifications(updated);
};

// ── Clear read non-pinned ─────────────────────────────────────────────────────
// BUG-049 FIX: correct logic — keep pinned OR unread, clear the rest
export const clearReadNotifications = () => {
  const existing = loadNotifications();
  const updated = existing.filter((n) => n.isPinned || !n.isRead);
  saveNotifications(updated);
};

// ── Unread count ──────────────────────────────────────────────────────────────
export const getUnreadCount = () => {
  const existing = loadNotifications();
  return existing.filter((n) => !n.isRead).length;
};

// ── Pre-built notification templates per module action ────────────────────────
// BUG-048 FIX: these are called from each module when actions happen

export const notify = {
  // ── Inventory ──

  lowInventory: (count) =>
    createNotification({
      type: "inventory",
      priority: "high",
      title: "Low Inventory Alert",
      message: `Only ${count} car${count !== 1 ? "s" : ""} available in inventory. Consider restocking.`,
      link: "/inventory",
      linkLabel: "View Inventory",
      meta: { count },
    }),

  // ── Customers ──

  // ── Test Drives ──
  bookingCreated: (booking) =>
    createNotification({
      type: "test_drive",
      priority: "medium",
      title: "Test Drive Booked",
      message: `${booking.customerName} has requested a test drive for ${booking.carName} on ${booking.date} at ${booking.time}.`,
      link: "/test-drives",
      linkLabel: "View Booking",
      meta: { bookingId: booking.bookingId },
    }),

  bookingApproved: (booking) =>
    createNotification({
      type: "test_drive",
      priority: "high",
      title: "Test Drive Approved",
      message: `${booking.customerName}'s test drive for ${booking.carName} approved. Scheduled ${booking.date} at ${booking.time}.`,
      link: "/test-drives",
      linkLabel: "View Booking",
      meta: { bookingId: booking.bookingId },
    }),
  bookingRejected: (booking) =>
    createNotification({
      type: "test_drive",
      priority: "medium",
      title: "Test Drive Rejected",
      message: `${booking.customerName}'s test drive request for ${booking.carName} has been rejected.`,
      link: "/test-drives",
      linkLabel: "View Booking",
      meta: { bookingId: booking.bookingId },
    }),

  bookingCancelled: (booking) =>
    createNotification({
      type: "test_drive",
      priority: "medium",
      title: "Test Drive Cancelled",
      message: `${booking.customerName}'s test drive for ${booking.carName} has been cancelled.`,
      link: "/test-drives",
      linkLabel: "View Booking",
      meta: { bookingId: booking.bookingId },
    }),

  bookingCompleted: (booking) =>
    createNotification({
      type: "test_drive",
      priority: "medium",
      title: "Test Drive Completed",
      message: `${booking.customerName} completed the test drive for ${booking.carName}. Sales exec: ${booking.exec || "Unassigned"}.`,
      link: "/test-drives",
      linkLabel: "View Booking",
      meta: { bookingId: booking.bookingId },
    }),

  // ── Invoices ──

  invoicePaid: (invoice, total) =>
    createNotification({
      type: "invoice",
      priority: "high",
      title: "Invoice Paid",
      message: `Invoice ${invoice.invoiceId} for ${invoice.customerName} has been marked as paid. Amount: AED ${Number(total).toLocaleString()}.`,
      link: "/invoices",
      linkLabel: "View Invoice",
      meta: { invoiceId: invoice.invoiceId, amount: total },
    }),

  invoiceOverdue: (invoice) =>
    createNotification({
      type: "invoice",
      priority: "high",
      title: "Invoice Overdue",
      message: `Invoice ${invoice.invoiceId} for ${invoice.customerName} is overdue. Immediate follow-up required.`,
      link: "/invoices",
      linkLabel: "View Invoice",
      meta: { invoiceId: invoice.invoiceId },
    }),

  invoiceSent: (invoice) =>
    createNotification({
      type: "invoice",
      priority: "low",
      title: "Invoice Sent",
      message: `Invoice ${invoice.invoiceId} has been sent to ${invoice.customerName} (${invoice.customerEmail}).`,
      link: "/invoices",
      linkLabel: "View Invoice",
      meta: { invoiceId: invoice.invoiceId },
    }),

  alertTriggered: (alert) =>
    createNotification({
      type: alert.type,
      priority: alert.priority,
      title: alert.title,
      message: alert.message,
      link: alert.link,
      linkLabel: alert.linkLabel,
      meta: alert.meta,
    }),

  // Add to src/utils/notificationUtils.js, inside the `notify` object alongside
  // notify.customerAdded, notify.carAdded, etc.
};
