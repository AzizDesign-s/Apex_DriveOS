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

// Add to src/data/mockData.js

// ── CUSTOMER DATA ─────────────────────────────────────────────────────────────
export const CUSTOMER_SOURCES = [
  "Instagram",
  "Facebook",
  "WhatsApp",
  "Referral",
  "Walk-in",
  "Website",
  "Google Ads",
  "Exhibition",
  "Other",
];

export const COUNTRY_CODES = [
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+1", flag: "🇺🇸", label: "USA" },
  { code: "+966", flag: "🇸🇦", label: "KSA" },
  { code: "+974", flag: "🇶🇦", label: "Qatar" },
  { code: "+965", flag: "🇰🇼", label: "Kuwait" },
  { code: "+973", flag: "🇧🇭", label: "Bahrain" },
  { code: "+968", flag: "🇴🇲", label: "Oman" },
];

// Avatar color palette — rotates per customer
export const AVATAR_PALETTE = [
  { bg: "rgba(212,175,55,0.15)", text: "#D4AF37" },
  { bg: "rgba(56,189,248,0.15)", text: "#38BDF8" },
  { bg: "rgba(16,185,129,0.15)", text: "#10B981" },
  { bg: "rgba(167,139,250,0.15)", text: "#A78BFA" },
  { bg: "rgba(251,113,133,0.15)", text: "#FB7185" },
  { bg: "rgba(251,191,36,0.15)", text: "#FBBF24" },
];

// Auto-generate next customer ID
export const generateCustomerId = (existingCustomers) => {
  const max = existingCustomers.reduce((acc, c) => {
    const num = parseInt(c.customerId?.replace("CUST-", "") || "0");
    return Math.max(acc, num);
  }, 0);
  return `CUST-${String(max + 1).padStart(3, "0")}`;
};

