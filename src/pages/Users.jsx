// src/pages/Users.jsx
//
// Phase-1-style: local useState seeded from mockData.js, persisted to
// localStorage, cross-module sync via CustomEvent. Reads roles via the
// same localStorage-listener pattern Inventory used for cross-store reads.

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Download } from "lucide-react";
import {
  users as initialUsers,
  generateEmployeeId,
  roles as seedRoles,
} from "../data/mockData";
import UserTable from "../components/users/UserTable";
import UserFormDrawer from "../components/users/UserFormDrawer";
import UserDetailDrawer from "../components/users/UserDetailDrawer";
import UserFilterDrawer from "../components/users/UserFilterDrawer";
import { Button, DeleteConfirm, ChangeStatusModal } from "../components/ui";
import apexToast from "../utils/toast";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

const PER_PAGE = 10;
const EMPTY_FILTERS = { status: [], roleId: "", department: "" };
const CURRENT_USER_ID = 1; // mocked "logged in as" — Admin User from seed

const USER_EXPORT_COLS = [
  { id: "employeeId", label: "Employee ID" },
  { id: "fullName", label: "Name" },
  { id: "email", label: "Email" },
  { id: "department", label: "Department" },
  { id: "status", label: "Status" },
];

function Users() {
  // ── Data — load from localStorage, fall back to seed ──────────────────────
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-users");
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  // ── Persist + notify on every change (Roles module listens for this) ──────
  useEffect(() => {
    localStorage.setItem("apex-gt-users", JSON.stringify(users));
    window.dispatchEvent(
      new CustomEvent("apex-gt-users-updated", {
        detail: { users },
      }),
    );
  }, [users]);

  // ── Read roles live from localStorage (Roles module writes this) ──────────
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-roles");
      return saved ? JSON.parse(saved) : seedRoles;
    } catch {
      return seedRoles;
    }
  });

  useEffect(() => {
    const onRolesUpdate = (e) => {
      if (e.detail?.roles) setRoles(e.detail.roles);
    };
    window.addEventListener("apex-gt-roles-updated", onRolesUpdate);
    return () =>
      window.removeEventListener("apex-gt-roles-updated", onRolesUpdate);
  }, []);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [sortField, setSortField] = useState("fullName");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      invited: users.filter((u) => u.status === "invited").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      inactive: users.filter((u) => u.status === "inactive").length,
    }),
    [users],
  );

  const filterCount = useMemo(() => {
    const f = activeFilters;
    return (
      (f.status?.length || 0) + (f.roleId ? 1 : 0) + (f.department ? 1 : 0)
    );
  }, [activeFilters]);

  const filtered = useMemo(() => {
    let data = [...users];
    const f = activeFilters;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((u) =>
        `${u.fullName} ${u.employeeId} ${u.email}`.toLowerCase().includes(q),
      );
    }
    if (f.status?.length)
      data = data.filter((u) => f.status.includes(u.status));
    if (f.roleId) data = data.filter((u) => u.roleId === Number(f.roleId));
    if (f.department) data = data.filter((u) => u.department === f.department);

    return [...data].sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [users, search, activeFilters, sortField, sortDir]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const handleSort = useCallback((field) => {
    setSortField((prev) => {
      setSortDir(
        prev === field ? (d) => (d === "asc" ? "desc" : "asc") : () => "asc",
      );
      return field;
    });
    setPage(1);
  }, []);

  const handleSave = useCallback(
    (data) => {
      const exists = users.find((u) => u.id === data.id);
      if (exists) {
        setUsers((prev) =>
          prev.map((u) => (u.id === data.id ? { ...u, ...data } : u)),
        );
        apexToast.success(
          "User Updated",
          `${data.fullName} updated successfully.`,
        );
      } else {
        const newUser = {
          ...data,
          id: Date.now(),
          employeeId: generateEmployeeId(users),
          lastLogin: null,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setUsers((prev) => [newUser, ...prev]);
        apexToast.success(
          "User Added",
          `${newUser.fullName} (${newUser.employeeId}) invited.`,
        );
      }
      setFormOpen(false);
      setEditUser(null);
      setPage(1);
    },
    [users],
  );

  const handleDelete = useCallback((user) => {
    if (user.id === CURRENT_USER_ID) {
      apexToast.error(
        "Cannot Delete",
        "You cannot delete your own account while logged in.",
      );
      setDeleteTarget(null);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setDeleteTarget(null);
    setViewUser(null);
    apexToast.info("User Removed", `${user.fullName} removed.`);
  }, []);

  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!newStatus) return;
      const count = selected.size;
      setUsers((prev) =>
        prev.map((u) => (selected.has(u.id) ? { ...u, status: newStatus } : u)),
      );
      setSelected(new Set());
      setStatusModal(false);
      apexToast.success(
        "Status Updated",
        `${count} user${count > 1 ? "s" : ""} marked as ${newStatus}.`,
      );
    },
    [selected],
  );

  const handleBulkDelete = useCallback(() => {
    const idsToDelete = new Set(selected);
    if (idsToDelete.has(CURRENT_USER_ID)) {
      idsToDelete.delete(CURRENT_USER_ID);
      apexToast.error(
        "Cannot Delete",
        "Your own account was excluded from this action.",
      );
    }
    const count = idsToDelete.size;
    setUsers((prev) => prev.filter((u) => !idsToDelete.has(u.id)));
    setSelected(new Set());
    apexToast.info("Deleted", `${count} user${count > 1 ? "s" : ""} removed.`);
  }, [selected]);

  const handleExport = useCallback(
    (type) => {
      if (type === "Excel") {
        exportToExcel(filtered, USER_EXPORT_COLS, "apex-gt-users");
        apexToast.success(
          "Excel Exported",
          `${filtered.length} users exported.`,
        );
      } else {
        exportToPDF(
          filtered,
          USER_EXPORT_COLS,
          "User Directory",
          "apex-gt-users",
        );
        apexToast.success("PDF Exported", `${filtered.length} users exported.`);
      }
    },
    [filtered],
  );

  const handleReset = useCallback(() => {
    setSearch("");
    setActiveFilters(EMPTY_FILTERS);
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
      setSelected(checked ? new Set(pageData.map((u) => u.id)) : new Set());
    },
    [pageData],
  );

  const STAT_ITEMS = [
    { label: "Total Users", value: stats.total, color: "text-text-primary" },
    { label: "Active", value: stats.active, color: "text-emerald-400" },
    { label: "Invited", value: stats.invited, color: "text-sky-accent" },
    { label: "Suspended", value: stats.suspended, color: "text-amber-400" },
    { label: "Inactive", value: stats.inactive, color: "text-text-subtle" },
  ];

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-text-primary">Users</h1>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            {stats.total} team members · {stats.active} active
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditUser(null);
            setFormOpen(true);
          }}
        >
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-shrink-0">
        {STAT_ITEMS.map((s) => (
          <motion.div
            key={s.label}
            className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center justify-between"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase truncate">
              {s.label}
            </p>
            <p className={`text-base font-extrabold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          />
          <input
            className="input-luxury w-full pl-9 text-xs py-2.5"
            placeholder="Search by name, email, or employee ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={Filter}
          onClick={() => setFilterOpen(true)}
        >
          Filters{" "}
          {filterCount > 0 && (
            <span className="ml-1 text-gold">({filterCount})</span>
          )}
        </Button>
        {selected.size > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusModal(true)}
            >
              Status ({selected.size})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              className="hover:!border-rose-400/40 hover:!text-rose-400"
            >
              Delete ({selected.size})
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={Download}
          onClick={() => handleExport("Excel")}
        >
          Export
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <UserTable
          data={pageData}
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
          onView={setViewUser}
          onEdit={(u) => {
            setEditUser(u);
            setFormOpen(true);
          }}
          onDelete={setDeleteTarget}
          onClearFilters={handleReset}
          roles={roles}
        />
      </div>

      <UserFormDrawer
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditUser(null);
        }}
        onSave={handleSave}
        editUser={editUser}
        roles={roles}
        allUsers={users}
      />

      <UserDetailDrawer
        user={viewUser}
        isOpen={!!viewUser}
        onClose={() => setViewUser(null)}
        onEdit={(u) => {
          setViewUser(null);
          setEditUser(u);
          setFormOpen(true);
        }}
        onDelete={setDeleteTarget}
        roles={roles}
      />

      <UserFilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setPage(1);
          setFilterOpen(false);
        }}
        activeCount={filterCount}
        roles={roles}
      />

      <DeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Delete this user?"
        itemName={deleteTarget?.fullName}
        confirmText={deleteTarget?.employeeId}
      />

      <ChangeStatusModal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        onConfirm={handleStatusChange}
        count={selected.size}
        statuses={["active", "invited", "suspended", "inactive"]}
      />
    </div>
  );
}

export default Users;
