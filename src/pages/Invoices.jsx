// src/pages/Invoices.jsx
// Split layout: invoice list left + live preview right

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  invoices as initialInvoices,
  DEFAULT_INVOICE_COLUMNS,
  calcInvoice,
} from "../data/mockData";
import { DeleteConfirm, ChangeStatusModal } from "../components/ui";
import InvoiceStats from "../components/invoices/InvoiceStats";
import InvoiceBottomSheet from "../components/invoices/InvoiceBottomSheet";
import InvoiceToolbar from "../components/invoices/InvoiceToolbar";
import InvoiceTable from "../components/invoices/InvoiceTable";
import InvoicePreview from "../components/invoices/InvoicePreview";
import InvoiceFilterDrawer from "../components/invoices/InvoiceFilterDrawer";
import InvoiceFormPage from "../components/invoices/InvoiceFormPage";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import { generateInvoicePDF } from "../utils/invoicePDFUtils";
import apexToast from "../utils/toast";

const PER_PAGE = 10;
const LS_KEY = "apex-gt-invoice-cols";
const EMPTY_FILTERS = {
  status: [],
  method: "",
  from: "",
  to: "",
  minAmt: "",
  maxAmt: "",
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const EXPORT_COLS = [
  { id: "invoiceId", label: "Invoice ID" },
  { id: "customerName", label: "Customer" },
  { id: "carName", label: "Car" },
  { id: "issuedDate", label: "Issued Date" },
  { id: "dueDate", label: "Due Date" },
  { id: "status", label: "Status" },
  { id: "method", label: "Payment Method" },
  { id: "total", label: "Total (AED)" },
];

function Invoices() {
  const [invoices, setInvoices] = useState(initialInvoices);

  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Search + filters
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

  const filterCount = useMemo(() => {
    const f = activeFilters;
    return (
      f.status.length +
      (f.method ? 1 : 0) +
      (f.from || f.to ? 1 : 0) +
      (f.minAmt || f.maxAmt ? 1 : 0)
    );
  }, [activeFilters]);

  // Sort
  const [sortField, setSortField] = useState("issuedDate");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination
  const [page, setPage] = useState(1);

  // Selection
  const [selected, setSelected] = useState(new Set());

  // Columns
  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_INVOICE_COLUMNS;
    } catch {
      return DEFAULT_INVOICE_COLUMNS;
    }
  });
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(columns));
  }, [columns]);

  // Preview panel — which invoice is selected
  const [activeInvoice, setActiveInvoice] = useState(invoices[0] || null);

  // UI state
  const [filterOpen, setFilterOpen] = useState(false);
  const [colMgrOpen, setColMgrOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [deleteInvoice, setDeleteInvoice] = useState(null);
  const [deleteBulk, setDeleteBulk] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const revenue = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => {
        const { total } = calcInvoice(inv.items, inv.discount, inv.vatRate);
        return sum + total;
      }, 0);

    return {
      total: invoices.length,
      paid: invoices.filter((i) => i.status === "paid").length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
      sent: invoices.filter((i) => i.status === "sent").length,
      partially_paid: invoices.filter((i) => i.status === "partially_paid")
        .length,
      draft: invoices.filter((i) => i.status === "draft").length,
      revenue,
    };
  }, [invoices]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let data = [...invoices];
    const f = activeFilters;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((inv) =>
        `${inv.invoiceId} ${inv.customerName} ${inv.carName} ${inv.carPlate}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (f.status.length) data = data.filter((i) => f.status.includes(i.status));
    if (f.method) data = data.filter((i) => i.method === f.method);
    if (f.from) data = data.filter((i) => i.dueDate >= f.from);
    if (f.to) data = data.filter((i) => i.dueDate <= f.to);
    if (f.minAmt) {
      data = data.filter((i) => {
        const { total } = calcInvoice(i.items, i.discount, i.vatRate);
        return total >= Number(f.minAmt);
      });
    }
    if (f.maxAmt) {
      data = data.filter((i) => {
        const { total } = calcInvoice(i.items, i.discount, i.vatRate);
        return total <= Number(f.maxAmt);
      });
    }

    data.sort((a, b) => {
      let av, bv;
      if (sortField === "amount") {
        av = calcInvoice(a.items, a.discount, a.vatRate).total;
        bv = calcInvoice(b.items, b.discount, b.vatRate).total;
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
  }, [invoices, search, activeFilters, sortField, sortDir]);

  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  // Handlers
  const handleSort = useCallback((field) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("desc");
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
      setSelected(checked ? new Set(pageData.map((i) => i.id)) : new Set());
    },
    [pageData],
  );

  const clearSelected = useCallback(() => setSelected(new Set()), []);

  const handleSave = useCallback((data) => {
    setInvoices((prev) =>
      prev.find((i) => i.id === data.id)
        ? prev.map((i) => (i.id === data.id ? data : i))
        : [data, ...prev],
    );
    setActiveInvoice(data);
    setPage(1);
  }, []);

  const handleDelete = useCallback(
    (invoice) => {
      setInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
      if (activeInvoice?.id === invoice.id) setActiveInvoice(null);
      setDeleteInvoice(null);
      apexToast.info("Invoice Removed", `${invoice.invoiceId} deleted.`);
    },
    [activeInvoice],
  );

  const handleBulkDelete = useCallback(() => {
    const count = selected.size;
    setInvoices((prev) => prev.filter((i) => !selected.has(i.id)));
    if (selected.has(activeInvoice?.id)) setActiveInvoice(null);
    setSelected(new Set());
    setDeleteBulk(false);
    apexToast.info(
      "Bulk Delete",
      `${count} invoice${count > 1 ? "s" : ""} deleted.`,
    );
  }, [selected, activeInvoice]);

  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!newStatus) return;
      const count = selected.size;
      setInvoices((prev) =>
        prev.map((i) => (selected.has(i.id) ? { ...i, status: newStatus } : i)),
      );
      if (activeInvoice && selected.has(activeInvoice.id)) {
        setActiveInvoice((prev) => ({ ...prev, status: newStatus }));
      }
      setSelected(new Set());
      setStatusModal(false);
      apexToast.success(
        "Status Updated",
        `${count} invoice${count > 1 ? "s" : ""} marked as ${newStatus}.`,
      );
    },
    [selected, activeInvoice],
  );

  const handleReset = useCallback(() => {
    setSearch("");
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
    apexToast.success("Refreshed", "Filters cleared.");
  }, []);

  const handleExport = useCallback(
    (type) => {
      // Add computed total to each row for export
      const exportData = filtered.map((inv) => ({
        ...inv,
        total: calcInvoice(inv.items, inv.discount, inv.vatRate).total,
      }));
      if (type === "Excel") {
        exportToExcel(exportData, EXPORT_COLS, "apex-gt-invoices");
        apexToast.success(
          "Excel Exported",
          `${filtered.length} invoices exported.`,
        );
      } else {
        exportToPDF(
          exportData,
          EXPORT_COLS,
          "Invoice Report",
          "apex-gt-invoices",
        );
        apexToast.success(
          "PDF Exported",
          `${filtered.length} invoices exported.`,
        );
      }
    },
    [filtered],
  );

  const handleDownloadPDF = useCallback((invoice) => {
    generateInvoicePDF(invoice);
    apexToast.success(
      "PDF Downloaded",
      `${invoice.invoiceId} downloaded successfully.`,
    );
  }, []);

  const handleSend = useCallback((invoice) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoice.id ? { ...i, status: "sent" } : i)),
    );
    apexToast.success("Invoice Sent", `${invoice.invoiceId} marked as sent.`);
  }, []);

  // Update handleView:
  const handleView = useCallback((invoice) => {
    setActiveInvoice(invoice);
    setMobilePreviewOpen(true); // ← opens bottom sheet on mobile
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 h-full pb-3">
      <InvoiceStats stats={stats} />

      <InvoiceToolbar
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
        onCreateInvoice={() => {
          setEditInvoice(null);
          setFormOpen(true);
        }}
      />

      {/* ── Split layout: table left + preview right ── */}
      {/* ── Split layout: table left + preview right ── */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Table — full width on mobile, shared on desktop */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <InvoiceTable
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
            onView={handleView}
            onEdit={(inv) => {
              setEditInvoice(inv);
              setFormOpen(true);
            }}
            onDelete={setDeleteInvoice}
            onDownloadPDF={handleDownloadPDF}
            onSend={handleSend}
            activeInvoiceId={activeInvoice?.id}
            onClearFilters={handleReset}
          />
        </div>

        {/* Desktop preview panel — hidden on mobile */}
        <div className="w-[460px] flex-shrink-0 hidden lg:flex flex-col min-h-0">
          <InvoicePreview
            invoice={activeInvoice}
            onEdit={(inv) => {
              setEditInvoice(inv);
              setFormOpen(true);
            }}
            onDownloadPDF={handleDownloadPDF}
            onSend={handleSend}
          />
        </div>
      </div>

      {/* ── Mobile bottom sheet preview ── */}
      <InvoiceBottomSheet
        invoice={activeInvoice}
        isOpen={mobilePreviewOpen}
        onClose={() => setMobilePreviewOpen(false)}
        onEdit={(inv) => {
          setMobilePreviewOpen(false);
          setEditInvoice(inv);
          setFormOpen(true);
        }}
        onDownloadPDF={handleDownloadPDF}
        onSend={handleSend}
      />

      {/* Modals & drawers */}
      <InvoiceFilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setActiveFilters(f);
          setPage(1);
        }}
      />

      <InvoiceFormPage
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditInvoice(null);
        }}
        onSave={handleSave}
        editInvoice={editInvoice}
        allInvoices={invoices}
      />

      <DeleteConfirm
        isOpen={!!deleteInvoice}
        onClose={() => setDeleteInvoice(null)}
        onConfirm={() => handleDelete(deleteInvoice)}
        title="Delete Invoice?"
        itemName={deleteInvoice?.invoiceId}
        confirmText={deleteInvoice?.invoiceId}
      />

      <DeleteConfirm
        isOpen={deleteBulk}
        onClose={() => setDeleteBulk(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} Invoice${selected.size > 1 ? "s" : ""}?`}
        description={`Permanently remove ${selected.size} selected invoice${selected.size > 1 ? "s" : ""}. This cannot be undone.`}
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

export default Invoices;
