// src/pages/Reports.jsx
//
// Page shell — global filter bar + tab bar + active tab content.
// Phase-1-style: reads from localStorage same pattern as every other module.
// Reuses analyticsUtils.js compute functions, adds reportUtils.js for new dimensions.

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileBarChart } from "lucide-react";
import ReportTabBar from "../components/reports/ReportTabBar";
import { exportReportTab, exportFullReport } from "../utils/reportExportUtils";
import ReportGlobalFilterBar from "../components/reports/ReportGlobalFilter";

import { REPORT_TABS } from "../components/reports/ReportTabBar";
import SalesReportTab from "../components/reports/SalesReportTab";
import InventoryReportTab from "../components/reports/InventoryReportTab";
import CustomerReportTab from "../components/reports/CustomerReportTab";
import TestDriveReportTab from "../components/reports/TestDriveReportTab";
import {
  filterInvoicesByRange,
  filterBookingsByRange,
  filterCustomersByRange,
} from "../utils/analyticsUtils";
import {
  filterByModel,
  filterByExec,
  filterByBrand,
} from "../utils/reportUtils";
import apexToast from "../utils/toast";

const EMPTY_FILTERS = {
  range: "This Year",
  from: "",
  to: "",
  brand: "",
  model: "",
  exec: "",
  status: [],
};

const getLiveArray = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showCustom, setShowCustom] = useState(false);

  // ── Live data — same localStorage bridge as every other module ────────────
  const [cars, setCars] = useState(() => getLiveArray("apex-gt-cars"));
  const [customers, setCustomers] = useState(() =>
    getLiveArray("apex-gt-customers"),
  );
  const [invoices, setInvoices] = useState(() =>
    getLiveArray("apex-gt-invoices"),
  );
  const [bookings, setBookings] = useState(() =>
    getLiveArray("apex-gt-bookings"),
  );

  useEffect(() => {
    const onCars = (e) => e.detail?.cars && setCars(e.detail.cars);
    const onCustomers = (e) =>
      e.detail?.customers && setCustomers(e.detail.customers);
    const onInvoices = (e) =>
      e.detail?.invoices && setInvoices(e.detail.invoices);
    const onBookings = (e) =>
      e.detail?.bookings && setBookings(e.detail.bookings);
    window.addEventListener("apex-gt-cars-updated", onCars);
    window.addEventListener("apex-gt-customers-updated", onCustomers);
    window.addEventListener("apex-gt-invoices-updated", onInvoices);
    window.addEventListener("apex-gt-bookings-updated", onBookings);
    return () => {
      window.removeEventListener("apex-gt-cars-updated", onCars);
      window.removeEventListener("apex-gt-customers-updated", onCustomers);
      window.removeEventListener("apex-gt-invoices-updated", onInvoices);
      window.removeEventListener("apex-gt-bookings-updated", onBookings);
    };
  }, []);

  // ── Apply global filters — range + brand + model + exec ───────────────────
  const rangeInvoices = useMemo(() => {
    let data = filterInvoicesByRange(
      invoices,
      filters.range,
      filters.from,
      filters.to,
    );
    data = filterByModel(data, filters.model);
    data = filterByBrand(data, filters.brand, cars);
    return data;
  }, [invoices, filters, cars]);

  const rangeBookings = useMemo(() => {
    let data = filterBookingsByRange(
      bookings,
      filters.range,
      filters.from,
      filters.to,
    );
    data = filterByModel(data, filters.model);
    data = filterByExec(data, filters.exec);
    data = filterByBrand(data, filters.brand, cars);
    return data;
  }, [bookings, filters, cars]);

  const rangeCustomers = useMemo(
    () =>
      filterCustomersByRange(
        customers,
        filters.range,
        filters.from,
        filters.to,
      ),
    [customers, filters],
  );

  const activeTabMeta = REPORT_TABS.find((t) => t.id === activeTab);

  const handleExportTab = (type) => {
    exportReportTab(activeTab, type, {
      invoices: rangeInvoices,
      cars,
      customers: rangeCustomers,
      bookings: rangeBookings,
    });
    apexToast.success(
      `${activeTabMeta.label} Exported`,
      `Exported as ${type}.`,
    );
  };
  const handleExportFull = (type) => {
    exportFullReport(type, {
      invoices: rangeInvoices,
      cars,
      customers: rangeCustomers,
      bookings: rangeBookings,
    });
    apexToast.success(
      "Full Report Exported",
      `All 4 report sections exported as ${type}.`,
    );
  };

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden pb-3">
      <ReportGlobalFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
        cars={cars}
        bookings={bookings}
        showCustom={showCustom}
        onToggleCustom={setShowCustom}
        activeTabLabel={activeTabMeta.label}
        onExportTab={handleExportTab}
        onExportFull={handleExportFull}
      />

      <ReportTabBar active={activeTab} onChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto scrollbar-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "sales" && (
              <SalesReportTab
                invoices={rangeInvoices}
                cars={cars}
                bookings={rangeBookings}
              />
            )}
            {activeTab === "inventory" && <InventoryReportTab cars={cars} />}
            {activeTab === "customer" && (
              <CustomerReportTab customers={rangeCustomers} />
            )}
            {activeTab === "testdrive" && (
              <TestDriveReportTab
                bookings={rangeBookings}
                invoices={rangeInvoices}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Reports;
