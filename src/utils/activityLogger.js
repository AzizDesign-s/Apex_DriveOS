// src/utils/activityLogger.js
//
// Activity log creation and management utility.
// Same architectural pattern as notificationUtils.js —
// one utility, one localStorage key, imported by any module that
// needs to log an action.
//
// KEY DIFFERENCE FROM NOTIFICATIONS:
// Activity logs are APPEND-ONLY and IMMUTABLE. You never mark them
// as "read" or "unread" — you only add to the list, filter it,
// and display it. There is no bell badge for activity logs.
//
// WHO CALLS THIS:
// Every module that creates, updates, deletes, or changes the status
// of a record. Phase 2 will wire these calls into each module page.
// Phase 1 just establishes the infrastructure.

const LS_KEY = "apex-driveos-activity";

// ── Load all activity logs ────────────────────────────────────────────────────
export const loadActivityLogs = () => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
    // First load — seed from mockActivityLogs
    const { activityLogs } = require("../data/mockActivityLogs");
    localStorage.setItem(LS_KEY, JSON.stringify(activityLogs));
    return activityLogs;
  } catch {
    return [];
  }
};

// ── Save activity logs ────────────────────────────────────────────────────────
const saveActivityLogs = (logs) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(logs));
    window.dispatchEvent(
      new CustomEvent("apex-driveos-activity-updated", { detail: { logs } }),
    );
  } catch {
    /* silent */
  }
};

let activityCounter = 0;

// ── Create a single activity log entry ───────────────────────────────────────
// module:      'inventory' | 'customers' | 'test_drives' | 'invoices' |
//              'users' | 'leads' | 'service' | 'system'
// action:      'created' | 'updated' | 'deleted' | 'status_changed' |
//              'approved' | 'completed' | 'rejected' | 'cancelled' |
//              'converted' | 'assigned' | 'logged_in' | 'logged_out'
// entityId:    the ID of the affected record
// entityLabel: human-readable name ("Mercedes AMG GT 63S")
// actor:       display name of who performed the action
// actorId:     employee ID or "admin" or "system"
// description: full sentence — what happened
// meta:        any extra context (oldStatus, newStatus, amount, etc.)

export const logActivity = ({
  module,
  action,
  entityId = null,
  entityLabel = "",
  actor = "Admin User",
  actorId = "admin",
  description,
  meta = {},
}) => {
  const existing = loadActivityLogs();
  activityCounter += 1;

  const entry = {
    id: `ACT-${Date.now()}-${activityCounter}`,
    module,
    action,
    entityId,
    entityLabel,
    actor,
    actorId,
    description,
    meta,
    createdAt: new Date().toISOString(),
  };

  // Prepend — newest first
  const updated = [entry, ...existing];

  // Cap at 500 entries to prevent unbounded localStorage growth
  const capped = updated.slice(0, 500);
  saveActivityLogs(capped);
  return entry;
};

// ── Pre-built log templates per module ───────────────────────────────────────
// Same pattern as notify.* in notificationUtils.js.
// Each module imports { activity } and calls e.g. activity.carAdded(car)

