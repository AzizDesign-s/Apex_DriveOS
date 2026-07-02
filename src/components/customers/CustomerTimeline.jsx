// src/components/customers/CustomerTimeline.jsx
// Phase 7 — Unified customer journey timeline.
// Auto-pulls and merges events from Leads, Test Drives, Invoices,
// and Service modules — all live from localStorage, sorted chronologically.
//
// EVENT TYPES SHOWN:
//   Lead Created          (from apex-gt-leads)
//   Lead Stage Changed     (from apex-gt-leads — status history not stored,
//                          so we show current stage as a single event)
//   Test Drive Booked      (from apex-gt-bookings)
//   Test Drive Completed   (from apex-gt-bookings, status=completed)
//   Invoice Created         (from apex-gt-invoices)
//   Invoice Paid             (from apex-gt-invoices, status=paid)
//   Vehicle Purchased         (from apex-gt-invoices, status=paid, derived)
//   Service Record              (from apex-gt-service, matched via owned vehicles)
//
// This component is read-only — it visualizes existing data,
// it does not create or modify records.

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Phone,
  CalendarCheck,
  FileText,
  CheckCircle2,
  Car,
  Wrench,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";

// ── localStorage loaders ──────────────────────────────────────────────────────
const loadLS = (key, fallback = []) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

// ── Event type config ─────────────────────────────────────────────────────────
const EVENT_CONFIG = {
  lead_created: {
    icon: Globe,
    color: "#FBBF24",
    label: "Lead Created",
  },
  lead_stage: {
    icon: TrendingUp,
    color: "#A78BFA",
    label: "Lead Stage",
  },
  test_drive_booked: {
    icon: CalendarCheck,
    color: "#38BDF8",
    label: "Test Drive Booked",
  },
  test_drive_completed: {
    icon: CheckCircle2,
    color: "#10B981",
    label: "Test Drive Completed",
  },
  invoice_created: {
    icon: FileText,
    color: "#D4AF37",
    label: "Quotation / Invoice",
  },
  invoice_paid: {
    icon: Car,
    color: "#10B981",
    label: "Vehicle Purchased",
  },
  service: {
    icon: Wrench,
    color: "#34D399",
    label: "Service Record",
  },
  repeat_purchase: {
    icon: RotateCcw,
    color: "#D4AF37",
    label: "Repeat Purchase",
  },
};

