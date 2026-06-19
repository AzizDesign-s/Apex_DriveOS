// src/pages/Roles.jsx
//
// Phase-1-style: local useState seeded from mockData.js, persisted to
// localStorage, cross-module sync via CustomEvent — matching Inventory/
// Customers/TestDrives/Invoices pattern exactly. No Zustand for domain data.

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Shield } from "lucide-react";
import {
  roles as initialRoles,
  PERMISSION_MODULES,
  generateRoleId,
} from "../data/mockData";
import RoleCard from "../components/roles/RoleCard";
import RoleFormDrawer from "../components/roles/RoleFormDrawer";
import RoleDeleteConfirm from "../components/roles/RoleDeleteConfirm";
import { Button } from "../components/ui";
import apexToast from "../utils/toast";

function Roles() {
  // ── Data — load from localStorage, fall back to seed ──────────────────────
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-gt-roles");
      return saved ? JSON.parse(saved) : initialRoles;
    } catch {
      return initialRoles;
    }
  });

  // ── Persist + notify on every change ───────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("apex-gt-roles", JSON.stringify(roles));
    window.dispatchEvent(
      new CustomEvent("apex-gt-roles-updated", {
        detail: { roles },
      }),
    );
  }, [roles]);

  // ── Listen for user count changes (Users module dispatches this) ──────────
  const [userCounts, setUserCounts] = useState({});

  const computeUserCounts = useCallback(() => {
    try {
      const saved = localStorage.getItem("apex-gt-users");
      const users = saved ? JSON.parse(saved) : [];
      const counts = {};
      users.forEach((u) => {
        counts[u.roleId] = (counts[u.roleId] || 0) + 1;
      });
      setUserCounts(counts);
    } catch {
      setUserCounts({});
    }
  }, []);

  useEffect(() => {
    computeUserCounts();
    window.addEventListener("apex-gt-users-updated", computeUserCounts);
    return () =>
      window.removeEventListener("apex-gt-users-updated", computeUserCounts);
  }, [computeUserCounts]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Permission summary per role ─────────────────────────────────────────────
  const getPermissionSummary = useCallback((role) => {
    let granted = 0;
    let total = 0;
    PERMISSION_MODULES.forEach((m) => {
      if (m.disabled) return;
      const p = role.permissions[m.id];
      const keys = m.viewOnly ? ["view"] : ["view", "create", "edit", "delete"];
      keys.forEach((k) => {
        total += 1;
        if (p?.[k]) granted += 1;
      });
    });
    return { granted, total };
  }, []);

  const summaries = useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      map[r.id] = getPermissionSummary(r);
    });
    return map;
  }, [roles, getPermissionSummary]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = (data) => {
    if (data.id) {
      setRoles((prev) =>
        prev.map((r) => (r.id === data.id ? { ...r, ...data } : r)),
      );
      apexToast.success("Role Updated", `${data.name} permissions saved.`);
    } else {
      const newRole = {
        ...data,
        id: generateRoleId(roles),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setRoles((prev) => [...prev, newRole]);
      apexToast.success("Role Created", `${newRole.name} is ready to assign.`);
    }
    setFormOpen(false);
    setEditRole(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget.isSystemRole) return;
    setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    apexToast.info("Role Deleted", `${deleteTarget.name} removed.`);
    setDeleteTarget(null);
  };

  const handleDuplicate = (role) => {
    const copy = {
      id: generateRoleId(roles),
      name: `${role.name} (Copy)`,
      description: role.description,
      isSystemRole: false,
      permissions: JSON.parse(JSON.stringify(role.permissions)),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRoles((prev) => [...prev, copy]);
    apexToast.success(
      "Role Duplicated",
      `${copy.name} created — edit to customize.`,
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-extrabold text-text-primary">
            Roles & Permissions
          </h1>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            {roles.length} roles · {roles.filter((r) => r.isSystemRole).length}{" "}
            system defaults
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditRole(null);
            setFormOpen(true);
          }}
        >
          Create Role
        </Button>
      </div>

      <motion.div
        className="flex items-start gap-2 bg-sky-accent/[0.05] border border-sky-accent/15
                   rounded-2xl px-4 py-3 flex-shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Shield size={14} className="text-sky-accent flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-sky-accent/80 leading-relaxed">
          Roles define what each team member can see and do. Assign roles to
          staff in the Users module. System roles can be customized but not
          removed.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role, i) => (
          <RoleCard
            key={role.id}
            role={role}
            userCount={userCounts[role.id] || 0}
            summary={summaries[role.id]}
            onEdit={(r) => {
              setEditRole(r);
              setFormOpen(true);
            }}
            onDuplicate={handleDuplicate}
            onDelete={setDeleteTarget}
            index={i}
          />
        ))}
      </div>

      <RoleFormDrawer
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditRole(null);
        }}
        onSave={handleSave}
        editRole={editRole}
      />

      <RoleDeleteConfirm
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        role={deleteTarget}
        assignedUserCount={deleteTarget ? userCounts[deleteTarget.id] || 0 : 0}
      />
    </div>
  );
}

export default Roles;