export const customers = [
  {
    id: 1,
    customerId: "CUST-001",
    name: "Mohammed Al-Rashid",
    email: "mo.rashid@email.com",
    mobileCode: "+971",
    mobile: "50 123 4567",
    whatsappCode: "+971",
    whatsapp: "50 123 4567",
    dob: "1985-03-14",
    source: "Instagram",
    instagram: "@mo.rashid",
    facebook: "Mohammed Al-Rashid",
    status: "active",
    notes: "High value customer. Prefers AMG variants.",
    createdAt: "2024-01-15",
    purchases: [
      {
        car: "Mercedes AMG GT 63S",
        amount: 680000,
        invoice: "INV-0038",
        method: "Cash",
        date: "Mar 2024",
      },
      {
        car: "BMW M8 Competition",
        amount: 380000,
        invoice: "INV-0021",
        method: "Finance",
        date: "Jan 2024",
      },
    ],
    inquiries: [
      {
        type: "test_drive",
        car: "Rolls Royce Ghost",
        status: "Approved",
        note: "Assigned: Ahmed Sales",
        date: "May 2024",
      },
      {
        type: "inquiry",
        car: "Lamborghini Urus",
        status: "Responded",
        note: "Via WhatsApp · Pricing requested",
        date: "Apr 2024",
      },
      {
        type: "test_drive",
        car: "Ferrari 488 Pista",
        status: "Completed",
        note: "Customer purchased AMG GT instead",
        date: "Feb 2024",
      },
    ],
  },
  {
    id: 2,
    customerId: "CUST-002",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    mobileCode: "+971",
    mobile: "55 987 6543",
    whatsappCode: "+971",
    whatsapp: "55 987 6543",
    dob: "1990-07-22",
    source: "Facebook",
    instagram: "",
    facebook: "Sarah Johnson",
    status: "prospect",
    notes: "Interested in Rolls Royce. Follow up needed.",
    createdAt: "2024-03-10",
    purchases: [],
    inquiries: [
      {
        type: "inquiry",
        car: "Rolls Royce Ghost EWB",
        status: "Pending",
        note: "Via Facebook DM",
        date: "Mar 2024",
      },
    ],
  },
  {
    id: 3,
    customerId: "CUST-003",
    name: "Khalid Al-Mansoori",
    email: "k.mansoori@email.com",
    mobileCode: "+971",
    mobile: "52 456 7890",
    whatsappCode: "+971",
    whatsapp: "52 456 7890",
    dob: "1978-11-05",
    source: "Referral",
    instagram: "@khalid_m",
    facebook: "",
    status: "vip",
    notes: "VIP. Contact owner directly for deals.",
    createdAt: "2023-11-20",
    purchases: [
      {
        car: "Lamborghini Urus Performante",
        amount: 750000,
        invoice: "INV-0015",
        method: "Cash",
        date: "Dec 2023",
      },
    ],
    inquiries: [
      {
        type: "test_drive",
        car: "Rolls Royce Cullinan",
        status: "Completed",
        note: "VIP private showing",
        date: "Jan 2024",
      },
      {
        type: "inquiry",
        car: "Bentley Continental GT",
        status: "Responded",
        note: "Pricing sent via WhatsApp",
        date: "Feb 2024",
      },
    ],
  },
  {
    id: 4,
    customerId: "CUST-004",
    name: "Emma Williams",
    email: "emma.w@email.com",
    mobileCode: "+44",
    mobile: "79 8321 0987",
    whatsappCode: "+44",
    whatsapp: "79 8321 0987",
    dob: "1988-04-18",
    source: "Walk-in",
    instagram: "@emmaw_dubai",
    facebook: "Emma Williams",
    status: "active",
    notes: "Frequent buyer. Birthday in April — send offer.",
    createdAt: "2023-08-05",
    purchases: [
      {
        car: "Porsche 911 Turbo S",
        amount: 620000,
        invoice: "INV-0009",
        method: "Cash",
        date: "Sep 2023",
      },
      {
        car: "Ferrari 488 Pista",
        amount: 920000,
        invoice: "INV-0022",
        method: "Finance",
        date: "Jan 2024",
      },
      {
        car: "Rolls Royce Ghost EWB",
        amount: 1800000,
        invoice: "INV-0041",
        method: "Cash",
        date: "Apr 2024",
      },
    ],
    inquiries: [
      {
        type: "test_drive",
        car: "Bentley Bentayga",
        status: "Completed",
        note: "Decided on Rolls instead",
        date: "Mar 2024",
      },
    ],
  },
  {
    id: 5,
    customerId: "CUST-005",
    name: "Ravi Krishnamurthy",
    email: "ravi.k@email.com",
    mobileCode: "+91",
    mobile: "98765 43210",
    whatsappCode: "+91",
    whatsapp: "98765 43210",
    dob: "1992-09-30",
    source: "Instagram",
    instagram: "@ravi_k_official",
    facebook: "",
    status: "inactive",
    notes: "No response after initial inquiry.",
    createdAt: "2024-06-01",
    purchases: [],
    inquiries: [],
  },
  {
    id: 6,
    customerId: "CUST-006",
    name: "Ahmed Al-Farsi",
    email: "ahmed.f@email.com",
    mobileCode: "+971",
    mobile: "54 111 2233",
    whatsappCode: "+971",
    whatsapp: "54 111 2233",
    dob: "1975-01-20",
    source: "Website",
    instagram: "",
    facebook: "",
    status: "blacklisted",
    notes: "Payment dispute. Do not engage.",
    createdAt: "2024-02-10",
    purchases: [],
    inquiries: [
      {
        type: "test_drive",
        car: "Lamborghini Huracán",
        status: "Cancelled",
        note: "No show",
        date: "Feb 2024",
      },
    ],
  },
];

// Add to src/data/mockData.js

export const DEFAULT_CUSTOMER_COLUMNS = [
  { id: "customer", label: "Customer", visible: true, canHide: false },
  { id: "status", label: "Status", visible: true, canHide: true },
  { id: "mobile", label: "Mobile", visible: true, canHide: true },
  { id: "source", label: "Source", visible: true, canHide: true },
  { id: "purchases", label: "Purchases", visible: true, canHide: true },
  { id: "spent", label: "Total Spent", visible: true, canHide: true },
  { id: "dob", label: "Birthday", visible: true, canHide: true },
  { id: "instagram", label: "Instagram", visible: true, canHide: true },
];

