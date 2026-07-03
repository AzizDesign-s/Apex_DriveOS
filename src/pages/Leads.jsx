// src/pages/Leads.jsx
// Sprint 4 Phase 3 — Lead Management
//
// STATE OWNED HERE:
//   leads[]          — all lead records (localStorage: apex-driveos-leads)
//   users[]          — read-only, for exec dropdown (apex-driveos-users)
//   roles[]          — read-only, to filter Sales Executive users (apex-driveos-roles)
//
// CROSS-MODULE SYNC (every status change triggers the right side effects):
//
//   new_inquiry  → Customer record CREATED immediately (Option A)
//   interested   → Car status: available/maintenance → interested
//   reserved     → Car status: interested → reserved
//   won          → Car status: reserved → sold
//   lost         → Car status: reverts (interested→available, reserved→available)
//   any reversal → Car status reverts to previous logical state
//
// MULTI-LEAD WARNING:
//   When a lead moves to "reserved", ALL other leads for the same car
//   get a visual warning badge (handled in LeadCard via isCarReservedByOther)
//   — no automatic closing of other leads, exec decides.
//
// EVENT BRIDGE:
//   apex-driveos-leads-updated    → Sidebar badge count
//   apex-driveos-cars-updated     → Inventory page live sync
//   apex-driveos-customers-updated → Customers page live sync

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import {
  leads as initialLeads,
  generateLeadId,
  LEAD_COLUMNS,
} from "../data/mockLeads";
import {
  customers as initialCustomers,
  generateCustomerId,
  roles as seedRoles,
  users as seedUsers,
} from "../data/mockData";
import { activity } from "../utils/activityLogger";
import { notify } from "../utils/notificationUtils";
import { Button } from "../components/ui";
import LeadStats from "../components/leads/LeadStats";
import LeadKanban from "../components/leads/LeadKanban";
import LeadFormPage from "../components/leads/LeadFormPage";
import LeadDetailDrawer from "../components/leads/LeadDetailDrawer";
import apexToast from "../utils/toast";

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS = {
  leads: "apex-driveos-leads",
  cars: "apex-driveos-cars",
  customers: "apex-driveos-customers",
  users: "apex-driveos-users",
  roles: "apex-driveos-roles",
};

const loadLS = (key, fallback = []) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveLS = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* silent */
  }
};

// ── Dispatch cross-module event ───────────────────────────────────────────────
const dispatch = (event, detail) => {
  window.dispatchEvent(new CustomEvent(event, { detail }));
};

