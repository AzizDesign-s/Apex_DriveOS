// src/data/mockLeads.js
//
// Seed lead data for Sprint 4 Phase 3 — Lead Management.
//
// LEAD STATUS PIPELINE:
//   new_inquiry → contacted → interested → reserved → won → lost
//
// CROSS-MODULE SYNC:
//   new_inquiry  → Customer record created immediately (Option A decision)
//   interested   → Car status: available → interested
//   reserved     → Car status: interested → reserved
//   won          → Car status: reserved → sold
//   lost         → Car status: reverts to previous (available or interested)
//
// LEAD SOURCES:
//   Website, Walk-in, WhatsApp, Instagram, Referral, Phone

// ── Lead ID generator ─────────────────────────────────────────────────────────
export const generateLeadId = (existingLeads = []) => {
  const nums = existingLeads
    .map((l) => {
      const match = (l.leadId || "").match(/LEAD-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `LEAD-${String(max + 1).padStart(3, "0")}`;
};

// ── Lead sources ──────────────────────────────────────────────────────────────
export const LEAD_SOURCES = [
  "Website",
  "Walk-in",
  "WhatsApp",
  "Instagram",
  "Referral",
  "Phone",
];

// ── Kanban column config ──────────────────────────────────────────────────────
// order matters — left to right on the board
export const LEAD_COLUMNS = [
  {
    id: "new_inquiry",
    label: "New Inquiry",
    color: "#38BDF8", // sky blue
    description: "Fresh leads, not yet contacted",
  },
  {
    id: "contacted",
    label: "Contacted",
    color: "#A78BFA", // violet
    description: "Sales exec has reached out",
  },
  {
    id: "interested",
    label: "Interested",
    color: "#FBBF24", // amber
    description: "Lead confirmed interest — car marked interested",
  },
  {
    id: "reserved",
    label: "Reserved",
    color: "#D4AF37", // gold
    description: "Deposit confirmed — car reserved",
  },
  {
    id: "won",
    label: "Won",
    color: "#10B981", // emerald
    description: "Deal closed — car sold",
  },
  {
    id: "lost",
    label: "Lost",
    color: "#FB7185", // rose
    description: "Lead dropped off",
  },
];

// ── Seed leads ────────────────────────────────────────────────────────────────
export const leads = [
  {
    id: 1,
    leadId: "LEAD-001",
    name: "Faisal Al-Mutairi",
    email: "faisal.m@email.com",
    phone: "55 234 5678",
    mobileCode: "+971",
    source: "Instagram",
    status: "new_inquiry",
    interestedCarId: 4,
    interestedCarName: "Rolls Royce Ghost EWB",
    interestedCarPlate: "RRG-2024",
    interestedCarImage:
      "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=400&q=80",
    assignedExec: "",
    followUpDate: "2026-06-20",
    notes: "Found us on Instagram. Interested in the Black Badge variant.",
    customerId: null,
    convertedAt: null,
    createdAt: "2026-06-15T10:00:00",
    updatedAt: "2026-06-15T10:00:00",
  },
  {
    id: 2,
    leadId: "LEAD-002",
    name: "Layla Hassan",
    email: "layla.h@email.com",
    phone: "50 876 5432",
    mobileCode: "+971",
    source: "Website",
    status: "contacted",
    interestedCarId: 1,
    interestedCarName: "Mercedes AMG GT 63S",
    interestedCarPlate: "AXG-2024",
    interestedCarImage:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&q=80",
    assignedExec: "Ahmed Al-Sayed",
    followUpDate: "2026-06-18",
    notes: "Submitted contact form on website. Called once, left voicemail.",
    customerId: null,
    convertedAt: null,
    createdAt: "2026-06-14T09:30:00",
    updatedAt: "2026-06-14T14:00:00",
  },
  {
    id: 3,
    leadId: "LEAD-003",
    name: "Tariq Al-Rashidi",
    email: "tariq.r@email.com",
    phone: "52 345 6789",
    mobileCode: "+971",
    source: "Referral",
    status: "interested",
    interestedCarId: 5,
    interestedCarName: "Lamborghini Urus Performante",
    interestedCarPlate: "LMB-URS",
    interestedCarImage:
      "https://images.unsplash.com/photo-1544169785-be38eb42ce11?w=400&q=80",
    assignedExec: "Omar Khalid",
    followUpDate: "2026-06-17",
    notes: "Referred by Khalid Al-Mansoori (CUST-003). Serious buyer.",
    customerId: null,
    convertedAt: null,
    createdAt: "2026-06-12T11:00:00",
    updatedAt: "2026-06-13T10:00:00",
  },
  {
    id: 4,
    leadId: "LEAD-004",
    name: "Nora Al-Qassimi",
    email: "nora.q@email.com",
    phone: "56 789 0123",
    mobileCode: "+971",
    source: "Walk-in",
    status: "reserved",
    interestedCarId: 2,
    interestedCarName: "BMW M8 Competition",
    interestedCarPlate: "BMW-M8X",
    interestedCarImage:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80",
    assignedExec: "Fatima Hassan",
    followUpDate: "2026-06-16",
    notes: "Walked in on Saturday. Loved the M8. Deposit AED 50,000 pending.",
    customerId: null,
    convertedAt: null,
    createdAt: "2026-06-10T14:00:00",
    updatedAt: "2026-06-12T09:00:00",
  },
  {
    id: 5,
    leadId: "LEAD-005",
    name: "James Whitfield",
    email: "j.whitfield@email.com",
    phone: "58 901 2345",
    mobileCode: "+971",
    source: "Phone",
    status: "won",
    interestedCarId: 6,
    interestedCarName: "Porsche 911 Turbo S",
    interestedCarPlate: "PCH-911",
    interestedCarImage:
      "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&q=80",
    assignedExec: "Sara Mohammed",
    followUpDate: null,
    notes: "Called from a referral. Full payment completed. Invoice raised.",
    customerId: null,
    convertedAt: "2026-06-10T00:00:00",
    createdAt: "2026-06-05T08:00:00",
    updatedAt: "2026-06-10T16:00:00",
  },
  {
    id: 6,
    leadId: "LEAD-006",
    name: "Priya Nair",
    email: "priya.n@email.com",
    phone: "54 012 3456",
    mobileCode: "+971",
    source: "WhatsApp",
    status: "lost",
    interestedCarId: 1,
    interestedCarName: "Mercedes AMG GT 63S",
    interestedCarPlate: "AXG-2024",
    interestedCarImage:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&q=80",
    assignedExec: "Bilal Yousuf",
    followUpDate: null,
    notes: "Lost interest after seeing the price. Budget mismatch.",
    customerId: null,
    convertedAt: null,
    createdAt: "2026-06-08T12:00:00",
    updatedAt: "2026-06-11T10:00:00",
  },
  {
    id: 7,
    leadId: "LEAD-007",
    name: "Hassan Al-Zaabi",
    email: "hassan.z@email.com",
    phone: "50 123 9876",
    mobileCode: "+971",
    source: "Instagram",
    status: "new_inquiry",
    interestedCarId: 1,
    interestedCarName: "Mercedes AMG GT 63S",
    interestedCarPlate: "AXG-2024",
    interestedCarImage:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&q=80",
    assignedExec: "",
    followUpDate: "2026-06-21",
    notes: "Second inquiry on the AMG GT. Unassigned.",
    customerId: null,
    convertedAt: null,
    createdAt: "2026-06-15T14:00:00",
    updatedAt: "2026-06-15T14:00:00",
  },
];
