// src/data/mockData.js
//
// ─── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
// All fake data lives in ONE place. This means:
//   1. Easy to swap with real API data later — just change imports
//   2. Consistent data across all pages (same cars, same customers)
//   3. No hardcoded values scattered across components
// ─────────────────────────────────────────────────────────────────────────────

// ── KPI STATS ────────────────────────────────────────────────────────────────
export const kpiStats = {
  totalInventory: { value: 48, trend: "+4 this week", up: true },
  totalRevenue: { value: "AED 2.4M", trend: "+12% MoM", up: true },
  carsSold: { value: 17, trend: "+3 this week", up: true },
  testDrives: { value: 6, trend: "3 pending", up: null },
  newCustomers: { value: 24, trend: "+8 this month", up: true },
  pendingInvoices: { value: 11, trend: "4 overdue", up: false },
};

// ── MONTHLY REVENUE ───────────────────────────────────────────────────────────
export const monthlyRevenue = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  data2026: [1.2, 1.5, 1.8, 2.1, 2.4, 2.2, null, null, null, null, null, null],
  data2025: [0.9, 1.1, 1.3, 1.6, 1.9, 1.7, 1.8, 2.0, 1.9, 2.1, 1.8, 2.2],
};

// ── TOP BRANDS ────────────────────────────────────────────────────────────────
export const topBrands = [
  { brand: "Mercedes", sold: 14, color: "rgba(212,175,55,0.85)" },
  { brand: "BMW", sold: 11, color: "rgba(56,189,248,0.75)" },
  { brand: "Porsche", sold: 7, color: "rgba(16,185,129,0.75)" },
  { brand: "Ferrari", sold: 7, color: "rgba(251,113,133,0.75)" },
  { brand: "Rolls Royce", sold: 5, color: "rgba(167,139,250,0.75)" },
  { brand: "Lamborghini", sold: 4, color: "rgba(251,191,36,0.75)" },
];

// ── SALES BY CATEGORY (donut) ─────────────────────────────────────────────────
export const salesByCategory = [
  { label: "Sedan", value: 35, color: "#D4AF37" },
  { label: "SUV", value: 28, color: "#38BDF8" },
  { label: "Sports", value: 22, color: "#10B981" },
  { label: "Luxury", value: 15, color: "#A78BFA" },
];

// ── RECENT ACTIVITY ───────────────────────────────────────────────────────────
export const recentActivity = [
  {
    id: 1,
    type: "test_drive",
    title: "Test Drive Confirmed",
    sub: "Mohammed Al-Rashid · Mercedes AMG GT",
    time: "2m ago",
    iconBg: "rgba(16,185,129,0.12)",
    iconColor: "#10B981",
    icon: "check",
  },
  {
    id: 2,
    type: "invoice",
    title: "Invoice #INV-0042 Created",
    sub: "AED 380,000 · BMW M8 Competition",
    time: "18m ago",
    iconBg: "rgba(212,175,55,0.12)",
    iconColor: "#D4AF37",
    icon: "file-invoice",
  },
  {
    id: 3,
    type: "customer",
    title: "New Customer Registered",
    sub: "Sarah Johnson · Inquiry: Rolls Royce",
    time: "1h ago",
    iconBg: "rgba(56,189,248,0.12)",
    iconColor: "#38BDF8",
    icon: "user-plus",
  },
  {
    id: 4,
    type: "sale",
    title: "Car Sold · Ferrari 488",
    sub: "AED 920,000 · Cash Payment",
    time: "3h ago",
    iconBg: "rgba(251,113,133,0.12)",
    iconColor: "#FB7185",
    icon: "car",
  },
  {
    id: 5,
    type: "booking",
    title: "New Booking Request",
    sub: "Khalid Al-Mansoori · Lamborghini Urus",
    time: "5h ago",
    iconBg: "rgba(251,191,36,0.12)",
    iconColor: "#FBBF24",
    icon: "calendar",
  },
];

// ── QUICK ACTIONS ─────────────────────────────────────────────────────────────
export const quickActions = [
  {
    label: "Add Car",
    sub: "Inventory",
    path: "/inventory",
    iconBg: "rgba(212,175,55,0.1)",
    iconColor: "#D4AF37",
    icon: "circle-plus",
  },
  {
    label: "New Invoice",
    sub: "Finance",
    path: "/invoices",
    iconBg: "rgba(56,189,248,0.1)",
    iconColor: "#38BDF8",
    icon: "file-text",
  },
  {
    label: "Book Drive",
    sub: "Test Drive",
    path: "/test-drives",
    iconBg: "rgba(16,185,129,0.1)",
    iconColor: "#10B981",
    icon: "calendar-plus",
  },
];