export const activity = {
  // ── Inventory ──
  carAdded: (car, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "inventory",
      action: "created",
      entityId: car.id,
      entityLabel: `${car.brand} ${car.model} (${car.plate})`,
      actor,
      actorId,
      description: `Added ${car.brand} ${car.model} (${car.plate}) to inventory. Price: AED ${Number(car.price).toLocaleString()}. Status: ${car.status}.`,
      meta: { plate: car.plate, price: car.price, status: car.status },
    }),

  carUpdated: (car, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "inventory",
      action: "updated",
      entityId: car.id,
      entityLabel: `${car.brand} ${car.model} (${car.plate})`,
      actor,
      actorId,
      description: `Updated ${car.brand} ${car.model} (${car.plate}) details.`,
      meta: { plate: car.plate },
    }),

  carStatusChanged: (
    car,
    oldStatus,
    newStatus,
    actor = "Admin User",
    actorId = "admin",
  ) =>
    logActivity({
      module: "inventory",
      action: "status_changed",
      entityId: car.id,
      entityLabel: `${car.brand} ${car.model} (${car.plate})`,
      actor,
      actorId,
      description: `Updated ${car.brand} ${car.model} (${car.plate}) status from ${oldStatus} to ${newStatus}.`,
      meta: { plate: car.plate, oldStatus, newStatus },
    }),

  carDeleted: (car, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "inventory",
      action: "deleted",
      entityId: car.id,
      entityLabel: `${car.brand} ${car.model} (${car.plate})`,
      actor,
      actorId,
      description: `Removed ${car.brand} ${car.model} (${car.plate}) from inventory.`,
      meta: { plate: car.plate },
    }),

  // ── Customers ──
  customerAdded: (customer, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "customers",
      action: "created",
      entityId: customer.id,
      entityLabel: `${customer.name} (${customer.customerId})`,
      actor,
      actorId,
      description: `Created customer profile for ${customer.name} (${customer.customerId}). Source: ${customer.source}. Status: ${customer.status}.`,
      meta: {
        customerId: customer.customerId,
        source: customer.source,
        status: customer.status,
      },
    }),

  customerUpdated: (customer, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "customers",
      action: "updated",
      entityId: customer.id,
      entityLabel: `${customer.name} (${customer.customerId})`,
      actor,
      actorId,
      description: `Updated profile for ${customer.name} (${customer.customerId}).`,
      meta: { customerId: customer.customerId },
    }),

  customerStatusChanged: (
    customer,
    oldStatus,
    newStatus,
    actor = "Admin User",
    actorId = "admin",
  ) =>
    logActivity({
      module: "customers",
      action: "status_changed",
      entityId: customer.id,
      entityLabel: `${customer.name} (${customer.customerId})`,
      actor,
      actorId,
      description: `Updated ${customer.name} (${customer.customerId}) status from ${oldStatus} to ${newStatus}.`,
      meta: { customerId: customer.customerId, oldStatus, newStatus },
    }),

  customerDeleted: (customer, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "customers",
      action: "deleted",
      entityId: customer.id,
      entityLabel: `${customer.name} (${customer.customerId})`,
      actor,
      actorId,
      description: `Removed ${customer.name} (${customer.customerId}) from CRM.`,
      meta: { customerId: customer.customerId },
    }),

  // ── Test Drives ──
  bookingCreated: (booking, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "test_drives",
      action: "created",
      entityId: booking.id,
      entityLabel: booking.bookingId,
      actor,
      actorId,
      description: `Created test drive booking ${booking.bookingId} for ${booking.customerName} · ${booking.carName} on ${booking.date}.`,
      meta: {
        bookingId: booking.bookingId,
        customerId: booking.customerId,
        carId: booking.carId,
      },
    }),

  bookingStatusChanged: (
    booking,
    oldStatus,
    newStatus,
    actor = "Admin User",
    actorId = "admin",
  ) =>
    logActivity({
      module: "test_drives",
      action: "status_changed",
      entityId: booking.id,
      entityLabel: booking.bookingId,
      actor,
      actorId,
      description: `Test drive ${booking.bookingId} (${booking.customerName} · ${booking.carName}) status changed from ${oldStatus} to ${newStatus}.`,
      meta: { bookingId: booking.bookingId, oldStatus, newStatus },
    }),

  bookingCompleted: (booking, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "test_drives",
      action: "completed",
      entityId: booking.id,
      entityLabel: booking.bookingId,
      actor,
      actorId,
      description: `Test drive ${booking.bookingId} completed. Customer: ${booking.customerName} · ${booking.carName}.`,
      meta: { bookingId: booking.bookingId, customerId: booking.customerId },
    }),

  bookingDeleted: (booking, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "test_drives",
      action: "deleted",
      entityId: booking.id,
      entityLabel: booking.bookingId,
      actor,
      actorId,
      description: `Deleted test drive booking ${booking.bookingId} for ${booking.customerName}.`,
      meta: { bookingId: booking.bookingId },
    }),

  // ── Invoices ──
  invoiceCreated: (invoice, total, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "invoices",
      action: "created",
      entityId: invoice.id,
      entityLabel: invoice.invoiceId,
      actor,
      actorId,
      description: `Created Invoice ${invoice.invoiceId} for ${invoice.customerName} · ${invoice.carName}. Total: AED ${Number(total).toLocaleString()}.`,
      meta: {
        invoiceId: invoice.invoiceId,
        customerId: invoice.customerId,
        total,
      },
    }),

  invoiceStatusChanged: (
    invoice,
    oldStatus,
    newStatus,
    actor = "Admin User",
    actorId = "admin",
  ) =>
    logActivity({
      module: "invoices",
      action: "status_changed",
      entityId: invoice.id,
      entityLabel: invoice.invoiceId,
      actor,
      actorId,
      description: `Invoice ${invoice.invoiceId} status changed from ${oldStatus} to ${newStatus}.`,
      meta: { invoiceId: invoice.invoiceId, oldStatus, newStatus },
    }),

  invoiceDeleted: (invoice, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "invoices",
      action: "deleted",
      entityId: invoice.id,
      entityLabel: invoice.invoiceId,
      actor,
      actorId,
      description: `Deleted Invoice ${invoice.invoiceId} for ${invoice.customerName}.`,
      meta: { invoiceId: invoice.invoiceId },
    }),

  // ── Users ──
  userAdded: (user, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "users",
      action: "created",
      entityId: user.id,
      entityLabel: `${user.fullName} (${user.employeeId})`,
      actor,
      actorId,
      description: `Created staff account for ${user.fullName} (${user.employeeId}).`,
      meta: { employeeId: user.employeeId },
    }),

  userUpdated: (user, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "users",
      action: "updated",
      entityId: user.id,
      entityLabel: `${user.fullName} (${user.employeeId})`,
      actor,
      actorId,
      description: `Updated profile for ${user.fullName} (${user.employeeId}).`,
      meta: { employeeId: user.employeeId },
    }),

  userStatusChanged: (
    user,
    oldStatus,
    newStatus,
    actor = "Admin User",
    actorId = "admin",
  ) =>
    logActivity({
      module: "users",
      action: "status_changed",
      entityId: user.id,
      entityLabel: `${user.fullName} (${user.employeeId})`,
      actor,
      actorId,
      description: `${user.fullName} (${user.employeeId}) status changed from ${oldStatus} to ${newStatus}.`,
      meta: { employeeId: user.employeeId, oldStatus, newStatus },
    }),

  userDeleted: (user, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "users",
      action: "deleted",
      entityId: user.id,
      entityLabel: `${user.fullName} (${user.employeeId})`,
      actor,
      actorId,
      description: `Removed ${user.fullName} (${user.employeeId}) from the system.`,
      meta: { employeeId: user.employeeId },
    }),

  // ── Leads (Phase 3) ──
  leadCreated: (lead, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "leads",
      action: "created",
      entityId: lead.id,
      entityLabel: `${lead.name} (${lead.leadId})`,
      actor,
      actorId,
      description: `New lead created for ${lead.name}. Source: ${lead.source}. Interested in: ${lead.interestedVehicle || "Not specified"}.`,
      meta: { leadId: lead.leadId, source: lead.source },
    }),

  leadStatusChanged: (
    lead,
    oldStatus,
    newStatus,
    actor = "Admin User",
    actorId = "admin",
  ) =>
    logActivity({
      module: "leads",
      action: "status_changed",
      entityId: lead.id,
      entityLabel: `${lead.name} (${lead.leadId})`,
      actor,
      actorId,
      description: `Lead ${lead.leadId} (${lead.name}) moved from ${oldStatus} to ${newStatus}.`,
      meta: { leadId: lead.leadId, oldStatus, newStatus },
    }),

  leadConverted: (lead, customer, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "leads",
      action: "converted",
      entityId: lead.id,
      entityLabel: `${lead.name} (${lead.leadId})`,
      actor,
      actorId,
      description: `Lead ${lead.leadId} (${lead.name}) converted to customer ${customer.customerId}.`,
      meta: { leadId: lead.leadId, customerId: customer.customerId },
    }),

  // ── Service (Phase 4) ──
  serviceCreated: (order, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "service",
      action: "created",
      entityId: order.id,
      entityLabel: `${order.workOrderId}`,
      actor,
      actorId,
      description: `Created work order ${order.workOrderId} for ${order.vehicleName}. Type: ${order.type}. Assigned to: ${order.technicianName}.`,
      meta: { workOrderId: order.workOrderId, vehicleId: order.vehicleId },
    }),

  serviceCompleted: (order, actor = "Admin User", actorId = "admin") =>
    logActivity({
      module: "service",
      action: "completed",
      entityId: order.id,
      entityLabel: `${order.workOrderId}`,
      actor,
      actorId,
      description: `Work order ${order.workOrderId} for ${order.vehicleName} completed. Cost: AED ${Number(order.cost).toLocaleString()}.`,
      meta: { workOrderId: order.workOrderId, cost: order.cost },
    }),

  // ── System ──
  systemEvent: (description, meta = {}) =>
    logActivity({
      module: "system",
      action: "created",
      entityId: null,
      entityLabel: "System",
      actor: "System",
      actorId: "system",
      description,
      meta,
    }),
};
