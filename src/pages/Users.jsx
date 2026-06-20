// src/pages/Users.jsx
// Identical architecture to Customers.jsx

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notify } from "../utils/notificationUtils";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import {
  users as initialUsers,
  roles as seedRoles,
  DEFAULT_USER_COLUMNS,
  generateEmployeeId,
} from "../data/mockData";

import { DeleteConfirm, ChangeStatusModal } from "../components/ui";
import UserStats from "../components/users/UserStats";
import UserToolbar from "../components/users/UserToolbar";
import UserTable from "../components/users/UserTable";
import UserFilterDrawer from "../components/users/UserFilterDrawer";
import UserFormPage from "../components/users/UserFormPage";
import UserDetailDrawer from "../components/users/UserDetailDrawer";
import SavedFiltersDropdown from "../components/ui/SavedFilterDropdown";
import FilterChipRow from "../components/ui/FilterChipRow";
import { USER_FILTER_CONFIG } from "../utils/filterConfig";
import apexToast from "../utils/toast";

const PER_PAGE = 10;
const EMPTY_FILTERS = { status: [], roleId: "", department: "" };
const CURRENT_USER_ID = 1; // mocked "logged in as" — Admin User from seed

function Users() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-users");
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
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
      const user = users.find((u) => u.id === openId);
      if (user) openView(user);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, users]);

  // ── Roles — read live, written by Settings → User Management ──────────────
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

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const filterCount = useMemo(() => {
    const f = activeFilters;
    return f.status.length + (f.roleId ? 1 : 0) + (f.department ? 1 : 0);
  }, [activeFilters]);

  const [sortField, setSortField] = useState("fullName");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-user-cols");
      return saved ? JSON.parse(saved) : DEFAULT_USER_COLUMNS;
    } catch {
      return DEFAULT_USER_COLUMNS;
    }
  });

  useEffect(() => {
    localStorage.setItem("apex-gt-users", JSON.stringify(users));
    window.dispatchEvent(
      new CustomEvent("apex-gt-users-updated", { detail: { users } }),
    );
  }, [users]);

  useEffect(() => {
    localStorage.setItem("apex-gt-user-cols", JSON.stringify(columns));
  }, [columns]);

  const [selected, setSelected] = useState(new Set());

  const [filterOpen, setFilterOpen] = useState(false);
  const [colMgrOpen, setColMgrOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteBulk, setDeleteBulk] = useState(false);
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

  const filtered = useMemo(() => {
    let data = [...users];
    const f = activeFilters;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((u) =>
        `${u.fullName} ${u.employeeId} ${u.email}`.toLowerCase().includes(q),
      );
    }
    if (f.status.length) data = data.filter((u) => f.status.includes(u.status));
    if (f.roleId) data = data.filter((u) => u.roleId === Number(f.roleId));
    if (f.department) data = data.filter((u) => u.department === f.department);

    data.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [users, search, activeFilters, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
      setSelected(checked ? new Set(pageData.map((u) => u.id)) : new Set());
    },
    [pageData],
  );

  // Bug 2 FIX: notify.* now actually called (was missing before)
  const handleSave = useCallback((data) => {
    setUsers((prev) => {
      const exists = prev.find((u) => u.id === data.id);
      if (exists) {
        notify.userUpdated(data);
        return prev.map((u) => (u.id === data.id ? data : u));
      }
      const newUser = { ...data, id: Date.now() };
      notify.userAdded(newUser);
      return [newUser, ...prev];
    });
    setFormOpen(false);
    setEditUser(null);
    setPage(1);
    apexToast.success(
      data.id ? "User Updated" : "User Added",
      `${data.fullName} has been ${data.id ? "updated" : "added"} successfully.`,
    );
  }, []);

  const handleDelete = useCallback(
    (user) => {
      const role = roles.find((r) => r.id === Number(user.roleId));
      if (user.id === CURRENT_USER_ID || role?.name === "Admin") {
        apexToast.error(
          "Cannot Delete",
          "The Admin account is managed in Settings and cannot be deleted here.",
        );
        setDeleteUser(null);
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeleteUser(null);
      setViewUser(null);
      apexToast.info("User Removed", `${user.fullName} removed successfully.`);
    },
    [roles],
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
    setDeleteBulk(false);
    apexToast.info(
      "Bulk Delete",
      `${count} user${count > 1 ? "s" : ""} removed.`,
    );
  }, [selected]);

  // Bug 2 FIX: notify per status change
  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!newStatus) return;
      const count = selected.size;
      setUsers((prev) =>
        prev.map((u) => {
          if (!selected.has(u.id)) return u;
          notify.userStatusChanged(u, newStatus);
          return { ...u, status: newStatus };
        }),
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

  const handleReset = useCallback(() => {
    setSearch("");
    setActiveFilters(EMPTY_FILTERS);
    setPage(1);
    apexToast.success("Refreshed", "Filters cleared.");
  }, []);

  // Bug 5 FIX: full export parity with Customer module
  const handleExport = useCallback(
    (type) => {
      const exportCols = [
        { id: "employeeId", label: "Employee ID" },
        { id: "user", label: "Name" },
        { id: "role", label: "Role" },
        { id: "department", label: "Department" },
        { id: "status", label: "Status" },
        { id: "lastLogin", label: "Last Login" },
        { id: "joined", label: "Joined" },
      ];
      // Inject resolved role name + flattened fields for export
      const exportData = filtered.map((u) => ({
        ...u,
        user: u.fullName,
        role:
          roles.find((r) => r.id === Number(u.roleId))?.name || "Unassigned",
        joined: u.joinDate,
      }));

      if (type === "Excel") {
        exportToExcel(exportData, exportCols, "apex-gt-users");
        apexToast.success(
          "Excel Exported",
          `${filtered.length} users exported.`,
        );
      } else {
        exportToPDF(exportData, exportCols, "User Directory", "apex-gt-users");
        apexToast.success("PDF Exported", `${filtered.length} users exported.`);
      }
    },
    [filtered, roles],
  );

  const openView = useCallback(
    (user) => {
      const idx = filtered.findIndex((u) => u.id === user.id);
      setViewUser({ ...user, _displayIndex: idx >= 0 ? idx : 0 });
    },
    [filtered],
  );

  const openEditForm = useCallback((user) => {
    setEditUser(user);
    setViewUser(null);
    setFormOpen(true);
  }, []);

  const openDeleteFromDrawer = useCallback((user) => {
    setViewUser(null);
    setDeleteUser(user);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full pb-3">
      <UserStats stats={stats} />

      <UserToolbar
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
        onAddUser={() => {
          setEditUser(null);
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
        config={USER_FILTER_CONFIG}
        onSaveClick={() => {
          setSavedFiltersSaveMode(true);
          setSavedFiltersOpen(true);
        }}
      />

      <SavedFiltersDropdown
        isOpen={savedFiltersOpen}
        onClose={() => setSavedFiltersOpen(false)}
        anchorRef={savedBtnRef}
        storageKey={USER_FILTER_CONFIG.storageKey}
        currentFilters={activeFilters}
        onApply={(f) => {
          setActiveFilters(f);
          setPage(1);
        }}
        saveMode={savedFiltersSaveMode}
        onSaveComplete={() => setSavedFiltersOpen(false)}
      />

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
        columns={columns}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAll}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onView={openView}
        onEdit={openEditForm}
        onDelete={setDeleteUser}
        onClearFilters={handleReset}
        roles={roles}
      />

      <UserFilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setActiveFilters(f);
          setPage(1);
        }}
        activeCount={filterCount}
        roles={roles}
      />

      <UserDetailDrawer
        user={viewUser}
        isOpen={!!viewUser}
        index={viewUser?._displayIndex ?? 0}
        onClose={() => setViewUser(null)}
        onEdit={openEditForm}
        onDelete={openDeleteFromDrawer}
        roles={roles}
      />

      <UserFormPage
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditUser(null);
        }}
        onSave={handleSave}
        editUser={editUser}
        allUsers={users}
        roles={roles}
      />

      <DeleteConfirm
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => handleDelete(deleteUser)}
        title="Delete User?"
        itemName={deleteUser?.fullName}
        confirmText={deleteUser?.fullName}
      />

      <DeleteConfirm
        isOpen={deleteBulk}
        onClose={() => setDeleteBulk(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} User${selected.size > 1 ? "s" : ""}?`}
        description={`This will permanently remove ${selected.size} selected user${selected.size > 1 ? "s" : ""}. This cannot be undone.`}
      />

      <ChangeStatusModal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        onConfirm={handleStatusChange}
        count={selected.size}
        statusOptions={[
          { value: "active", label: "Active" },
          { value: "invited", label: "Invited" },
          { value: "suspended", label: "Suspended" },
          { value: "inactive", label: "Inactive" },
        ]}
      />
    </div>
  );
}

export default Users;