// ─────────────────────────────────────────────────────────────────────────────
function Leads() {
  // ── Leads state ───────────────────────────────────────────────────────────
  const [leads, setLeads] = useState(() => loadLS(LS.leads, initialLeads));

  // ── Read-only reference data ──────────────────────────────────────────────
  const [roles, setRoles] = useState(() => loadLS(LS.roles, seedRoles));

  useEffect(() => {
    const onRoles = (e) => {
      if (e.detail?.roles) setRoles(e.detail.roles);
    };
    window.addEventListener("apex-driveos-roles-updated", onRoles);
    return () =>
      window.removeEventListener("apex-driveos-roles-updated", onRoles);
  }, []);

  // ── Sales Executive options ───────────────────────────────────────────────
  // Filter users whose role is "Sales Executive"
  // Falls back to SALES_EXECUTIVES constant if no users exist yet
  const execOptions = useMemo(() => {
    const allUsers = loadLS(LS.users, seedUsers);
    const salesRole = roles.find((r) => r.name === "Sales Executive");
    if (!salesRole) {
      // Fallback to seed constant names
      return [
        "Ahmed Al-Sayed",
        "Fatima Hassan",
        "Omar Khalid",
        "Sara Mohammed",
        "Bilal Yousuf",
      ];
    }
    const salesUsers = allUsers.filter(
      (u) => u.roleId === salesRole.id && u.status === "active",
    );
    return salesUsers.length > 0
      ? salesUsers.map((u) => u.fullName)
      : [
          "Ahmed Al-Sayed",
          "Fatima Hassan",
          "Omar Khalid",
          "Sara Mohammed",
          "Bilal Yousuf",
        ];
  }, [roles]);

  // ── Persist leads + dispatch event on every change ────────────────────────
  useEffect(() => {
    saveLS(LS.leads, leads);
    dispatch("apex-driveos-leads-updated", { leads });
  }, [leads]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);

  // ── CROSS-MODULE: Create Customer from lead ───────────────────────────────
  // Called when a new lead is created (Option A — every lead = Customer)
  // Checks for duplicate by email or phone before creating.
  const ensureCustomerExists = useCallback((lead) => {
    try {
      const allCustomers = loadLS(LS.customers, initialCustomers);

      // Deduplicate by email or phone
      const exists = allCustomers.some(
        (c) =>
          (lead.email && c.email === lead.email) ||
          (lead.phone && c.mobile === lead.phone),
      );
      if (exists) return null; // already a customer, don't duplicate

      const newCustomer = {
        id: Date.now(),
        customerId: generateCustomerId(allCustomers),
        name: lead.name,
        email: lead.email || "",
        mobileCode: lead.mobileCode || "+971",
        mobile: lead.phone,
        whatsappCode: lead.mobileCode || "+971",
        whatsapp: lead.phone,
        dob: "",
        source: lead.source,
        instagram: "",
        facebook: "",
        status: "prospect",
        notes: `Created from Lead ${lead.leadId}. ${lead.notes || ""}`.trim(),
        createdAt: new Date().toISOString().split("T")[0],
        purchases: [],
        inquiries: [
          {
            type: "inquiry",
            car: lead.interestedCarName || "Unknown",
            status: "Pending",
            note: `Via ${lead.source}`,
            date: new Date().toLocaleDateString("en-AE", {
              month: "short",
              year: "numeric",
            }),
          },
        ],
      };

      const updatedCustomers = [newCustomer, ...allCustomers];
      saveLS(LS.customers, updatedCustomers);
      dispatch("apex-driveos-customers-updated", {
        customers: updatedCustomers,
      });

      return newCustomer;
    } catch (err) {
      console.error("Failed to create customer from lead:", err);
      return null;
    }
  }, []);

  // ── CROSS-MODULE: Update car status ──────────────────────────────────────
  // Called when a lead moves to interested / reserved / won / lost
  const syncCarStatus = useCallback((carId, newStatus) => {
    if (!carId) return;
    try {
      const allCars = loadLS(LS.cars, []);
      const updated = allCars.map((c) =>
        c.id === Number(carId) ? { ...c, status: newStatus } : c,
      );
      saveLS(LS.cars, updated);
      dispatch("apex-driveos-cars-updated", { cars: updated });
    } catch (err) {
      console.error("Failed to sync car status:", err);
    }
  }, []);

  // ── Core status change logic ──────────────────────────────────────────────
  // This is the heart of Phase 3 — every status change goes through here.
  // It handles:
  //   1. Lead status update in state
  //   2. Car status sync (based on destination status)
  //   3. Car status revert (if moving backwards or to lost)
  //   4. Activity log
  //   5. Notification (for high-value events)
  const handleStatusChange = useCallback(
    (lead, fromStatus, toStatus) => {
      if (fromStatus === toStatus) return;

      // ── Car status sync map ───────────────────────────────────────────
      // What car status should be set when lead moves to each stage?
      const CAR_STATUS_FOR_LEAD = {
        new_inquiry: null, // no car status change
        contacted: null, // no car status change
        interested: "interested", // car becomes "interested"
        reserved: "reserved", // car becomes "reserved"
        won: "sold", // car becomes "sold"
        lost: "available", // car reverts to available
      };

      // ── Revert car status if moving backwards ─────────────────────────
      // e.g. reserved → contacted means car should go back to available
      const REVERT_ON_BACKWARD = {
        interested: "available", // de-interested a car = available again
        reserved: "interested", // un-reserve = interested again
        won: "reserved", // can't un-win easily but guard anyway
      };

      const colOrder = LEAD_COLUMNS.map((c) => c.id);
      const fromIdx = colOrder.indexOf(fromStatus);
      const toIdx = colOrder.indexOf(toStatus);
      const isForward = toIdx > fromIdx;
      const isLost = toStatus === "lost";

      // Determine what car status to set
      let newCarStatus = null;
      if (isLost) {
        // Lost: revert car to whatever it was before this lead touched it
        // Simple approach: if it was reserved for this lead, free it
        newCarStatus = REVERT_ON_BACKWARD[fromStatus] || "available";
      } else if (isForward) {
        newCarStatus = CAR_STATUS_FOR_LEAD[toStatus];
      } else {
        // Moving backwards (e.g. reserved → contacted)
        newCarStatus = REVERT_ON_BACKWARD[fromStatus] || null;
      }

      // Sync car
      if (newCarStatus && lead.interestedCarId) {
        syncCarStatus(lead.interestedCarId, newCarStatus);
      }

      // Update lead
      const now = new Date().toISOString();
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? {
                ...l,
                status: toStatus,
                updatedAt: now,
                convertedAt:
                  toStatus === "won" && !l.convertedAt ? now : l.convertedAt,
              }
            : l,
        ),
      );

      // Close detail drawer if open for this lead
      setViewLead((prev) =>
        prev?.id === lead.id ? { ...prev, status: toStatus } : prev,
      );

      // Activity log
      activity.leadStatusChanged(lead, fromStatus, toStatus);

      // Notifications for high-value transitions
      if (toStatus === "reserved") {
        notify.alertTriggered({
          type: "inventory",
          priority: "high",
          title: "Vehicle Reserved via Lead",
          message: `${lead.name} has reserved ${lead.interestedCarName}. Lead ${lead.leadId} moved to Reserved stage.`,
          link: "/leads",
          linkLabel: "View Leads",
          meta: { leadId: lead.leadId, carId: lead.interestedCarId },
        });
      }

      if (toStatus === "won") {
        notify.alertTriggered({
          type: "invoice",
          priority: "high",
          title: "Lead Won — Deal Closed",
          message: `${lead.name} (${lead.leadId}) has been marked as Won. ${lead.interestedCarName} is now sold. Generate an invoice.`,
          link: "/invoices",
          linkLabel: "Create Invoice",
          meta: { leadId: lead.leadId, carId: lead.interestedCarId },
        });
      }

      apexToast.success(
        "Stage Updated",
        `${lead.name} moved to ${LEAD_COLUMNS.find((c) => c.id === toStatus)?.label || toStatus}.`,
      );
    },
    [syncCarStatus],
  );

  // ── Drag and drop handler (from LeadKanban) ───────────────────────────────
  // Called when user drops a card in a different column.
  // Delegates to handleStatusChange for all business logic.
  const handleLeadMove = useCallback(
    (lead, fromStatus, toStatus) => {
      handleStatusChange(lead, fromStatus, toStatus);
    },
    [handleStatusChange],
  );

  // ── Mark lost shortcut ────────────────────────────────────────────────────
  const handleMarkLost = useCallback(
    (lead) => {
      handleStatusChange(lead, lead.status, "lost");
    },
    [handleStatusChange],
  );

  // ── Save lead (create or update) ──────────────────────────────────────────
  const handleSave = useCallback(
    (data) => {
      setLeads((prev) => {
        const exists = prev.find((l) => l.id === data.id);

        if (exists) {
          // ── Edit existing lead ──────────────────────────────────────
          // If car changed, revert old car status and set new car status
          if (
            exists.interestedCarId !== data.interestedCarId &&
            exists.interestedCarId
          ) {
            // Revert old car to available
            syncCarStatus(exists.interestedCarId, "available");
          }
          // Apply new car status based on current lead stage
          const CAR_STATUS_FOR_LEAD = {
            interested: "interested",
            reserved: "reserved",
            won: "sold",
          };
          const newCarStatus = CAR_STATUS_FOR_LEAD[data.status];
          if (newCarStatus && data.interestedCarId) {
            syncCarStatus(data.interestedCarId, newCarStatus);
          }

          activity.leadStatusChanged(exists, exists.status, data.status);

          apexToast.success(
            "Lead Updated",
            `${data.name}'s lead has been updated.`,
          );

          return prev.map((l) => (l.id === data.id ? { ...data } : l));
        }

        // ── Create new lead ─────────────────────────────────────────
        const newLead = {
          ...data,
          id: Date.now(),
          leadId: generateLeadId(prev),
          status: "new_inquiry",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Option A: create Customer record immediately
        const newCustomer = ensureCustomerExists(newLead);
        if (newCustomer) {
          // Link customer id to lead
          newLead.customerId = newCustomer.id;
          activity.customerAdded(newCustomer);
          apexToast.info(
            "Customer Created",
            `${newLead.name} added to Customers as Prospect.`,
          );
        }

        // Activity log
        activity.leadCreated(newLead);

        apexToast.success(
          "Lead Created",
          `${newLead.name} added to New Inquiries.`,
        );

        return [newLead, ...prev];
      });

      setFormOpen(false);
      setEditLead(null);
    },
    [syncCarStatus, ensureCustomerExists],
  );

  // ── Open detail drawer ────────────────────────────────────────────────────
  const handleView = useCallback((lead) => {
    setViewLead(lead);
  }, []);

  // ── Open add form ─────────────────────────────────────────────────────────
  const handleAddLead = useCallback(() => {
    setEditLead(null);
    setFormOpen(true);
  }, []);

  // ── Open edit form ────────────────────────────────────────────────────────
  const handleEdit = useCallback((lead) => {
    setEditLead(lead);
    setFormOpen(true);
  }, []);

  // ── Refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setLeads(loadLS(LS.leads, initialLeads));
    apexToast.success("Refreshed", "Lead board updated.");
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── Page header ── */}
      <motion.div
        className="flex items-start justify-between flex-shrink-0"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-text-primary">
              Lead Management
            </h1>
            <span
              className="text-[10px] font-bold bg-gold/15 text-gold
                             px-2.5 py-1 rounded-full border border-gold/25"
            >
              {leads.length} leads
            </span>
          </div>
          <p className="text-[12px] text-text-subtle mt-0.5 tracking-wide">
            Sales pipeline · Drag cards between stages to update status
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleAddLead}
          >
            <span className="hidden sm:inline">Add Lead</span>
          </Button>
        </div>
      </motion.div>

      {/* ── Stats strip ── */}
      <LeadStats leads={leads} />

      {/* ── Kanban board — takes all remaining height ── */}
      <div className="flex-1 min-h-0 relative">
        <LeadKanban
          leads={leads}
          onLeadMove={handleLeadMove}
          onView={handleView}
          onAddLead={handleAddLead}
        />
      </div>

      {/* ── Lead detail drawer ── */}
      <LeadDetailDrawer
        lead={viewLead}
        isOpen={!!viewLead}
        onClose={() => setViewLead(null)}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        onMarkLost={handleMarkLost}
      />

      {/* ── Lead form page ── */}
      <LeadFormPage
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditLead(null);
        }}
        onSave={handleSave}
        editLead={editLead}
        allLeads={leads}
        execOptions={execOptions}
      />
    </div>
  );
}

export default Leads;