// ── CUSTOMERS (used in Phase 6) ───────────────────────────────────────────────
export const customers = [
  {
    id: 1,
    name: "Mohammed Al-Rashid",
    email: "mo.rashid@email.com",
    phone: "+971 50 123 4567",
    city: "Dubai",
    status: "active",
    purchases: 2,
    totalSpent: 1060000,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+971 55 987 6543",
    city: "Abu Dhabi",
    status: "prospect",
    purchases: 0,
    totalSpent: 0,
  },
  {
    id: 3,
    name: "Khalid Al-Mansoori",
    email: "k.mansoori@email.com",
    phone: "+971 52 456 7890",
    city: "Dubai",
    status: "active",
    purchases: 1,
    totalSpent: 750000,
  },
  {
    id: 4,
    name: "Emma Williams",
    email: "emma.w@email.com",
    phone: "+971 58 321 0987",
    city: "Sharjah",
    status: "active",
    purchases: 3,
    totalSpent: 2200000,
  },
];

// Add to existing mockData.js

// ── COLUMN CONFIG — default table columns ─────────────────────────────────────
// This is the source of truth for the inventory table columns.
// Each column has: id, label, visible (default), width class
// Saved to localStorage so user preferences persist across refresh.
export const DEFAULT_COLUMNS = [
  { id: "image", label: "Photo", visible: true, canHide: false },
  { id: "car", label: "Car", visible: true, canHide: false },
  { id: "status", label: "Status", visible: true, canHide: true },
  { id: "price", label: "Price", visible: true, canHide: true },
  { id: "fuel", label: "Fuel", visible: true, canHide: true },
  { id: "mileage", label: "Mileage", visible: true, canHide: true },
  { id: "transmission", label: "Transmission", visible: false, canHide: true },
  { id: "plate", label: "Plate No.", visible: false, canHide: true },
  { id: "year", label: "Year", visible: false, canHide: true },
  { id: "category", label: "Body Type", visible: false, canHide: true },
];

// ── BRAND → MODELS MAP ────────────────────────────────────────────────────────
export const BRAND_MODELS = {
  Mercedes: [
    "AMG GT 63S",
    "C-Class",
    "E-Class",
    "S-Class",
    "GLE",
    "GLS",
    "Maybach S-Class",
  ],
  BMW: ["M8 Competition", "M5", "M3", "7 Series", "X7", "X5 M"],
  Ferrari: ["488 Pista", "Roma", "SF90", "Portofino", "812 Superfast"],
  "Rolls Royce": ["Ghost EWB", "Phantom", "Cullinan", "Wraith", "Dawn"],
  Lamborghini: ["Urus", "Huracán", "Aventador", "Urus Performante"],
  Porsche: ["911 Turbo S", "Cayenne Turbo", "Panamera", "Taycan"],
  Bentley: ["Continental GT", "Bentayga", "Flying Spur"],
  Aston: ["DB11", "Vantage", "DBS Superleggera"],
};

