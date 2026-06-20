// src/pages/Customers.jsx

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { notify } from "../utils/notificationUtils";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import {
  customers as initialCustomers,
  DEFAULT_CUSTOMER_COLUMNS,
} from "../data/mockData";

import { DeleteConfirm, ChangeStatusModal } from "../components/ui";
import CustomerStats from "../components/customers/CustomerStats";
import CustomerToolbar from "../components/customers/CustomerToolbar";
import CustomerTable from "../components/customers/CustomerTable";
import CustomerFilterDrawer from "../components/customers/CustomerFilterDrawer";
import CustomerFormPage from "../components/customers/CustomerFormPage";
import CustomerDetailDrawer from "../components/customers/CustomerDetailDrawer";
import SavedFiltersDropdown from "../components/ui/SavedFilterDropdown";
import FilterChipRow from "../components/ui/FilterChipRow";
import { CUSTOMER_FILTER_CONFIG } from "../utils/filterConfig";
import apexToast from "../utils/toast";

const PER_PAGE = 10;

const EMPTY_FILTERS = { status: [], source: "" };

function Customers() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-customers");
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  const [savedFiltersOpen, setSavedFiltersOpen] = useState(false);
  const [savedFiltersSaveMode, setSavedFiltersSaveMode] = useState(false);
  const savedBtnRef = useRef();

  useEffect(() => {
    const openId = location.state?.openRecordId;
    if (openId) {
      const customer = customers.find((c) => c.id === openId);
      if (customer) openView(customer); // reuses existing openView (sets _displayIndex too)
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, customers]);

  // ── Search + filters ──────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  const filterCount = useMemo(() => {
    const f = activeFilters;
    return f.status.length + (f.source ? 1 : 0);
  }, [activeFilters]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // Add inside Customers():
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-customer-cols");
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMER_COLUMNS;
    } catch {
      return DEFAULT_CUSTOMER_COLUMNS;
    }
  });

  useEffect(() => {
    localStorage.setItem("apex-gt-customers", JSON.stringify(customers));
    window.dispatchEvent(
      new CustomEvent("apex-gt-customers-updated", {
        detail: { customers },
      }),
    );
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("apex-gt-customer-cols", JSON.stringify(columns));
  }, [columns]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState(new Set());

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false);
  const [colMgrOpen, setColMgrOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [viewIndex, setViewIndex] = useState(0);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [deleteBulk, setDeleteBulk] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((c) => c.status === "active").length,
      prospect: customers.filter((c) => c.status === "prospect").length,
      vip: customers.filter((c) => c.status === "vip").length,
      inactive: customers.filter((c) => c.status === "inactive").length,
      blacklisted: customers.filter((c) => c.status === "blacklisted").length,
    }),
    [customers],
  );

  // ── Filtered + sorted ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...customers];
    const f = activeFilters;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((c) =>
        `${c.name} ${c.customerId} ${c.email} ${c.mobile} ${c.mobileCode}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (f.status.length) data = data.filter((c) => f.status.includes(c.status));
    if (f.source) data = data.filter((c) => c.source === f.source);

    data.sort((a, b) => {
      let av, bv;
      if (sortField === "purchases") {
        av = a.purchases?.length || 0;
        bv = b.purchases?.length || 0;
      } else if (sortField === "spent") {
        av = a.purchases?.reduce((s, p) => s + p.amount, 0) || 0;
        bv = b.purchases?.reduce((s, p) => s + p.amount, 0) || 0;
      } else {
        av = a[sortField] ?? "";
        bv = b[sortField] ?? "";
      }
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [customers, search, activeFilters, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    (checked) => {
      setSelected(checked ? new Set(pageData.map((c) => c.id)) : new Set());
    },
    [pageData],
  );

  const handleSave = useCallback((data) => {
    setCustomers((prev) => {
      const exists = prev.find((c) => c.id === data.id);
      if (exists) {
        notify.customerUpdated(data);
        return prev.map((c) => (c.id === data.id ? data : c));
      }
      notify.customerAdded(data);
      return [data, ...prev];
    });
    setPage(1);
  }, []);

  const handleDelete = useCallback((customer) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    setDeleteCustomer(null); // ← this closes the modal
    setViewCustomer(null);
    apexToast.info(
      "Customer Removed",
      `${customer.name} removed successfully.`,
    );
  }, []);

  const handleBulkDelete = useCallback(() => {
    const count = selected.size;
    setCustomers((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setDeleteBulk(false);
    apexToast.info(
      "Bulk Delete",
      `${count} customer${count > 1 ? "s" : ""} removed.`,
    );
  }, [selected]);

  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!newStatus) return;
      const count = selected.size;
      setCustomers((prev) =>
        prev.map((c) => (selected.has(c.id) ? { ...c, status: newStatus } : c)),
      );
      setSelected(new Set());
      setStatusModal(false);
      apexToast.success(
        "Status Updated",
        `${count} customer${count > 1 ? "s" : ""} marked as ${newStatus}.`,
      );
    },
    [selected],
  );

  const handleReset = useCallback(() => {
    setSearch("");
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
    apexToast.success("Refreshed", "Filters cleared.");
  }, []);

  const handleExport = useCallback(
    (type) => {
      const exportCols = [
        { id: "customerId", label: "Customer ID" },
        { id: "customer", label: "Name" },
        { id: "status", label: "Status" },
        { id: "mobile", label: "Mobile" },
        { id: "source", label: "Source" },
        { id: "purchases", label: "Purchases" },
        { id: "spent", label: "Total Spent" },
        { id: "dob", label: "Birthday" },
        { id: "instagram", label: "Instagram" },
      ];

      if (type === "Excel") {
        exportToExcel(filtered, exportCols, "apex-gt-customers");
        apexToast.success(
          "Excel Exported",
          `${filtered.length} customers exported.`,
        );
      } else {
        exportToPDF(
          filtered,
          exportCols,
          "Customer Report",
          "apex-gt-customers",
        );
        apexToast.success(
          "PDF Exported",
          `${filtered.length} customers exported.`,
        );
      }
    },
    [filtered],
  );

  const openView = useCallback(
    (customer) => {
      // Find position in the current FILTERED list so color matches table row
      const idx = filtered.findIndex((c) => c.id === customer.id);
      // Attach _displayIndex to the object — underscore prefix = UI-only field
      setViewCustomer({ ...customer, _displayIndex: idx >= 0 ? idx : 0 });
    },
    [filtered],
  );

  const openEditForm = useCallback((customer) => {
    setEditCustomer(customer);
    setViewCustomer(null);
    setFormOpen(true);
  }, []);

  const openDeleteFromDrawer = useCallback((customer) => {
    setViewCustomer(null);
    setDeleteCustomer(customer);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 h-full pb-3">
      <CustomerStats stats={stats} />

      <CustomerToolbar
        search={search}
        onSearch={(s) => {
          setSearch(s);
          setPage(1);
        }}
        filterCount={filterCount}
        onFilterOpen={() => setFilterOpen(true)}
        colMgrOpen={colMgrOpen}
        onColMgrToggle={() => setColMgrOpen((prev) => !prev)}
        columns={columns}
        onColumnsChange={setColumns}
        selected={selected}
        onClearSelected={() => setSelected(new Set())}
        onChangeStatus={() => setStatusModal(true)}
        onDeleteSelected={() => setDeleteBulk(true)}
        onRefresh={handleReset}
        onExport={handleExport}
        onAddCustomer={() => {
          setEditCustomer(null);
          setFormOpen(true);
        }}
      />

      <FilterChipRow
        activeFilters={activeFilters}
        onFiltersChange={(f) => {
          setActiveFilters(f);
          setPage(1);
        }}
        onClearAll={handleReset}
        config={CUSTOMER_FILTER_CONFIG}
        onSaveClick={() => {
          setSavedFiltersSaveMode(true);
          setSavedFiltersOpen(true);
        }}
      />

      <SavedFiltersDropdown
        isOpen={savedFiltersOpen}
        onClose={() => setSavedFiltersOpen(false)}
        anchorRef={savedBtnRef}
        storageKey={CUSTOMER_FILTER_CONFIG.storageKey}
        currentFilters={activeFilters}
        onApply={(f) => {
          setActiveFilters(f);
          setPage(1);
        }}
        saveMode={savedFiltersSaveMode}
        onSaveComplete={() => setSavedFiltersOpen(false)}
      />

      <CustomerTable
        data={pageData}
        total={filtered.length}
        page={page}
        onPage={(p) => {
          setPage(p);
          setSelected(new Set());
        }}
        perPage={PER_PAGE}
        selected={selected}
        columns={columns}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAll}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onView={openView}
        onEdit={openEditForm}
        onDelete={setDeleteCustomer}
        onClearFilters={handleReset}
      />

      <CustomerFilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setActiveFilters(f);
          setPage(1);
        }}
        activeCount={filterCount}
      />

      <CustomerDetailDrawer
        customer={viewCustomer}
        isOpen={!!viewCustomer}
        index={viewCustomer?._displayIndex ?? 0}
        onClose={() => setViewCustomer(null)}
        onEdit={openEditForm}
        onDelete={openDeleteFromDrawer}
      />

      <CustomerFormPage
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditCustomer(null);
        }}
        onSave={handleSave}
        editCustomer={editCustomer}
        allCustomers={customers} // ← must be the live state array, not mockData import
      />

      <DeleteConfirm
        isOpen={!!deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        onConfirm={() => handleDelete(deleteCustomer)}
        title="Delete Customer?"
        itemName={deleteCustomer?.name}
        confirmText={deleteCustomer?.name}
      />

      <DeleteConfirm
        isOpen={deleteBulk}
        onClose={() => setDeleteBulk(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} Customer${selected.size > 1 ? "s" : ""}?`}
        description={`This will permanently remove ${selected.size} selected customer${selected.size > 1 ? "s" : ""}. This cannot be undone.`}
      />

      <ChangeStatusModal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        onConfirm={handleStatusChange}
        count={selected.size}
        statusOptions={[
          { value: "active", label: "Active" },
          { value: "prospect", label: "Prospect" },
          { value: "inactive", label: "Inactive" },
          { value: "vip", label: "VIP" },
          { value: "blacklisted", label: "Blacklisted" },
        ]}
      />
    </div>
  );
}

export default Customers;