// Add to src/data/mockData.js

// ── SALES EXECUTIVES ──────────────────────────────────────────────────────────
export const SALES_EXECUTIVES = [
  "Ahmed Al-Sayed",
  "Fatima Hassan",
  "Omar Khalid",
  "Sara Mohammed",
  "Bilal Yousuf",
];

// ── TIME SLOTS ────────────────────────────────────────────────────────────────
export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

// ── TEST DRIVE COLUMN CONFIG ──────────────────────────────────────────────────
export const DEFAULT_TESTDRIVE_COLUMNS = [
  { id: "bookingId", label: "Booking ID", visible: true, canHide: false },
  { id: "customer", label: "Customer", visible: true, canHide: false },
  { id: "car", label: "Car", visible: true, canHide: true },
  { id: "datetime", label: "Date & Time", visible: true, canHide: true },
  { id: "exec", label: "Sales Exec", visible: true, canHide: true },
  { id: "location", label: "Location", visible: false, canHide: true },
  { id: "duration", label: "Duration", visible: false, canHide: true },
  { id: "status", label: "Status", visible: true, canHide: true },
];

// ── Auto-generate booking ID ──────────────────────────────────────────────────
export const generateBookingId = (existing) => {
  const max = existing.reduce((acc, b) => {
    const num = parseInt(b.bookingId?.replace("TD-2026-", "") || "0");
    return Math.max(acc, num);
  }, 0);
  return `TD-2026-${String(max + 1).padStart(3, "0")}`;
};

// ── TEST DRIVE DATA ───────────────────────────────────────────────────────────
export const testDrives = [
  {
    id: 1,
    bookingId: "TD-2026-001",
    customerId: 1,
    customerName: "Mohammed Al-Rashid",
    customerMobile: "+971 50 123 4567",
    carId: 1,
    carName: "Mercedes AMG GT 63S",
    carPlate: "AXG-2024",
    date: "2026-06-10",
    time: "10:00 AM",
    duration: "45 minutes",
    location: "APEX GT Showroom, Sheikh Zayed Road, Dubai",
    exec: "Ahmed Al-Sayed",
    source: "Instagram",
    status: "pending",
    notes:
      "Customer interested in purchasing. Has driven AMG before. Prefers morning slot.",
    createdAt: "2026-06-05",
  },
  {
    id: 2,
    bookingId: "TD-2026-002",
    customerId: 2,
    customerName: "Sarah Johnson",
    customerMobile: "+971 55 987 6543",
    carId: 4,
    carName: "Rolls Royce Ghost EWB",
    carPlate: "RRG-2024",
    date: "2026-06-11",
    time: "02:00 PM",
    duration: "60 minutes",
    location: "APEX GT Showroom, Sheikh Zayed Road, Dubai",
    exec: "Fatima Hassan",
    source: "Facebook",
    status: "approved",
    notes:
      "First-time customer. Birthday in July — send offer after test drive.",
    createdAt: "2026-06-06",
  },
  {
    id: 3,
    bookingId: "TD-2026-003",
    customerId: 3,
    customerName: "Khalid Al-Mansoori",
    customerMobile: "+971 52 456 7890",
    carId: 5,
    carName: "Lamborghini Urus Performante",
    carPlate: "LMB-URS",
    date: "2026-06-08",
    time: "11:00 AM",
    duration: "30 minutes",
    location: "APEX GT Showroom, Sheikh Zayed Road, Dubai",
    exec: "Omar Khalid",
    source: "Referral",
    status: "completed",
    notes: "VIP customer. Private showing arranged.",
    createdAt: "2026-06-01",
  },
  {
    id: 4,
    bookingId: "TD-2026-004",
    customerId: 4,
    customerName: "Emma Williams",
    customerMobile: "+44 79 8321 0987",
    carId: 2,
    carName: "BMW M8 Competition",
    carPlate: "BMW-M8X",
    date: "2026-06-14",
    time: "09:00 AM",
    duration: "45 minutes",
    location: "APEX GT Showroom, Sheikh Zayed Road, Dubai",
    exec: "Sara Mohammed",
    source: "Walk-in",
    status: "pending",
    notes: "",
    createdAt: "2026-06-07",
  },
  {
    id: 5,
    bookingId: "TD-2026-005",
    customerId: 5,
    customerName: "Ravi Krishnamurthy",
    customerMobile: "+91 98765 43210",
    carId: 6,
    carName: "Porsche 911 Turbo S",
    carPlate: "PCH-911",
    date: "2026-06-05",
    time: "03:00 PM",
    duration: "30 minutes",
    location: "APEX GT Showroom, Sheikh Zayed Road, Dubai",
    exec: "Ahmed Al-Sayed",
    source: "Instagram",
    status: "rejected",
    notes: "Customer did not meet requirements.",
    createdAt: "2026-06-01",
  },
  {
    id: 6,
    bookingId: "TD-2026-006",
    customerId: 6,
    customerName: "Ahmed Al-Farsi",
    customerMobile: "+971 54 111 2233",
    carId: 3,
    carName: "Ferrari 488 Pista",
    carPlate: "FER-488",
    date: "2026-06-09",
    time: "04:00 PM",
    duration: "45 minutes",
    location: "APEX GT Showroom, Sheikh Zayed Road, Dubai",
    exec: "Fatima Hassan",
    source: "Website",
    status: "cancelled",
    notes: "Customer cancelled — no show.",
    createdAt: "2026-06-02",
  },
];