// ── FULL CAR DATA (expanded from Phase 4) ─────────────────────────────────────
export const cars = [
  {
    id: 1,
    brand: "Mercedes",
    model: "AMG GT 63S",
    variant: "AMG Line",
    year: 2024,
    price: 680000,
    currency: "AED",
    discount: 15000,
    mileage: 1200,
    fuel: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    bodyType: "Coupe",
    category: "Sports",
    status: "available",
    plate: "AXG-2024",
    units: 2,
    exteriorColor: "#1a1a1a",
    exteriorColorName: "Obsidian Black",
    interiorColor: "#8B4513",
    interiorColorName: "Saddle Brown",
    colorType: "Matte",
    features:
      "• AMG Performance exhaust\n• Burmester surround sound\n• Night Vision Assist\n• Head-up display\n• Active Ride Control",
    condition: "Brand new. Zero defects. Full dealer warranty.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80",
        label: "Exterior Front",
      },
      {
        url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
        label: "Interior",
      },
    ],
  },
  {
    id: 2,
    brand: "BMW",
    model: "M8 Competition",
    variant: "M Sport",
    year: 2024,
    price: 380000,
    currency: "AED",
    discount: 0,
    mileage: 800,
    fuel: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    bodyType: "Sedan",
    category: "Sedan",
    status: "reserved",
    plate: "BMW-M8X",
    units: 1,
    exteriorColor: "#FFFFFF",
    exteriorColorName: "Alpine White",
    interiorColor: "#000000",
    interiorColorName: "Merino Black",
    colorType: "Glossy",
    features:
      "• M Carbon ceramic brakes\n• Harman Kardon audio\n• Gesture control\n• M Traction Control",
    condition: "Brand new. Reserved for Mohammed Al-Rashid.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
        label: "Exterior Front",
      },
      {
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
        label: "Exterior Side",
      },
      {
        url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
        label: "Interior",
      },
    ],
  },
  {
    id: 3,
    brand: "Ferrari",
    model: "488 Pista",
    variant: "Standard",
    year: 2023,
    price: 920000,
    currency: "AED",
    discount: 50000,
    mileage: 3400,
    fuel: "Petrol",
    transmission: "Automatic",
    driveType: "RWD",
    bodyType: "Coupe",
    category: "Sports",
    status: "sold",
    plate: "FER-488",
    units: 0,
    exteriorColor: "#CC0000",
    exteriorColorName: "Rosso Corsa",
    interiorColor: "#1a1a1a",
    interiorColorName: "Nero",
    colorType: "Glossy",
    features:
      "• Ferrari Dynamic Enhancer+\n• Carbon fibre body panels\n• Racing exhaust\n• Alcantara interior",
    condition: "Pre-owned. Excellent condition. Full service history.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80",
        label: "Exterior Front",
      },
      {
        url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
        label: "Exterior Rear",
      },
      {
        url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80",
        label: "Interior",
      },
      {
        url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
        label: "Engine Bay",
      },
    ],
  },
  {
    id: 4,
    brand: "Rolls Royce",
    model: "Ghost EWB",
    variant: "Black Badge",
    year: 2024,
    price: 1800000,
    currency: "AED",
    discount: 0,
    mileage: 500,
    fuel: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    bodyType: "Sedan",
    category: "Luxury",
    status: "available",
    plate: "RRG-2024",
    units: 1,
    exteriorColor: "#F5F5F5",
    exteriorColorName: "Arctic White",
    interiorColor: "#D4AF37",
    interiorColorName: "Gold",
    colorType: "Pearl",
    features:
      "• Starlight Headliner\n• Bespoke Audio system\n• Massage seats\n• Panoramic glass roof",
    condition: "Brand new. Bespoke commission.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=800&q=80",
        label: "Exterior Front",
      },
      {
        url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
        label: "Interior",
      },
    ],
  },
  {
    id: 5,
    brand: "Lamborghini",
    model: "Urus Performante",
    variant: "Standard",
    year: 2024,
    price: 750000,
    currency: "AED",
    discount: 20000,
    mileage: 200,
    fuel: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    bodyType: "SUV",
    category: "SUV",
    status: "available",
    plate: "LMB-URS",
    units: 3,
    exteriorColor: "#FFD700",
    exteriorColorName: "Giallo Orion",
    interiorColor: "#000000",
    interiorColorName: "Black Alcantara",
    colorType: "Metallic",
    features:
      "• Torque Vectoring AWD\n• Carbon ceramic brakes\n• Bang & Olufsen audio\n• Lamborghini Telemetry",
    condition: "Brand new.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1544169785-be38eb42ce11?w=800&q=80",
        label: "Exterior Front",
      },
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        label: "Exterior Side",
      },
      {
        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
        label: "Interior",
      },
    ],
  },
  {
    id: 6,
    brand: "Porsche",
    model: "911 Turbo S",
    variant: "Cabriolet",
    year: 2024,
    price: 620000,
    currency: "AED",
    discount: 0,
    mileage: 1800,
    fuel: "Petrol",
    transmission: "Automatic",
    driveType: "AWD",
    bodyType: "Coupe",
    category: "Sports",
    status: "maintenance",
    plate: "PCH-911",
    units: 1,
    exteriorColor: "#C0C0C0",
    exteriorColorName: "GT Silver",
    interiorColor: "#2C2C2C",
    interiorColorName: "Slate Grey",
    colorType: "Metallic",
    features:
      "• PDCC Sport\n• Burmester audio\n• Sport Chrono Package\n• Night Vision",
    condition: "Pre-owned. Scheduled maintenance in progress.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80",
        label: "Exterior Front",
      },
      {
        url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
        label: "Interior",
      },
    ],
  },
];