function CustomerTimeline({ customer }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!customer) return;

    const build = () => {
      const leads = loadLS("apex-gt-leads", []);
      const bookings = loadLS("apex-gt-bookings", []);
      const invoices = loadLS("apex-gt-invoices", []);
      const serviceOrders = loadLS("apex-gt-service", []);

      const items = [];

      // ── Leads linked to this customer ───────────────────────────────────
      leads
        .filter((l) => l.customerId === customer.id)
        .forEach((l) => {
          items.push({
            id: `lead-${l.id}`,
            type: "lead_created",
            title: `Lead created via ${l.source}`,
            sub: l.interestedCarName
              ? `Interested in ${l.interestedCarName}`
              : "Initial inquiry",
            date: l.createdAt,
          });
          // Show current stage if it has progressed past new_inquiry
          if (l.status !== "new_inquiry") {
            items.push({
              id: `lead-stage-${l.id}`,
              type: "lead_stage",
              title: `Lead stage: ${l.status.replace("_", " ")}`,
              sub: l.assignedExec
                ? `Handled by ${l.assignedExec}`
                : "Pipeline progress",
              date: l.updatedAt || l.createdAt,
            });
          }
        });

      // ── Test drives linked to this customer ─────────────────────────────
      bookings
        .filter((b) => b.customerId === customer.id)
        .forEach((b) => {
          items.push({
            id: `booking-${b.id}`,
            type: "test_drive_booked",
            title: `Test drive booked — ${b.carName}`,
            sub: `${b.date} at ${b.time}${b.exec ? ` · ${b.exec}` : ""}`,
            date: b.createdAt || b.date,
          });
          if (b.status === "completed") {
            items.push({
              id: `booking-done-${b.id}`,
              type: "test_drive_completed",
              title: `Test drive completed — ${b.carName}`,
              sub: b.exec ? `Sales exec: ${b.exec}` : "Completed",
              date: b.date,
            });
          }
        });

      // ── Invoices linked to this customer ────────────────────────────────
      const customerInvoices = invoices.filter(
        (i) => i.customerId === customer.id,
      );
      customerInvoices.forEach((inv, idx) => {
        items.push({
          id: `invoice-${inv.id}`,
          type: "invoice_created",
          title: `Invoice ${inv.invoiceId} created`,
          sub: `${inv.carName || "Service"} · ${inv.status}`,
          date: inv.issuedDate,
        });
        if (inv.status === "paid") {
          // Is this a repeat purchase? (not the customer's first paid invoice)
          const isRepeat =
            customerInvoices
              .filter((x) => x.status === "paid")
              .findIndex((x) => x.id === inv.id) > 0;

          items.push({
            id: `invoice-paid-${inv.id}`,
            type: isRepeat ? "repeat_purchase" : "invoice_paid",
            title: isRepeat
              ? `Repeat purchase — ${inv.carName}`
              : `Vehicle purchased — ${inv.carName}`,
            sub: `Invoice ${inv.invoiceId} · ${inv.method}`,
            date: inv.issuedDate,
          });
        }
      });

      // ── Service records for vehicles this customer owns ─────────────────
      // A customer "owns" a vehicle if they have a paid invoice for it
      const ownedCarIds = customerInvoices
        .filter((i) => i.status === "paid" && i.carId)
        .map((i) => Number(i.carId));

      serviceOrders
        .filter((o) => ownedCarIds.includes(Number(o.vehicleId)))
        .forEach((o) => {
          items.push({
            id: `service-${o.id}`,
            type: "service",
            title: `${o.type} — ${o.vehicleName}`,
            sub:
              o.status === "completed"
                ? `Completed${o.actualCost ? ` · AED ${Number(o.actualCost).toLocaleString()}` : ""}`
                : `Status: ${o.status.replace("_", " ")}`,
            date: o.startDate || o.createdAt,
          });
        });

      // ── Sort chronologically, oldest first (journey order) ───────────────
      items.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setEvents(items);
    };

    build();

    // Live updates — rebuild timeline when any source module changes
    const sources = [
      "apex-gt-leads-updated",
      "apex-gt-bookings-updated",
      "apex-gt-invoices-updated",
      "apex-gt-service-updated",
    ];
    sources.forEach((evt) => window.addEventListener(evt, build));
    return () =>
      sources.forEach((evt) => window.removeEventListener(evt, build));
  }, [customer]);

  if (!customer) return null;

  if (events.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div
          className="w-12 h-12 rounded-2xl bg-base border border-border
                        flex items-center justify-center mb-3"
        >
          <TrendingUp size={20} className="text-text-subtle/30" />
        </div>
        <p className="text-xs font-bold text-text-primary mb-1">
          No journey events yet
        </p>
        <p className="text-[10px] text-text-subtle max-w-[220px] leading-relaxed">
          This customer's journey will appear here as they interact with leads,
          test drives, invoices, and service.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.lead_created;
        const Icon = cfg.icon;
        const isLast = i === events.length - 1;

        return (
          <motion.div
            key={event.id}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            {/* Icon + connecting line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${cfg.color}18`, color: cfg.color }}
              >
                <Icon size={13} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-border/50 min-h-[14px] my-1" />
              )}
            </div>

            {/* Content */}
            <div className={clsx("flex-1 min-w-0", !isLast && "pb-4")}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className="text-[8px] font-bold uppercase tracking-wide"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  <p className="text-xs font-semibold text-text-primary leading-tight mt-0.5">
                    {event.title}
                  </p>
                  <p className="text-[10px] text-text-subtle mt-0.5 leading-relaxed">
                    {event.sub}
                  </p>
                </div>
                <span className="text-[9px] text-text-subtle flex-shrink-0 mt-0.5">
                  {event.date
                    ? new Date(event.date).toLocaleDateString("en-AE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default CustomerTimeline;
