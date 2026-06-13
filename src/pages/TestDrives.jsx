// src/pages/TestDrives.jsx

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  testDrives as initialBookings,
  DEFAULT_TESTDRIVE_COLUMNS,
} from "../data/mockData";
import { DeleteConfirm, ChangeStatusModal } from "../components/ui";
import TestDriveStats from "../components/testdrives/TestDriveStats";
import TestDriveToolbar from "../components/testdrives/TestDriveToolbar";
import TestDriveTable from "../components/testdrives/TestDriveTable";
import TestDriveCalendar from "../components/testdrives/TestDriveCalendar";
import TestDriveFilterDrawer from "../components/testdrives/TestDriveFilterDrawer";
import TestDriveFormPage from "../components/testdrives/TestDriveFormPage";
import TestDriveDetailDrawer from "../components/testdrives/TestDriveDetailDrawer";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import apexToast from "../utils/toast";

const PER_PAGE = 10;
const LS_KEY = "apex-gt-testdrive-cols";
const EMPTY_FILTERS = { status: [], exec: "", from: "", to: "" };

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const EXPORT_COLS = [
  { id: "bookingId", label: "Booking ID" },
  { id: "customerName", label: "Customer" },
  { id: "carName", label: "Car" },
  { id: "date", label: "Date" },
  { id: "time", label: "Time" },
  { id: "duration", label: "Duration" },
  { id: "exec", label: "Sales Exec" },
  { id: "location", label: "Location" },
  { id: "status", label: "Status" },
  { id: "source", label: "Source" },
];

