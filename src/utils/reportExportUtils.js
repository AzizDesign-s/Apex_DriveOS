// src/utils/reportExportUtils.js
//
// Defines export columns + flattened row data for each Report tab.
// Reuses calcInvoice + the same exportToExcel/exportToPDF utils used
// by Inventory/Customers/Invoices — no new export mechanism, just new
// column/row mappings specific to Reports.

import { calcInvoice } from "../data/mockData";
import {
  computeRevenueByModel,
  computeSalesByExec,
  computeStockStatusOverview,
  computeCustomerDistribution,
  computeMostRequestedVehicles,
} from "./reportUtils";
import {
  computeMonthlyRevenue,
  computeSalesByBrand,
  computeCustomerGrowth,
  computeTestDriveConversion,
} from "./analyticsUtils";
import { exportToExcel, exportToPDF } from "./exportUtils";

// ── Sales Report ─────────────────────────────────────────────────────────────
export const buildSalesReportExport = (invoices, cars, bookings) => {
  const cols = [
    { id: "invoiceId", label: "Invoice ID" },
    { id: "customer", label: "Customer" },
    { id: "car", label: "Vehicle" },
    { id: "brand", label: "Brand" },
    { id: "status", label: "Status" },
    { id: "method", label: "Payment" },
    { id: "issued", label: "Issued Date" },
    { id: "total", label: "Total (AED)" },
  ];

  const rows = invoices.map((inv) => {
    const car = cars.find((c) => c.id === Number(inv.carId));
    const { total } = calcInvoice(
      inv.items || [],
      inv.discount || 0,
      inv.vatRate || 5,
    );
    return {
      invoiceId: inv.invoiceId,
      customer: inv.customerName,
      car: inv.carName,
      brand: car?.brand || "",
      status: inv.status,
      method: inv.method,
      issued: inv.issuedDate,
      total,
    };
  });

  return { cols, rows };
};

// ── Inventory Report ─────────────────────────────────────────────────────────
export const buildInventoryReportExport = (cars) => {
  const cols = [
    { id: "brand", label: "Brand" },
    { id: "model", label: "Model" },
    { id: "plate", label: "Plate" },
    { id: "status", label: "Status" },
    { id: "price", label: "Price (AED)" },
    { id: "daysInStock", label: "Days In Stock" },
  ];

  const now = new Date();
  const rows = cars.map((c) => {
    const created = c.createdAt ? new Date(c.createdAt) : now;
    const daysInStock =
      c.status === "available" ? Math.floor((now - created) / 86400000) : "—";
    return {
      brand: c.brand,
      model: c.model,
      plate: c.plate,
      status: c.status,
      price: c.price,
      daysInStock,
    };
  });

  return { cols, rows };
};

// ── Customer Report ─────────────────────────────────────────────────────────
export const buildCustomerReportExport = (customers) => {
  const cols = [
    { id: "customerId", label: "Customer ID" },
    { id: "name", label: "Name" },
    { id: "status", label: "Status" },
    { id: "source", label: "Source" },
    { id: "purchases", label: "Purchases" },
    { id: "spent", label: "Total Spent" },
    { id: "createdAt", label: "Joined" },
  ];

  const rows = customers.map((c) => ({
    customerId: c.customerId,
    name: c.name,
    status: c.status,
    source: c.source,
    purchases: c.purchases?.length || 0,
    spent: c.purchases?.reduce((s, p) => s + p.amount, 0) || 0,
    createdAt: c.createdAt,
  }));

  return { cols, rows };
};

// ── Test Drive Report ─────────────────────────────────────────────────────────
export const buildTestDriveReportExport = (bookings) => {
  const cols = [
    { id: "bookingId", label: "Booking ID" },
    { id: "customer", label: "Customer" },
    { id: "car", label: "Vehicle" },
    { id: "exec", label: "Sales Exec" },
    { id: "date", label: "Date" },
    { id: "status", label: "Status" },
  ];

  const rows = bookings.map((b) => ({
    bookingId: b.bookingId,
    customer: b.customerName,
    car: b.carName,
    exec: b.exec || "—",
    date: b.date,
    status: b.status,
  }));

  return { cols, rows };
};

// ── Full combined report (all 4 sections in one export) ──────────────────────
// For Excel: returns sections to be written as separate sheets.
// For PDF: returns sections to be written as separate pages.
export const buildFullReportExport = (invoices, cars, customers, bookings) => {
  const sales = buildSalesReportExport(invoices, cars, bookings);
  const inventory = buildInventoryReportExport(cars);
  const customer = buildCustomerReportExport(customers);
  const testDrive = buildTestDriveReportExport(bookings);

  return [
    { title: "Sales Report", ...sales },
    { title: "Inventory Report", ...inventory },
    { title: "Customer Report", ...customer },
    { title: "Test Drive Report", ...testDrive },
  ];
};

// ── Single-tab export — calls existing exportUtils functions directly ─────────
export const exportReportTab = (
  tabId,
  type,
  { invoices, cars, customers, bookings },
) => {
  let cols, rows, title, filename;

  switch (tabId) {
    case "sales": {
      ({ cols, rows } = buildSalesReportExport(invoices, cars, bookings));
      title = "Sales Report";
      filename = "apex-driveos-sales-report";
      break;
    }
    case "inventory": {
      ({ cols, rows } = buildInventoryReportExport(cars));
      title = "Inventory Report";
      filename = "apex-driveos-inventory-report";
      break;
    }
    case "customer": {
      ({ cols, rows } = buildCustomerReportExport(customers));
      title = "Customer Report";
      filename = "apex-driveos-customer-report";
      break;
    }
    case "testdrive": {
      ({ cols, rows } = buildTestDriveReportExport(bookings));
      title = "Test Drive Report";
      filename = "apex-driveos-testdrive-report";
      break;
    }
    default:
      return;
  }

  if (type === "Excel") exportToExcel(rows, cols, filename);
  else exportToPDF(rows, cols, title, filename);
};

// ── Full report export — one file per section, all triggered together ─────────
export const exportFullReport = (
  type,
  { invoices, cars, customers, bookings },
) => {
  const sections = buildFullReportExport(invoices, cars, customers, bookings);

  sections.forEach(({ title, cols, rows }) => {
    const filename = `apex-driveos-${title.toLowerCase().replace(/\s+/g, "-")}`;
    if (type === "Excel") exportToExcel(rows, cols, filename);
    else exportToPDF(rows, cols, title, filename);
  });
};
