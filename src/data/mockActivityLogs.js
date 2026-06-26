// src/data/mockActivityLogs.js
//
// Seed activity log data for Sprint 4 Phase 1.
// Kept separate from mockData.js to avoid making that file even larger.
//
// WHAT IS AN ACTIVITY LOG?
// An immutable record of something that happened in the system.
// Unlike notifications (which require attention), activity logs are
// purely historical — they answer "who did what, when, to which record?"
//
// SHAPE:
// id          — unique identifier
// module      — which module generated this (inventory/customers/etc.)
// action      — what happened (created/updated/deleted/status_changed/
//               approved/completed/rejected/cancelled/logged_in/logged_out)
// entityId    — the ID of the record affected (carId, customerId, etc.)
// entityLabel — human-readable name of the record ("Mercedes AMG GT 63S")
// actor       — who performed the action ("Admin User" or "Ahmed Al-Sayed")
// actorId     — their employee ID or "admin"
// description — full sentence describing what happened
// meta        — extra context (old status, new status, amount, etc.)
// createdAt   — ISO timestamp

export const activityLogs = [
  {
    id: "ACT-001",
    module: "inventory",
    action: "created",
    entityId: 6,
    entityLabel: "Porsche 911 Turbo S (PCH-911)",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Added Porsche 911 Turbo S (PCH-911) to inventory. Price: AED 620,000. Status: Available.",
    meta: { plate: "PCH-911", price: 620000, status: "available" },
    createdAt: "2026-06-09T11:30:00",
  },
  {
    id: "ACT-002",
    module: "inventory",
    action: "status_changed",
    entityId: 4,
    entityLabel: "Rolls Royce Ghost EWB (RRG-2024)",
    actor: "Ahmed Al-Sayed",
    actorId: "EMP-002",
    description:
      "Updated Rolls Royce Ghost EWB (RRG-2024) status from Available to Reserved.",
    meta: { oldStatus: "available", newStatus: "reserved", plate: "RRG-2024" },
    createdAt: "2026-06-12T09:10:00",
  },
  {
    id: "ACT-003",
    module: "customers",
    action: "created",
    entityId: 2,
    entityLabel: "Sarah Johnson (CUST-002)",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Created customer profile for Sarah Johnson (CUST-002). Source: Facebook. Status: Prospect.",
    meta: { customerId: "CUST-002", source: "Facebook", status: "prospect" },
    createdAt: "2026-06-13T10:20:00",
  },
  {
    id: "ACT-004",
    module: "invoices",
    action: "created",
    entityId: 1,
    entityLabel: "INV-0042",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Created Invoice INV-0042 for Mohammed Al-Rashid · Mercedes AMG GT 63S. Total: AED 718,500. Due: 20 Jun 2026.",
    meta: { invoiceId: "INV-0042", customerId: 1, total: 718500 },
    createdAt: "2026-06-13T16:30:00",
  },
  {
    id: "ACT-005",
    module: "test_drives",
    action: "completed",
    entityId: 3,
    entityLabel: "TD-2026-003",
    actor: "Omar Khalid",
    actorId: "EMP-003",
    description:
      "Test drive TD-2026-003 completed. Customer: Khalid Al-Mansoori · Lamborghini Urus Performante.",
    meta: { bookingId: "TD-2026-003", customerId: 3, carId: 5 },
    createdAt: "2026-06-14T11:45:00",
  },
  {
    id: "ACT-006",
    module: "inventory",
    action: "status_changed",
    entityId: 3,
    entityLabel: "Ferrari 488 Pista (FER-488)",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Updated Ferrari 488 Pista (FER-488) status from Available to Sold following Invoice INV-0037.",
    meta: {
      oldStatus: "available",
      newStatus: "sold",
      plate: "FER-488",
      invoiceId: "INV-0037",
    },
    createdAt: "2026-06-11T14:00:00",
  },
  {
    id: "ACT-007",
    module: "customers",
    action: "updated",
    entityId: 3,
    entityLabel: "Khalid Al-Mansoori (CUST-003)",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Updated customer profile for Khalid Al-Mansoori (CUST-003). Status changed to VIP.",
    meta: { customerId: "CUST-003", oldStatus: "active", newStatus: "vip" },
    createdAt: "2026-06-10T09:00:00",
  },
  {
    id: "ACT-008",
    module: "users",
    action: "created",
    entityId: "EMP-002",
    entityLabel: "Ahmed Al-Sayed (EMP-002)",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Created staff account for Ahmed Al-Sayed (EMP-002). Role: Sales Executive. Department: Sales.",
    meta: {
      employeeId: "EMP-002",
      role: "Sales Executive",
      department: "Sales",
    },
    createdAt: "2026-06-08T10:00:00",
  },
  {
    id: "ACT-009",
    module: "invoices",
    action: "status_changed",
    entityId: 2,
    entityLabel: "INV-0041",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Invoice INV-0041 for Emma Williams marked as Overdue. Original due date: 10 Jun 2026.",
    meta: { invoiceId: "INV-0041", oldStatus: "sent", newStatus: "overdue" },
    createdAt: "2026-06-11T08:00:00",
  },
  {
    id: "ACT-010",
    module: "test_drives",
    action: "cancelled",
    entityId: 6,
    entityLabel: "TD-2026-006",
    actor: "Fatima Hassan",
    actorId: "EMP-004",
    description:
      "Test drive TD-2026-006 cancelled. Customer Ahmed Al-Farsi did not show up for Ferrari 488 Pista appointment.",
    meta: { bookingId: "TD-2026-006", customerId: 6, reason: "no_show" },
    createdAt: "2026-06-09T16:30:00",
  },
  {
    id: "ACT-011",
    module: "inventory",
    action: "updated",
    entityId: 1,
    entityLabel: "Mercedes AMG GT 63S (AXG-2024)",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Updated Mercedes AMG GT 63S (AXG-2024) details. Price adjusted to AED 680,000.",
    meta: {
      plate: "AXG-2024",
      field: "price",
      oldValue: 695000,
      newValue: 680000,
    },
    createdAt: "2026-06-08T14:00:00",
  },
  {
    id: "ACT-012",
    module: "invoices",
    action: "status_changed",
    entityId: 1,
    entityLabel: "INV-0042",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Invoice INV-0042 marked as Paid. Mohammed Al-Rashid · AED 718,500 received via Cash.",
    meta: {
      invoiceId: "INV-0042",
      newStatus: "paid",
      amount: 718500,
      method: "Cash",
    },
    createdAt: "2026-06-14T15:00:00",
  },
  {
    id: "ACT-013",
    module: "test_drives",
    action: "approved",
    entityId: 2,
    entityLabel: "TD-2026-002",
    actor: "Admin User",
    actorId: "admin",
    description:
      "Approved test drive TD-2026-002 for Sarah Johnson · Rolls Royce Ghost EWB on 11 Jun 2026.",
    meta: { bookingId: "TD-2026-002", customerId: 2, carId: 4 },
    createdAt: "2026-06-10T11:00:00",
  },
  {
    id: "ACT-014",
    module: "customers",
    action: "created",
    entityId: 5,
    entityLabel: "Ravi Krishnamurthy (CUST-005)",
    actor: "Fatima Hassan",
    actorId: "EMP-004",
    description:
      "Created customer profile for Ravi Krishnamurthy (CUST-005). Source: Instagram. Status: Inactive.",
    meta: { customerId: "CUST-005", source: "Instagram", status: "inactive" },
    createdAt: "2026-06-07T13:00:00",
  },
  {
    id: "ACT-015",
    module: "system",
    action: "created",
    entityId: null,
    entityLabel: "System",
    actor: "System",
    actorId: "system",
    description:
      "Apex DriveOS data backup completed successfully. All records secured.",
    meta: { type: "backup" },
    createdAt: "2026-06-10T02:00:00",
  },
];
