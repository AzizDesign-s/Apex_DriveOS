// src/data/mockServiceOrders.js
// Seed service/maintenance work order data for Sprint 4 Phase 4.
//
// WORK ORDER LIFECYCLE:
//   pending → in_progress → completed
//                        → cancelled
//
// CROSS-MODULE:
//   Creating a work order  → vehicle status: current → maintenance
//   Completing/Cancelling  → vehicle status: maintenance → available

// ── Work order ID generator ───────────────────────────────────────────────────
export const generateWorkOrderId = (existingOrders = []) => {
  const nums = existingOrders
    .map((o) => {
      const match = (o.workOrderId || "").match(/WO-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `WO-${String(max + 1).padStart(4, "0")}`;
};

// ── Service types ─────────────────────────────────────────────────────────────
export const SERVICE_TYPES = [
  "Routine Maintenance",
  "Repair",
  "Inspection",
  "Detailing",
  "Tyre Change",
  "Oil Change",
  "Custom",
];

// ── Work order statuses ───────────────────────────────────────────────────────
export const SERVICE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// ── Seed work orders ──────────────────────────────────────────────────────────
// Porsche 911 Turbo S (id:6) is already in "maintenance" status in seed cars[]
// so we give it an active work order here.
export const serviceOrders = [
  {
    id: 1,
    workOrderId: "WO-0001",
    vehicleId: 6,
    vehicleName: "Porsche 911 Turbo S",
    vehiclePlate: "PCH-911",
    vehicleImage:
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&q=80",
    technicianName: "",
    type: "Routine Maintenance",
    status: "in_progress",
    estimatedCost: 8500,
    actualCost: null,
    parts: [
      { name: "Engine Oil Filter", qty: 1, unitCost: 180 },
      { name: "Brake Pads (Set)", qty: 1, unitCost: 2200 },
      { name: "Air Filter", qty: 2, unitCost: 320 },
    ],
    startDate: "2026-06-09",
    completedDate: null,
    notes:
      "Scheduled annual maintenance. Customer requested full inspection of brakes and suspension.",
    mileageAtService: 1800,
    createdAt: "2026-06-09T08:00:00",
    updatedAt: "2026-06-09T08:00:00",
  },
  {
    id: 2,
    workOrderId: "WO-0002",
    vehicleId: 1,
    vehicleName: "Mercedes AMG GT 63S",
    vehiclePlate: "AXG-2024",
    vehicleImage:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&q=80",
    technicianName: "",
    type: "Detailing",
    status: "completed",
    estimatedCost: 3500,
    actualCost: 3200,
    parts: [
      { name: "Ceramic Coating Kit", qty: 1, unitCost: 1800 },
      { name: "Interior Cleaner", qty: 2, unitCost: 150 },
    ],
    startDate: "2026-06-05",
    completedDate: "2026-06-07",
    notes: "Full exterior detailing + ceramic coating. Interior deep clean.",
    mileageAtService: 1200,
    createdAt: "2026-06-05T09:00:00",
    updatedAt: "2026-06-07T17:00:00",
  },
  {
    id: 3,
    workOrderId: "WO-0003",
    vehicleId: 5,
    vehicleName: "Lamborghini Urus Performante",
    vehiclePlate: "LMB-URS",
    vehicleImage:
      "https://images.unsplash.com/photo-1544169785-be38eb42ce11?w=400&q=80",
    technicianName: "",
    type: "Inspection",
    status: "completed",
    estimatedCost: 1200,
    actualCost: 1200,
    parts: [],
    startDate: "2026-06-01",
    completedDate: "2026-06-01",
    notes: "Pre-delivery inspection before customer handover.",
    mileageAtService: 200,
    createdAt: "2026-06-01T07:00:00",
    updatedAt: "2026-06-01T12:00:00",
  },
  {
    id: 4,
    workOrderId: "WO-0004",
    vehicleId: 4,
    vehicleName: "Rolls Royce Ghost EWB",
    vehiclePlate: "RRG-2024",
    vehicleImage:
      "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=400&q=80",
    technicianName: "",
    type: "Repair",
    status: "pending",
    estimatedCost: 12000,
    actualCost: null,
    parts: [
      { name: "Suspension Arm (L)", qty: 1, unitCost: 4500 },
      { name: "Suspension Arm (R)", qty: 1, unitCost: 4500 },
    ],
    startDate: "2026-06-18",
    completedDate: null,
    notes: "Minor suspension noise reported. Scheduled for repair next week.",
    mileageAtService: 500,
    createdAt: "2026-06-15T10:00:00",
    updatedAt: "2026-06-15T10:00:00",
  },
];
