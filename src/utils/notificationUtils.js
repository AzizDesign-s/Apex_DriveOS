// src/utils/notificationUtils.js
//
// Notification creation and management utilities.
// Both Navbar and Notifications page read from the same localStorage key.
// Phase 2: replace with useNotificationStore actions.

// ── Storage key ───────────────────────────────────────────────────────────────
const LS_KEY = "apex-gt-notifications";

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
      new CustomEvent("apex-gt-notif-count-updated", {
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
      new CustomEvent("apex-gt-notifications-updated", {
        detail: { notifications },
      }),
    );
    // BUG-2 FIX: also dispatch count update for Sidebar badge
    syncCountToStore(notifications);
  } catch {
    /* silent */
  }
};

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
  const newNotif = {
    id: Date.now(),
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
  carAdded: (car) =>
    createNotification({
      type: "inventory",
      priority: "low",
      title: "Car Added to Inventory",
      message: `${car.brand} ${car.model} (${car.plate}) has been added to inventory. Status: ${car.status}. Price: AED ${Number(car.price).toLocaleString()}.`,
      link: "/inventory",
      linkLabel: "View Inventory",
      meta: { carId: car.id, plate: car.plate },
    }),

  carUpdated: (car) =>
    createNotification({
      type: "inventory",
      priority: "low",
      title: "Car Updated",
      message: `${car.brand} ${car.model} (${car.plate}) details have been updated.`,
      link: "/inventory",
      linkLabel: "View Car",
      meta: { carId: car.id, plate: car.plate },
    }),

  carStatusChanged: (car, newStatus) =>
    createNotification({
      type: "inventory",
      priority: newStatus === "sold" ? "high" : "medium",
      title: `Car ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: `${car.brand} ${car.model} (${car.plate}) status changed to ${newStatus}.`,
      link: "/inventory",
      linkLabel: "View Inventory",
      meta: { carId: car.id, plate: car.plate, status: newStatus },
    }),

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
  customerAdded: (customer) =>
    createNotification({
      type: "customer",
      priority: "low",
      title: "New Customer Added",
      message: `${customer.name} (${customer.customerId}) has been added to the CRM. Source: ${customer.source}. Status: ${customer.status}.`,
      link: "/customers",
      linkLabel: "View Customer",
      meta: { customerId: customer.customerId },
    }),

  customerUpdated: (customer) =>
    createNotification({
      type: "customer",
      priority: "low",
      title: "Customer Updated",
      message: `${customer.name} (${customer.customerId}) profile has been updated.`,
      link: "/customers",
      linkLabel: "View Customer",
      meta: { customerId: customer.customerId },
    }),

  // ── Test Drives ──
  bookingCreated: (booking) =>
    createNotification({
      type: "test_drive",
      priority: "medium",
      title: "Test Drive Booked",
      message: `${booking.customerName} has requested a test drive for ${booking.carName} on ${booking.date} at ${booking.time}. Assigned to ${booking.exec || "Unassigned"}.`,
      link: "/test-drives",
      linkLabel: "View Booking",
      meta: { bookingId: booking.bookingId },
    }),

  bookingApproved: (booking) =>
    createNotification({
      type: "test_drive",
      priority: "high",
      title: "Test Drive Approved",
      message: `${booking.customerName}'s test drive for ${booking.carName} has been approved. Scheduled for ${booking.date} at ${booking.time}.`,
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

  // ── Invoices ──
  invoiceCreated: (invoice) =>
    createNotification({
      type: "invoice",
      priority: "low",
      title: "New Invoice Created",
      message: `Invoice ${invoice.invoiceId} created for ${invoice.customerName}. Due: ${invoice.dueDate}.`,
      link: "/invoices",
      linkLabel: "View Invoice",
      meta: { invoiceId: invoice.invoiceId },
    }),

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

  // Add to src/utils/notificationUtils.js, inside the `notify` object alongside
  // notify.customerAdded, notify.carAdded, etc.

  userAdded: (user) =>
    createNotification({
      type: "user",
      priority: "low",
      title: "New User Added",
      message: `${user.fullName} (${user.employeeId}) has been added to the team.`,
      link: "/users",
      linkLabel: "View User",
      meta: { userId: user.employeeId },
    }),

  userUpdated: (user) =>
    createNotification({
      type: "user",
      priority: "low",
      title: "User Updated",
      message: `${user.fullName} (${user.employeeId}) profile has been updated.`,
      link: "/users",
      linkLabel: "View User",
      meta: { userId: user.employeeId },
    }),

  userStatusChanged: (user, newStatus) =>
    createNotification({
      type: "user",
      priority: newStatus === "suspended" ? "high" : "medium",
      title: `User ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: `${user.fullName} (${user.employeeId}) status changed to ${newStatus}.`,
      link: "/users",
      linkLabel: "View User",
      meta: { userId: user.employeeId, status: newStatus },
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
};
