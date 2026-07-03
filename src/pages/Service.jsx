// src/pages/Service.jsx
// Sprint 4 Phase 4 — Service & Maintenance module
//
// STATE OWNED HERE:
//   orders[]    — all work orders (localStorage: apex-driveos-service)
//   roles[]     — read-only, to find Technician role ID
//
// CROSS-MODULE SYNC:
//   Create order  → vehicle status: current → maintenance
//   Complete order → vehicle status: maintenance → available
//   Cancel order   → vehicle status: maintenance → available
//   Delete order   → vehicle status: maintenance → available (if was in_progress/pending)
//
// TECHNICIAN OPTIONS:
//   Read from apex-driveos-users filtered by Technician role
//   Falls back to empty array (exec adds technicians via Users module)

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import {
  serviceOrders as initialOrders,
  generateWorkOrderId,
} from "../data/mockServiceOrders";
import { roles as seedRoles } from "../data/mockData";
import { activity } from "../utils/activityLogger";
import { notify } from "../utils/notificationUtils";
import { DeleteConfirm } from "../components/ui";
import { Button } from "../components/ui";
import ServiceStats from "../components/service/ServiceStats";
import ServiceTable from "../components/service/ServiceTable";
import ServiceFormPage from "../components/service/ServiceFormPage";
import ServiceDetailDrawer from "../components/service/ServiceDetailDrawer";
import apexToast from "../utils/toast";

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS = {
  orders: "apex-driveos-service",
  cars: "apex-driveos-cars",
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

const dispatch = (event, detail) => {
  window.dispatchEvent(new CustomEvent(event, { detail }));
};

// ── Filter config ─────────────────────────────────────────────────────────────
const EMPTY_FILTERS = { status: "", type: "" };
const PER_PAGE = 10;

// ─────────────────────────────────────────────────────────────────────────────
function Service() {
  // ── Orders state ──────────────────────────────────────────────────────────
  const [orders, setOrders] = useState(() => loadLS(LS.orders, initialOrders));

  // ── Roles — to find Technician role ID ───────────────────────────────────
  const [roles, setRoles] = useState(() => loadLS(LS.roles, seedRoles));

  useEffect(() => {
    const onRoles = (e) => {
      if (e.detail?.roles) setRoles(e.detail.roles);
    };
    window.addEventListener("apex-driveos-roles-updated", onRoles);
    return () =>
      window.removeEventListener("apex-driveos-roles-updated", onRoles);
  }, []);

  // ── Technician options — users with Technician role ───────────────────────
  const technicianOptions = useMemo(() => {
    const techRole = roles.find((r) => r.name === "Technician");
    if (!techRole) return [];
    const allUsers = loadLS(LS.users, []);
    return allUsers
      .filter((u) => u.roleId === techRole.id && u.status === "active")
      .map((u) => u.fullName);
  }, [roles]);

  // ── Persist + dispatch on every orders change ─────────────────────────────
  useEffect(() => {
    saveLS(LS.orders, orders);
    dispatch("apex-driveos-service-updated", { orders });
  }, [orders]);

  // ── Search + filters ──────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);

  // ── CROSS-MODULE: Sync vehicle status ─────────────────────────────────────
  const syncCarStatus = useCallback((vehicleId, newStatus) => {
    if (!vehicleId) return;
    try {
      const allCars = loadLS(LS.cars, []);
      const updated = allCars.map((c) =>
        c.id === Number(vehicleId) ? { ...c, status: newStatus } : c,
      );
      saveLS(LS.cars, updated);
      dispatch("apex-driveos-cars-updated", { cars: updated });
    } catch (err) {
      console.error("Failed to sync car status:", err);
    }
  }, []);

  // ── Status quick-change (from drawer actions) ─────────────────────────────
  const handleStatusChange = useCallback(
    (order, newStatus) => {
      const now = new Date().toISOString().split("T")[0];

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: newStatus,
                completedDate:
                  newStatus === "completed"
                    ? o.completedDate || now
                    : o.completedDate,
                updatedAt: new Date().toISOString(),
              }
            : o,
        ),
      );

      // Keep drawer in sync if it's open
      setViewOrder((prev) =>
        prev?.id === order.id ? { ...prev, status: newStatus } : prev,
      );

      // Cross-module: car status sync
      if (newStatus === "completed" || newStatus === "cancelled") {
        // Work done — release the vehicle back to available
        syncCarStatus(order.vehicleId, "available");
        activity.serviceCompleted({ ...order, status: newStatus });

        if (newStatus === "completed") {
          notify.alertTriggered({
            type: "inventory",
            priority: "medium",
            title: "Service Completed",
            message: `Work order ${order.workOrderId} for ${order.vehicleName} has been completed. Vehicle is now available.`,
            link: "/service",
            linkLabel: "View Service",
            meta: {
              workOrderId: order.workOrderId,
              vehicleId: order.vehicleId,
            },
          });
        }
      }

      const STATUS_LABEL = {
        in_progress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled",
      };

      apexToast.success(
        "Status Updated",
        `${order.workOrderId} marked as ${STATUS_LABEL[newStatus] || newStatus}.`,
      );
    },
    [syncCarStatus],
  );

  // ── Save work order (create or update) ───────────────────────────────────
  const handleSave = useCallback(
    (data) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === data.id);

        if (exists) {
          // ── Edit ────────────────────────────────────────────────────
          // If vehicle changed, revert old vehicle and set new to maintenance
          if (
            exists.vehicleId !== data.vehicleId &&
            exists.vehicleId &&
            (exists.status === "pending" || exists.status === "in_progress")
          ) {
            syncCarStatus(exists.vehicleId, "available");
          }
          if (
            data.vehicleId &&
            (data.status === "pending" || data.status === "in_progress")
          ) {
            syncCarStatus(data.vehicleId, "maintenance");
          }

          // If status changed to completed/cancelled, free the car
          if (
            (data.status === "completed" || data.status === "cancelled") &&
            exists.status !== data.status
          ) {
            syncCarStatus(data.vehicleId, "available");
          }

          apexToast.success(
            "Work Order Updated",
            `${data.workOrderId} has been updated.`,
          );

          return prev.map((o) => (o.id === data.id ? { ...data } : o));
        }

        // ── Create ───────────────────────────────────────────────────
        const newOrder = {
          ...data,
          id: Date.now(),
          workOrderId: generateWorkOrderId(prev),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Set vehicle to maintenance when work order is created
        if (
          newOrder.vehicleId &&
          (newOrder.status === "pending" || newOrder.status === "in_progress")
        ) {
          syncCarStatus(newOrder.vehicleId, "maintenance");
        }

        // Activity log
        activity.serviceCreated(newOrder);

        // Notification for new pending work orders
        notify.alertTriggered({
          type: "inventory",
          priority: "medium",
          title: "New Work Order Created",
          message: `Work order ${newOrder.workOrderId} created for ${newOrder.vehicleName}. Type: ${newOrder.type}.`,
          link: "/service",
          linkLabel: "View Service",
          meta: {
            workOrderId: newOrder.workOrderId,
            vehicleId: newOrder.vehicleId,
          },
        });

        apexToast.success(
          "Work Order Created",
          `${newOrder.workOrderId} created for ${newOrder.vehicleName}.`,
        );

        return [newOrder, ...prev];
      });

      setFormOpen(false);
      setEditOrder(null);
    },
    [syncCarStatus],
  );

  // ── Delete work order ─────────────────────────────────────────────────────
  const handleDelete = useCallback(
    (order) => {
      // If active, release the vehicle
      if (order.status === "pending" || order.status === "in_progress") {
        syncCarStatus(order.vehicleId, "available");
      }
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setDeleteOrder(null);
      setViewOrder(null);
      apexToast.info(
        "Work Order Deleted",
        `${order.workOrderId} has been removed.`,
      );
    },
    [syncCarStatus],
  );

  // ── Refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setOrders(loadLS(LS.orders, initialOrders));
    setSearch("");
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
    apexToast.success("Refreshed", "Service orders updated.");
  }, []);

  // ── Sort handler ──────────────────────────────────────────────────────────
  const handleSort = useCallback((field) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return field;
    });
    setPage(1);
  }, []);

  // ── Filtered + sorted data ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...orders];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((o) =>
        `${o.workOrderId} ${o.vehicleName} ${o.vehiclePlate}
         ${o.type} ${o.technicianName}`
          .toLowerCase()
          .includes(q),
      );
    }

    if (activeFilters.status) {
      data = data.filter((o) => o.status === activeFilters.status);
    }

    if (activeFilters.type) {
      data = data.filter((o) => o.type === activeFilters.type);
    }

    data.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [orders, search, activeFilters, sortField, sortDir]);

  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-full pb-3">
      {/* ── Page header ── */}
      <motion.div
        className="flex items-start justify-between flex-shrink-0"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-text-primary">
              Service & Maintenance
            </h1>
            <span
              className="text-[10px] font-bold bg-gold/15 text-gold
                         px-2.5 py-1 rounded-full border border-gold/25"
            >
              {
                orders.filter(
                  (o) => o.status === "pending" || o.status === "in_progress",
                ).length
              }{" "}
              active
            </span>
          </div>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            Work orders · Vehicle maintenance · Service history
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
            onClick={() => {
              setEditOrder(null);
              setFormOpen(true);
            }}
          >
            <span className="hidden sm:inline">New Work Order</span>
          </Button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <ServiceStats orders={orders} />

      {/* ── Toolbar: search + filters ── */}
      <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search work orders..."
            className="input-luxury w-full text-xs py-2.5 pl-9"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Status filter */}
        <select
          value={activeFilters.status}
          onChange={(e) => {
            setActiveFilters((f) => ({ ...f, status: e.target.value }));
            setPage(1);
          }}
          className="input-luxury text-xs py-2.5 w-36 flex-shrink-0"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Type filter */}
        <select
          value={activeFilters.type}
          onChange={(e) => {
            setActiveFilters((f) => ({ ...f, type: e.target.value }));
            setPage(1);
          }}
          className="input-luxury text-xs py-2.5 w-44 flex-shrink-0"
        >
          <option value="">All Types</option>
          {[
            "Routine Maintenance",
            "Repair",
            "Inspection",
            "Detailing",
            "Tyre Change",
            "Oil Change",
            "Custom",
          ].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {(search || activeFilters.status || activeFilters.type) && (
          <button
            onClick={handleRefresh}
            className="text-[11px] font-semibold text-text-subtle
                       hover:text-gold transition-colors"
          >
            Clear filters
          </button>
        )}

        <p
          className="text-[10px] text-text-subtle ml-auto flex-shrink-0
                      hidden sm:block"
        >
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Table ── */}
      <ServiceTable
        data={pageData}
        total={filtered.length}
        page={page}
        perPage={PER_PAGE}
        onPage={(p) => setPage(p)}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onView={setViewOrder}
        onEdit={(order) => {
          setEditOrder(order);
          setFormOpen(true);
        }}
        onDelete={setDeleteOrder}
        onClearFilters={handleRefresh}
      />

      {/* ── Detail drawer ── */}
      <ServiceDetailDrawer
        order={viewOrder}
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        onEdit={(order) => {
          setEditOrder(order);
          setFormOpen(true);
        }}
        onDelete={setDeleteOrder}
        onStatusChange={handleStatusChange}
      />

      {/* ── Form page ── */}
      <ServiceFormPage
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditOrder(null);
        }}
        onSave={handleSave}
        editOrder={editOrder}
        technicianOptions={technicianOptions}
      />

      {/* ── Delete confirm ── */}
      <DeleteConfirm
        isOpen={!!deleteOrder}
        onClose={() => setDeleteOrder(null)}
        onConfirm={() => handleDelete(deleteOrder)}
        title="Delete Work Order?"
        itemName={deleteOrder?.workOrderId}
        confirmText={deleteOrder?.workOrderId}
      />
    </div>
  );
}

export default Service;
