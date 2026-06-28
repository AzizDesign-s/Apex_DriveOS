// src/data/mockPromotions.js
// Seed promotions data for Sprint 4 Phase 6.
//
// PROMOTION TYPES:
//   percentage   — e.g. 10% off the subtotal
//   flat         — e.g. AED 15,000 off
//   festival     — percentage with a named campaign
//   trade_in     — flat bonus for trade-in deals
//   finance      — percentage for finance payment method
//   loyalty      — percentage for returning customers
//   employee     — percentage for staff purchases
//
// APPLICABILITY:
//   appliesTo: "all" | "brand" | "model"
//   brandFilter: string | null   (e.g. "BMW")
//   modelFilter: string | null   (e.g. "M8 Competition")
//
// STATUS derived at runtime from startDate/endDate:
//   active   — today is within startDate → endDate
//   expired  — endDate is in the past
//   upcoming — startDate is in the future
//
// INVOICE INTEGRATION:
//   One promotion per invoice.
//   computeDiscount(promotion, subtotal) → AED discount amount

// ── Promotion ID generator ────────────────────────────────────────────────────
export const generatePromotionId = (existing = []) => {
  const nums = existing
    .map((p) => {
      const match = (p.promotionId || "").match(/PROMO-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `PROMO-${String(max + 1).padStart(3, "0")}`;
};

// ── Promotion types ───────────────────────────────────────────────────────────
export const PROMOTION_TYPES = [
  { value: "percentage", label: "Percentage Discount" },
  { value: "flat", label: "Flat Discount (AED)" },
  { value: "festival", label: "Festival Offer" },
  { value: "trade_in", label: "Trade-In Bonus" },
  { value: "finance", label: "Finance Discount" },
  { value: "loyalty", label: "Loyalty Discount" },
  { value: "employee", label: "Employee Discount" },
];

// ── Applicability options ─────────────────────────────────────────────────────
export const APPLICABILITY_OPTIONS = [
  { value: "all", label: "All Vehicles" },
  { value: "brand", label: "Specific Brand" },
  { value: "model", label: "Specific Model" },
];

// ── Compute discount from a promotion ────────────────────────────────────────
// Returns the AED discount amount given a promotion and the invoice subtotal.
// This is the single source of truth for promotion math.
export const computeDiscount = (promotion, subtotal) => {
  if (!promotion) return 0;
  if (promotion.discountType === "percentage") {
    return Math.round((subtotal * (promotion.discountValue || 0)) / 100);
  }
  // flat, festival, trade_in, finance, loyalty, employee
  return Number(promotion.discountValue || 0);
};

// ── Status helper ─────────────────────────────────────────────────────────────
export const getPromotionStatus = (promotion) => {
  const today = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  if (today < start) return "upcoming";
  if (today > end) return "expired";
  return "active";
};

// ── Check if promotion applies to a car ──────────────────────────────────────
// Used by the promotion picker in InvoiceFormPage to filter eligible promotions
export const promotionAppliesToCar = (promotion, car) => {
  if (!car) return promotion.appliesTo === "all";
  if (promotion.appliesTo === "all") return true;
  if (promotion.appliesTo === "brand")
    return promotion.brandFilter === car.brand;
  if (promotion.appliesTo === "model")
    return (
      promotion.brandFilter === car.brand && promotion.modelFilter === car.model
    );
  return false;
};

// ── Seed promotions ───────────────────────────────────────────────────────────
export const promotions = [
  {
    id: 1,
    promotionId: "PROMO-001",
    name: "Eid Al-Adha Special",
    description: "Celebrate Eid with an exclusive discount on all vehicles.",
    type: "festival",
    discountType: "percentage",
    discountValue: 8,
    appliesTo: "all",
    brandFilter: null,
    modelFilter: null,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    createdAt: "2026-05-20T08:00:00",
  },
  {
    id: 2,
    promotionId: "PROMO-002",
    name: "BMW Summer Drive",
    description: "Exclusive summer offer on all BMW models.",
    type: "percentage",
    discountType: "percentage",
    discountValue: 5,
    appliesTo: "brand",
    brandFilter: "BMW",
    modelFilter: null,
    startDate: "2026-06-01",
    endDate: "2026-07-31",
    createdAt: "2026-05-25T09:00:00",
  },
  {
    id: 3,
    promotionId: "PROMO-003",
    name: "Rolls Royce VIP Flat Offer",
    description: "AED 50,000 off the Rolls Royce Ghost EWB for VIP customers.",
    type: "flat",
    discountType: "flat",
    discountValue: 50000,
    appliesTo: "model",
    brandFilter: "Rolls Royce",
    modelFilter: "Ghost EWB",
    startDate: "2026-06-10",
    endDate: "2026-07-10",
    createdAt: "2026-06-01T10:00:00",
  },
  {
    id: 4,
    promotionId: "PROMO-004",
    name: "Loyalty Reward",
    description: "3% loyalty discount for returning customers.",
    type: "loyalty",
    discountType: "percentage",
    discountValue: 3,
    appliesTo: "all",
    brandFilter: null,
    modelFilter: null,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    createdAt: "2026-01-01T00:00:00",
  },
  {
    id: 5,
    promotionId: "PROMO-005",
    name: "Finance Deal — Q2",
    description: "2% off for customers paying via bank finance.",
    type: "finance",
    discountType: "percentage",
    discountValue: 2,
    appliesTo: "all",
    brandFilter: null,
    modelFilter: null,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    createdAt: "2026-03-28T08:00:00",
  },
  {
    id: 6,
    promotionId: "PROMO-006",
    name: "Trade-In Bonus",
    description: "AED 25,000 bonus when trading in any vehicle.",
    type: "trade_in",
    discountType: "flat",
    discountValue: 25000,
    appliesTo: "all",
    brandFilter: null,
    modelFilter: null,
    startDate: "2026-06-15",
    endDate: "2026-08-15",
    createdAt: "2026-06-12T09:00:00",
  },
  {
    id: 7,
    promotionId: "PROMO-007",
    name: "Ferrari Pista End of Line",
    description: "Last unit clearance — AED 75,000 off the Ferrari 488 Pista.",
    type: "flat",
    discountType: "flat",
    discountValue: 75000,
    appliesTo: "model",
    brandFilter: "Ferrari",
    modelFilter: "488 Pista",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    createdAt: "2026-04-28T10:00:00",
  },
];
