// src/pages/Inventory.jsx
// Complete Inventory module — uses all reusable components.
// Phase 5 final file.

import { useState, useEffect, useMemo, useCallback } from "react";
import { cars as initialCars, DEFAULT_COLUMNS } from "../data/mockData";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

// ── Reusable UI components ────────────────────────────────────────────────────
import { DeleteConfirm, ChangeStatusModal } from "../components/ui";

// ── Inventory-specific components ─────────────────────────────────────────────
import InventoryStats from "../components/inventory/InventoryStats";
import InventoryToolbar from "../components/inventory/InventoryToolbar";
import InventoryTable from "../components/inventory/InventoryTable";
import FilterDrawer from "../components/inventory/FilterDrawer";
import CarFormPage from "../components/inventory/CarFormPage";
import CarDetailDrawer from "../components/inventory/CarDetailDrawer";

// ── Utilities ─────────────────────────────────────────────────────────────────
import apexToast from "../utils/toast";
import useAppStore from "../store/useAppStore";

const PER_PAGE = 10;

const EMPTY_FILTERS = {
  status: [],
  fuel: [],
  bodyType: [],
  transmission: [],
  brand: "",
  priceMin: "",
  priceMax: "",
};

function Inventory() {
  // ── Core data ────────────────────────────────────────────────────────────
  const [cars, setCars] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-cars");
      return saved ? JSON.parse(saved) : initialCars;
    } catch {
      return initialCars;
    }
  });

  // ── Search + filters ─────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  // Count how many filter groups are active (for badge on filter button)
  const filterCount = useMemo(() => {
    const f = activeFilters;
    return (
      f.status.length +
      f.fuel.length +
      f.bodyType.length +
      f.transmission.length +
      (f.brand ? 1 : 0) +
      (f.priceMin || f.priceMax ? 1 : 0)
    );
  }, [activeFilters]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState("brand");
  const [sortDir, setSortDir] = useState("asc");

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Row selection ─────────────────────────────────────────────────────────
  const [selected, setSelected] = useState(new Set());

  // ── Column config (persisted to localStorage) ─────────────────────────────
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-inventory-cols");
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch {
      return DEFAULT_COLUMNS;
    }
  });

  useEffect(() => {
    localStorage.setItem("apex-gt-inventory-cols", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("apex-gt-cars", JSON.stringify(cars));
    // BUG-012 + BUG-013 FIX: dispatch a custom event so other modules can react
    // Phase 2 will replace this with Zustand store subscription
    window.dispatchEvent(
      new CustomEvent("apex-gt-cars-updated", {
        detail: { cars },
      }),
    );
  }, [cars]);

  useEffect(() => {
    const onCarsUpdated = (e) => {
      if (e.detail?.cars) {
        setCars(e.detail.cars);
      }
    };

    window.addEventListener("apex-gt-cars-updated", onCarsUpdated);
    return () =>
      window.removeEventListener("apex-gt-cars-updated", onCarsUpdated);
  }, []);

  // ── UI panel state ────────────────────────────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false);
  const [colMgrOpen, setColMgrOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editCar, setEditCar] = useState(null); // null = add mode
  const [viewCar, setViewCar] = useState(null); // drawer
  const [deleteCar, setDeleteCar] = useState(null); // single delete
  const [deleteBulk, setDeleteBulk] = useState(false); // bulk delete
  const [statusModal, setStatusModal] = useState(false); // change status

  // ── Sync live inventory count to sidebar badge ────────────────────────────
  const { setInventoryCount } = useAppStore();
  useEffect(() => {
    setInventoryCount(cars.length);
  }, [cars, setInventoryCount]);

  // ── Unique brands list (for filter drawer dropdown) ───────────────────────
  const brands = useMemo(
    () => [...new Set(cars.map((c) => c.brand))].sort(),
    [cars],
  );

  // ── Stats (live counts per status) ───────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: cars.length,
      available: cars.filter((c) => c.status === "available").length,
      reserved: cars.filter((c) => c.status === "reserved").length,
      sold: cars.filter((c) => c.status === "sold").length,
      maintenance: cars.filter((c) => c.status === "maintenance").length,
    }),
    [cars],
  );

  // ── Filtered + sorted data ────────────────────────────────────────────────
  // useMemo: only recalculates when one of its dependencies changes.
  // Without this, filtering + sorting would re-run on every keystroke
  // even when cars/filters didn't change.
  const filtered = useMemo(() => {
    let data = [...cars];
    const f = activeFilters;

    // Search across brand, model, plate, variant
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((c) =>
        `${c.brand} ${c.model} ${c.plate} ${c.variant || ""}`
          .toLowerCase()
          .includes(q),
      );
    }

    // Filter chips
    if (f.status.length) data = data.filter((c) => f.status.includes(c.status));
    if (f.fuel.length)
      data = data.filter((c) => f.fuel.includes(c.fuel || c.fuelType));
    if (f.bodyType.length)
      data = data.filter((c) => f.bodyType.includes(c.bodyType));
    if (f.transmission.length)
      data = data.filter((c) => f.transmission.includes(c.transmission));
    if (f.brand) data = data.filter((c) => c.brand === f.brand);
    if (f.priceMin) data = data.filter((c) => c.price >= Number(f.priceMin));
    if (f.priceMax) data = data.filter((c) => c.price <= Number(f.priceMax));

    // Sort
    data.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [cars, search, activeFilters, sortField, sortDir]);

  // Slice for current page
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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

  // ── Selection handlers ────────────────────────────────────────────────────
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

  const clearSelected = useCallback(() => setSelected(new Set()), []);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleSave = useCallback((carData) => {
    setCars((prev) => {
      const exists = prev.find((c) => c.id === carData.id);
      return exists
        ? prev.map((c) => (c.id === carData.id ? carData : c))
        : [carData, ...prev];
    });
    setPage(1);
  }, []);

  const handleDelete = useCallback((car) => {
    setCars((prev) => prev.filter((c) => c.id !== car.id));
    setDeleteCar(null);
    setViewCar(null);
    apexToast.info(
      "Car Removed",
      `${car.brand} ${car.model} removed from inventory.`,
    );
  }, []);

  const handleBulkDelete = useCallback(() => {
    const count = selected.size;
    setCars((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setDeleteBulk(false);
    apexToast.info(
      "Bulk Delete",
      `${count} car${count > 1 ? "s" : ""} removed from inventory.`,
    );
  }, [selected]);

  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!newStatus) return;
      const count = selected.size;
      setCars((prev) =>
        prev.map((c) => (selected.has(c.id) ? { ...c, status: newStatus } : c)),
      );
      setSelected(new Set());
      setStatusModal(false);
      apexToast.success(
        "Status Updated",
        `${count} car${count > 1 ? "s" : ""} marked as ${newStatus}.`,
      );
    },
    [selected],
  );

  const handleExport = useCallback(
    (type) => {
      const exportCols = columns
        .filter((col) => col.visible && col.id !== "image")
        .map((col) => {
          // Rename 'price' column to show it's the final price
          if (col.id === "price") return { ...col, label: "Final Price (AED)" };
          return col;
        });

      // Inject finalPrice into each row for clean export
      const exportData = filtered.map((car) => ({
        ...car,
        price: Number(car.price || 0) - Number(car.discount || 0),
      }));

      if (type === "Excel") {
        exportToExcel(exportData, exportCols, "apex-gt-inventory");
        apexToast.success(
          "Excel Exported",
          `${filtered.length} cars exported successfully.`,
        );
      } else {
        exportToPDF(
          exportData,
          exportCols,
          "Inventory Report",
          "apex-gt-inventory",
        );
        apexToast.success(
          "PDF Exported",
          `${filtered.length} cars exported successfully.`,
        );
      }
    },
    [filtered, columns],
  );

  // ── Reset all filters ─────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setSearch("");
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
    apexToast.success("Refreshed", "Filters cleared and inventory refreshed.");
  }, []);

  // ── Open form helpers ─────────────────────────────────────────────────────
  const openAddForm = useCallback(() => {
    setEditCar(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((car) => {
    setEditCar(car);
    setViewCar(null); // close detail drawer first
    setFormOpen(true);
  }, []);

  const openDeleteFromDrawer = useCallback((car) => {
    setViewCar(null);
    setDeleteCar(car);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 h-full pb-3">
      {/* ── Live stat pills ── */}
      <InventoryStats stats={stats} />

      {/* ── Toolbar: search, filters, columns, more, add ── */}
      <InventoryToolbar
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
        onClearSelected={clearSelected}
        onChangeStatus={() => setStatusModal(true)}
        onDeleteSelected={() => setDeleteBulk(true)}
        onRefresh={handleReset}
        onExport={handleExport}
        onAddCar={openAddForm}
      />

      {/* ── Main table ── */}
      <InventoryTable
        data={pageData}
        columns={columns}
        total={filtered.length}
        page={page}
        onPage={(p) => {
          setPage(p);
          setSelected(new Set()); // clear selection on page change
        }}
        perPage={PER_PAGE}
        selected={selected}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAll}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onView={setViewCar}
        onEdit={openEditForm}
        onDelete={setDeleteCar}
        onClearFilters={handleReset}
      />

      {/* ── Filter drawer ── */}
      <FilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setPage(1);
        }}
        brands={brands}
        activeCount={filterCount}
      />

      {/* ── Car detail drawer ── */}
      <CarDetailDrawer
        car={viewCar}
        isOpen={!!viewCar}
        onClose={() => setViewCar(null)}
        onEdit={openEditForm}
        onDelete={openDeleteFromDrawer}
      />

      {/* ── Add / Edit form (full page slide-up) ── */}
      <CarFormPage
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditCar(null);
        }}
        onSave={handleSave}
        editCar={editCar}
      />

      {/* ── Single car delete confirm ── */}
      <DeleteConfirm
        isOpen={!!deleteCar}
        onClose={() => setDeleteCar(null)}
        onConfirm={() => handleDelete(deleteCar)}
        title="Delete Car?"
        itemName={deleteCar ? `${deleteCar.brand} ${deleteCar.model}` : ""}
        confirmText={deleteCar ? `${deleteCar.brand} ${deleteCar.model}` : ""}
      />

      {/* ── Bulk delete confirm ── */}
      <DeleteConfirm
        isOpen={deleteBulk}
        onClose={() => setDeleteBulk(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} Car${selected.size > 1 ? "s" : ""}?`}
        description={`This will permanently remove ${selected.size} selected car${selected.size > 1 ? "s" : ""} from inventory. This cannot be undone.`}
      />

      {/* ── Bulk change status modal ── */}
      <ChangeStatusModal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        onConfirm={handleStatusChange}
        count={selected.size}
        statusOptions={[
          { value: "available", label: "Available" },
          { value: "reserved", label: "Reserved" },
          { value: "sold", label: "Sold" },
          { value: "maintenance", label: "Maintenance" },
        ]}
      />
    </div>
  );
}

export default Inventory;
