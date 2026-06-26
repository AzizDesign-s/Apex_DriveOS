// src/pages/Users.jsx
// Sprint 2.1 bugfix: fixed undefined `regularUsers` reference, properly
// derived regular users (excluding any legacy Admin row from seed data),
// and the merged adminRow + regular users array now actually flows into
// the table/stats instead of being computed and unused.

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAppStore from "../store/useAppStore";
import { activity } from "../utils/activityLogger";
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
const ADMIN_SYNTHETIC_ID = "admin"; // stable id for the store-derived Admin row

function Users() {
  // ── Regular users data (everyone EXCEPT the Admin) ─────────────────────────
  // FIX: the seed `initialUsers` previously included a hardcoded Admin
  // entry (id: 1). That entry is now excluded permanently — the Admin
  // is no longer a regular, independently-stored user record at all.
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-driveos-users");
      const parsed = saved ? JSON.parse(saved) : initialUsers;
      return parsed.filter((u) => u.id !== 1); // strip legacy seeded Admin row
    } catch {
      return initialUsers.filter((u) => u.id !== 1);
    }
  });

  // ── Admin identity — single source of truth from useAppStore ───────────────
  const adminUser = useAppStore((s) => s.user);

  const location = useLocation();
  const navigate = useNavigate();

  const [savedFiltersOpen, setSavedFiltersOpen] = useState(false);
  const [savedFiltersSaveMode, setSavedFiltersSaveMode] = useState(false);
  const savedBtnRef = useRef();

  // ── Roles — read live, written by Settings → User Management ──────────────
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-driveos-roles");
      return saved ? JSON.parse(saved) : seedRoles;
    } catch {
      return seedRoles;
    }
  });

  useEffect(() => {
    const onRolesUpdate = (e) => {
      if (e.detail?.roles) setRoles(e.detail.roles);
    };
    window.addEventListener("apex-driveos-roles-updated", onRolesUpdate);
    return () =>
      window.removeEventListener("apex-driveos-roles-updated", onRolesUpdate);
  }, []);

  // FIX: resolve the Admin role's actual id from live roles data, so the
  // synthetic admin row always points at a real role record (needed for
  // UserDetailDrawer's permission display, UserTable's Crown icon check, etc.)
  const adminRoleId = useMemo(() => {
    const adminRole = roles.find((r) => r.name === "Admin");
    return adminRole?.id ?? 1;
  }, [roles]);

  // FIX: the synthetic Admin row now matches the SAME shape every other
  // user object has (roleId as a number, not a `role` string field;
  // employeeId, department, joinDate, lastLogin, status present) so
  // UserTable/UserDetailDrawer/UserFormPage don't need special-casing
  // for missing fields.
  const adminRow = useMemo(
    () => ({
      id: ADMIN_SYNTHETIC_ID,
      employeeId: "EMP-ADMIN",
      fullName: adminUser?.name || "Admin User",
      email: adminUser?.email || "",
      phone: adminUser?.phone || "",
      avatar: adminUser?.avatar || null,
      roleId: adminRoleId,
      department: "Management",
      status: "active",
      joinDate: null,
      lastLogin: null,
      isAdmin: true,
      isSynced: true,
    }),
    [adminUser, adminRoleId],
  );

  // FIX: this is now actually used everywhere `users` was being read for
  // display purposes — stats, filtering, table rows
  const allUsersForDisplay = useMemo(
    () => [adminRow, ...users],
    [adminRow, users],
  );

  useEffect(() => {
    const openId = location.state?.openRecordId;
    if (openId) {
      const user = allUsersForDisplay.find((u) => u.id === openId);
      if (user) openView(user);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, allUsersForDisplay]);

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
      const saved = localStorage.getItem("apex-driveos-user-cols");
      return saved ? JSON.parse(saved) : DEFAULT_USER_COLUMNS;
    } catch {
      return DEFAULT_USER_COLUMNS;
    }
  });

  // FIX: only persist the REGULAR users array (never the synthetic admin
  // row — that one is always derived fresh from useAppStore.user and
  // must never be written back to apex-driveos-users)
  useEffect(() => {
    localStorage.setItem("apex-driveos-users", JSON.stringify(users));
    window.dispatchEvent(
      new CustomEvent("apex-driveos-users-updated", { detail: { users } }),
    );
  }, [users]);

  useEffect(() => {
    localStorage.setItem("apex-driveos-user-cols", JSON.stringify(columns));
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

  // FIX: stats now computed from allUsersForDisplay (includes Admin),
  // matching the brief's requirement that the Admin show up correctly
  // in the Users module, just non-editable
  const stats = useMemo(
    () => ({
      total: allUsersForDisplay.length,
      active: allUsersForDisplay.filter((u) => u.status === "active").length,
      invited: allUsersForDisplay.filter((u) => u.status === "invited").length,
      suspended: allUsersForDisplay.filter((u) => u.status === "suspended")
        .length,
      inactive: allUsersForDisplay.filter((u) => u.status === "inactive")
        .length,
    }),
    [allUsersForDisplay],
  );

  // FIX: filtering/sorting now operates on allUsersForDisplay, not the
  // raw regular-users-only `users` state
  const filtered = useMemo(() => {
    let data = [...allUsersForDisplay];
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
  }, [allUsersForDisplay, search, activeFilters, sortField, sortDir]);

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
    // FIX: prevent the synthetic admin row from ever being selectable
    // for bulk actions (it has no real backing record to bulk-edit/delete)
    if (id === ADMIN_SYNTHETIC_ID) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    (checked) => {
      const selectableIds = pageData
        .filter((u) => u.id !== ADMIN_SYNTHETIC_ID)
        .map((u) => u.id);
      setSelected(checked ? new Set(selectableIds) : new Set());
    },
    [pageData],
  );

  const handleSave = useCallback((data) => {
    // Guard: the Admin row should never reach this handler since the
    // table/drawer disable editing for it, but defense-in-depth:
    if (data.id === ADMIN_SYNTHETIC_ID) {
      apexToast.info(
        "Managed in Settings",
        "Admin profile is edited from Settings → Profile.",
      );
      return;
    }
    setUsers((prev) => {
      const exists = prev.find((u) => u.id === data.id);
      if (exists) {
        activity.userUpdated(data);
        return prev.map((u) => (u.id === data.id ? data : u));
      }
      const newUser = { ...data, id: Date.now() };
      activity.userAdded(newUser);
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

  const handleDelete = useCallback((user) => {
    if (user.id === ADMIN_SYNTHETIC_ID || user.isAdmin) {
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
  }, []);

  const handleBulkDelete = useCallback(() => {
    const idsToDelete = new Set(selected);
    idsToDelete.delete(ADMIN_SYNTHETIC_ID); // safety net, shouldn't be possible to select anyway
    const count = idsToDelete.size;
    setUsers((prev) => prev.filter((u) => !idsToDelete.has(u.id)));
    setSelected(new Set());
    setDeleteBulk(false);
    apexToast.info(
      "Bulk Delete",
      `${count} user${count > 1 ? "s" : ""} removed.`,
    );
  }, [selected]);

  const handleStatusChange = useCallback(
    (newStatus) => {
      if (!newStatus) return;
      const count = selected.size;
      setUsers((prev) =>
        prev.map((u) => {
          if (!selected.has(u.id)) return u;
          activity.userStatusChanged(u, u.status, newStatus);
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
      const exportData = filtered.map((u) => ({
        ...u,
        user: u.fullName,
        role:
          roles.find((r) => r.id === Number(u.roleId))?.name || "Unassigned",
        joined: u.joinDate,
      }));

      if (type === "Excel") {
        exportToExcel(exportData, exportCols, "apex-driveos-users");
        apexToast.success(
          "Excel Exported",
          `${filtered.length} users exported.`,
        );
      } else {
        exportToPDF(
          exportData,
          exportCols,
          "User Directory",
          "apex-driveos-users",
        );
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

  const openEditForm = useCallback(
    (user) => {
      if (user.id === ADMIN_SYNTHETIC_ID || user.isAdmin) {
        navigate("/settings");
        return;
      }
      setEditUser(user);
      setViewUser(null);
      setFormOpen(true);
    },
    [navigate],
  );

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