function TestDrives() {
  const [bookings, setBookings] = useState(initialBookings);

  // Search + filters
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  const filterCount = useMemo(() => {
    const f = activeFilters;
    return f.status.length + (f.exec ? 1 : 0) + (f.from || f.to ? 1 : 0);
  }, [activeFilters]);

  // Sort
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination
  const [page, setPage] = useState(1);

  // Selection
  const [selected, setSelected] = useState(new Set());

  // Columns
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TESTDRIVE_COLUMNS;
    } catch {
      return DEFAULT_TESTDRIVE_COLUMNS;
    }
  });
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(columns));
  }, [columns]);

  // View: table | calendar
  const [view, setView] = useState("table");

  // UI state
  const [filterOpen, setFilterOpen] = useState(false);
  const [colMgrOpen, setColMgrOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [viewBooking, setViewBooking] = useState(null);
  const [deleteBooking, setDeleteBooking] = useState(null);
  const [deleteBulk, setDeleteBulk] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

  // Stats
  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings],
  );

  // Filtered + sorted
  const filtered = useMemo(() => {
    let data = [...bookings];
    const f = activeFilters;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((b) =>
        `${b.customerName} ${b.carName} ${b.exec} ${b.bookingId} ${b.carPlate}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (f.status.length) data = data.filter((b) => f.status.includes(b.status));
    if (f.exec) data = data.filter((b) => b.exec === f.exec);
    if (f.from) data = data.filter((b) => b.date >= f.from);
    if (f.to) data = data.filter((b) => b.date <= f.to);

    data.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [bookings, search, activeFilters, sortField, sortDir]);

  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  // Handlers
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

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const selectAll = useCallback(
    (checked) => {
      setSelected(checked ? new Set(pageData.map((b) => b.id)) : new Set());
    },
    [pageData],
  );

  const clearSelected = useCallback(() => setSelected(new Set()), []);

  const handleSave = useCallback((data) => {
    setBookings((prev) =>
      prev.find((b) => b.id === data.id)
        ? prev.map((b) => (b.id === data.id ? data : b))
        : [data, ...prev],
    );
    setPage(1);
  }, []);

  const handleDelete = useCallback((booking) => {
    setBookings((prev) => prev.filter((b) => b.id !== booking.id));
    setDeleteBooking(null);
    setViewBooking(null);
    apexToast.info("Booking Removed", `${booking.bookingId} has been removed.`);
  }, []);

  const handleBulkDelete = useCallback(() => {
    const count = selected.size;
    setBookings((prev) => prev.filter((b) => !selected.has(b.id)));
    setSelected(new Set());
    setDeleteBulk(false);
    apexToast.info(
      "Bulk Delete",
      `${count} booking${count > 1 ? "s" : ""} removed.`,
    );
  }, [selected]);

  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!newStatus) return;
      const count = selected.size;
      setBookings((prev) =>
        prev.map((b) => (selected.has(b.id) ? { ...b, status: newStatus } : b)),
      );
      setSelected(new Set());
      setStatusModal(false);
      apexToast.success(
        "Status Updated",
        `${count} booking${count > 1 ? "s" : ""} marked as ${newStatus}.`,
      );
    },
    [selected],
  );

  // ── Quick status change (single booking) ──────────────────────────────────
  const updateSingleStatus = useCallback((booking, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus } : b)),
    );
    setViewBooking((prev) =>
      prev?.id === booking.id ? { ...prev, status: newStatus } : prev,
    );
    apexToast.success(
      "Status Updated",
      `${booking.bookingId} marked as ${newStatus}.`,
    );
  }, []);

  const handleApprove = useCallback(
    (b) => updateSingleStatus(b, "approved"),
    [updateSingleStatus],
  );
  const handleReject = useCallback(
    (b) => updateSingleStatus(b, "rejected"),
    [updateSingleStatus],
  );
  const handleComplete = useCallback(
    (b) => updateSingleStatus(b, "completed"),
    [updateSingleStatus],
  );
  const handleCancel = useCallback(
    (b) => updateSingleStatus(b, "cancelled"),
    [updateSingleStatus],
  );

  const handleReset = useCallback(() => {
    setSearch("");
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
    apexToast.success("Refreshed", "Filters cleared.");
  }, []);

  const handleExport = useCallback(
    (type) => {
      if (type === "Excel") {
        exportToExcel(filtered, EXPORT_COLS, "apex-gt-testdrives");
        apexToast.success(
          "Excel Exported",
          `${filtered.length} bookings exported.`,
        );
      } else {
        exportToPDF(
          filtered,
          EXPORT_COLS,
          "Test Drive Report",
          "apex-gt-testdrives",
        );
        apexToast.success(
          "PDF Exported",
          `${filtered.length} bookings exported.`,
        );
      }
    },
    [filtered],
  );

  return (
    <div className="flex flex-col gap-3 h-full pb-3">
      <TestDriveStats stats={stats} />

      <TestDriveToolbar
        search={search}
        onSearch={(s) => {
          setSearch(s);
          setPage(1);
        }}
        filterCount={filterCount}
        onFilterOpen={() => setFilterOpen(true)}
        colMgrOpen={colMgrOpen}
        onColMgrToggle={() => setColMgrOpen((p) => !p)}
        columns={columns}
        onColumnsChange={setColumns}
        selected={selected}
        onClearSelected={clearSelected}
        onChangeStatus={() => setStatusModal(true)}
        onDeleteSelected={() => setDeleteBulk(true)}
        onRefresh={handleReset}
        onExport={handleExport}
        onAddBooking={() => {
          setEditBooking(null);
          setFormOpen(true);
        }}
        view={view}
        onViewChange={setView}
      />

      {/* ── Table or Calendar based on view ── */}
      {view === "table" ? (
        <TestDriveTable
          data={pageData}
          columns={columns}
          total={filtered.length}
          page={page}
          onPage={(p) => {
            setPage(p);
            setSelected(new Set());
          }}
          perPage={PER_PAGE}
          selected={selected}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onView={setViewBooking}
          onEdit={(b) => {
            setEditBooking(b);
            setViewBooking(null);
            setFormOpen(true);
          }}
          onDelete={setDeleteBooking}
          onApprove={handleApprove}
          onReject={handleReject}
          onClearFilters={handleReset}
        />
      ) : (
        <TestDriveCalendar
          bookings={filtered}
          onBookingClick={setViewBooking}
          onDayClick={(dateStr, dayBookings) => {
            // If clicking a day with bookings → show first
            // If empty day → open form pre-filled with that date
            if (dayBookings.length > 0) {
              setViewBooking(dayBookings[0]);
            } else {
              setEditBooking(null);
              setFormOpen(true);
            }
          }}
        />
      )}

      {/* Drawers & Modals */}
      <TestDriveFilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setActiveFilters(f);
          setPage(1);
        }}
        activeCount={filterCount}
      />

      <TestDriveDetailDrawer
        booking={viewBooking}
        isOpen={!!viewBooking}
        onClose={() => setViewBooking(null)}
        onEdit={(b) => {
          setViewBooking(null);
          setEditBooking(b);
          setFormOpen(true);
        }}
        onDelete={(b) => {
          setViewBooking(null);
          setDeleteBooking(b);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />

      <TestDriveFormPage
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditBooking(null);
        }}
        onSave={handleSave}
        editBooking={editBooking}
        allBookings={bookings}
      />

      <DeleteConfirm
        isOpen={!!deleteBooking}
        onClose={() => setDeleteBooking(null)}
        onConfirm={() => handleDelete(deleteBooking)}
        title="Delete Booking?"
        itemName={deleteBooking?.bookingId}
        confirmText={deleteBooking?.bookingId}
      />

      <DeleteConfirm
        isOpen={deleteBulk}
        onClose={() => setDeleteBulk(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} Booking${selected.size > 1 ? "s" : ""}?`}
        description={`Permanently remove ${selected.size} selected booking${selected.size > 1 ? "s" : ""}. This cannot be undone.`}
      />

      <ChangeStatusModal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        onConfirm={handleStatusChange}
        count={selected.size}
        statusOptions={STATUS_OPTIONS}
      />
    </div>
  );
}

export default TestDrives;