// Add to src/data/mockData.js

// ── INVOICE CONFIG ────────────────────────────────────────────────────────────
export const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Card", "Cheque"];

export const DEFAULT_INVOICE_COLUMNS = [
  { id: "invoiceId", label: "Invoice", visible: true, canHide: false },
  { id: "customer", label: "Customer", visible: true, canHide: false },
  { id: "amount", label: "Amount", visible: true, canHide: true },
  { id: "status", label: "Status", visible: true, canHide: true },
  { id: "method", label: "Payment", visible: true, canHide: true },
  { id: "dueDate", label: "Due Date", visible: true, canHide: true },
  { id: "issuedDate", label: "Issued", visible: false, canHide: true },
  { id: "car", label: "Car", visible: false, canHide: true },
];

export const generateInvoiceId = (existing) => {
  const max = existing.reduce((acc, inv) => {
    const num = parseInt(inv.invoiceId?.replace("INV-", "") || "0");
    return Math.max(acc, num);
  }, 0);
  return `INV-${String(max + 1).padStart(4, "0")}`;
};

// ── INVOICE DATA ──────────────────────────────────────────────────────────────
export const invoices = [
  {
    id: 1,
    invoiceId: "INV-0042",
    customerId: 1,
    customerName: "Mohammed Al-Rashid",
    customerEmail: "mo.rashid@email.com",
    carId: 1,
    carName: "Mercedes AMG GT 63S",
    carPlate: "AXG-2024",
    issuedDate: "2026-06-01",
    dueDate: "2026-06-20",
    status: "paid",
    method: "Cash",
    notes: "Full payment received. Thank you.",
    items: [
      {
        id: 1,
        desc: "Mercedes AMG GT 63S — 2024",
        type: "car",
        qty: 1,
        unitPrice: 680000,
      },
      {
        id: 2,
        desc: "Registration & Documentation",
        type: "service",
        qty: 1,
        unitPrice: 2500,
      },
      {
        id: 3,
        desc: "Delivery & Inspection",
        type: "service",
        qty: 1,
        unitPrice: 1500,
      },
    ],
    discount: 15000,
    vatRate: 5,
  },
  {
    id: 2,
    invoiceId: "INV-0041",
    customerId: 4,
    customerName: "Emma Williams",
    customerEmail: "emma.w@email.com",
    carId: 4,
    carName: "Rolls Royce Ghost EWB",
    carPlate: "RRG-2024",
    issuedDate: "2026-05-20",
    dueDate: "2026-06-10",
    status: "overdue",
    method: "Bank Transfer",
    notes: "Follow up required. Customer has not responded.",
    items: [
      {
        id: 1,
        desc: "Rolls Royce Ghost EWB — 2024",
        type: "car",
        qty: 1,
        unitPrice: 1800000,
      },
      {
        id: 2,
        desc: "VIP Delivery & Concierge",
        type: "service",
        qty: 1,
        unitPrice: 5000,
      },
    ],
    discount: 0,
    vatRate: 5,
  },
  {
    id: 3,
    invoiceId: "INV-0040",
    customerId: 3,
    customerName: "Khalid Al-Mansoori",
    customerEmail: "k.mansoori@email.com",
    carId: 5,
    carName: "Lamborghini Urus Performante",
    carPlate: "LMB-URS",
    issuedDate: "2026-05-15",
    dueDate: "2026-06-15",
    status: "partially_paid",
    method: "Cheque",
    notes: "First cheque AED 400,000 received. Balance pending.",
    items: [
      {
        id: 1,
        desc: "Lamborghini Urus Performante — 2024",
        type: "car",
        qty: 1,
        unitPrice: 750000,
      },
      {
        id: 2,
        desc: "Extended Warranty — 3 Years",
        type: "service",
        qty: 1,
        unitPrice: 12000,
      },
    ],
    discount: 20000,
    vatRate: 5,
  },
  {
    id: 4,
    invoiceId: "INV-0039",
    customerId: 2,
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    carId: 6,
    carName: "Porsche 911 Turbo S",
    carPlate: "PCH-911",
    issuedDate: "2026-06-05",
    dueDate: "2026-06-30",
    status: "sent",
    method: "Card",
    notes: "",
    items: [
      {
        id: 1,
        desc: "Porsche 911 Turbo S — 2024",
        type: "car",
        qty: 1,
        unitPrice: 620000,
      },
      {
        id: 2,
        desc: "Ceramic Coating Package",
        type: "service",
        qty: 1,
        unitPrice: 3500,
      },
      {
        id: 3,
        desc: "Floor Mats & Accessories",
        type: "custom",
        qty: 1,
        unitPrice: 800,
      },
    ],
    discount: 0,
    vatRate: 5,
  },
  {
    id: 5,
    invoiceId: "INV-0038",
    customerId: 1,
    customerName: "Mohammed Al-Rashid",
    customerEmail: "mo.rashid@email.com",
    carId: 2,
    carName: "BMW M8 Competition",
    carPlate: "BMW-M8X",
    issuedDate: "2026-04-10",
    dueDate: "2026-04-30",
    status: "paid",
    method: "Cash",
    notes: "",
    items: [
      {
        id: 1,
        desc: "BMW M8 Competition — 2024",
        type: "car",
        qty: 1,
        unitPrice: 380000,
      },
    ],
    discount: 0,
    vatRate: 5,
  },
  {
    id: 6,
    invoiceId: "INV-0037",
    customerId: 4,
    customerName: "Emma Williams",
    customerEmail: "emma.w@email.com",
    carId: 3,
    carName: "Ferrari 488 Pista",
    carPlate: "FER-488",
    issuedDate: "2026-03-01",
    dueDate: "2026-03-20",
    status: "refunded",
    method: "Bank Transfer",
    notes: "Customer returned vehicle. Full refund processed.",
    items: [
      {
        id: 1,
        desc: "Ferrari 488 Pista — 2023",
        type: "car",
        qty: 1,
        unitPrice: 920000,
      },
      {
        id: 2,
        desc: "Full Service Package",
        type: "service",
        qty: 1,
        unitPrice: 3500,
      },
    ],
    discount: 50000,
    vatRate: 5,
  },
];

// ── Invoice calculation helpers ───────────────────────────────────────────────
export const calcInvoice = (items = [], discount = 0, vatRate = 5) => {
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const afterDisc = subtotal - discount;
  const vat = Math.round(afterDisc * (vatRate / 100));
  const total = afterDisc + vat;
  return { subtotal, afterDisc, vat, total };
};
