// src/components/settings/UserManagement.jsx
// Bug 1 fixes:
//   1. Storage key was "apex-driveos-roles" on read but "apex-driveos-roles" on write
//      — unified to "apex-driveos-roles" everywhere to match the rest of the app
//   2. computeUserCounts now also adds 1 for the synthetic Admin row, whose
//      identity lives in useAppStore (not in apex-driveos-users localStorage),
//      so the Admin role card correctly shows its count

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users as UsersIcon } from "lucide-react";
import useAppStore from "../../store/useAppStore";
import {
  roles as initialRoles,
  PERMISSION_MODULES,
  generateRoleId,
} from "../../data/mockData";
import RoleCard from "../roles/RoleCard";
import RoleFormDrawer from "../roles/RoleFormDrawer";
import RoleDeleteConfirm from "../roles/RoleDeleteConfirm";
import { Button } from "../ui";
import apexToast from "../../utils/toast";

function UserManagement() {
  const navigate = useNavigate();
  const adminUser = useAppStore((s) => s.user);

  // BUG-1 FIX: unified storage key — was reading from "apex-driveos-roles"
  // but writing to "apex-driveos-roles", so reads always fell back to the seed
  const [roles, setRoles] = useState(() => {
    try {
      const saved = localStorage.getItem("apex-driveos-roles");
      return saved ? JSON.parse(saved) : initialRoles;
    } catch {
      return initialRoles;
    }
  });

  useEffect(() => {
    localStorage.setItem("apex-driveos-roles", JSON.stringify(roles));
    window.dispatchEvent(
      new CustomEvent("apex-driveos-roles-updated", { detail: { roles } }),
    );
  }, [roles]);

  const [userCounts, setUserCounts] = useState({});
  const [totalUsers, setTotalUsers] = useState(0);

  // BUG-1 FIX: synthetic Admin row is NOT stored in apex-driveos-users —
  // it lives in useAppStore. We must add it back manually when computing
  // counts so the Admin role card shows 1 (or more, future-proof) instead of 0.
  const computeUserCounts = useCallback(() => {
    try {
      const saved = localStorage.getItem("apex-driveos-users");
      const regularUsers = saved ? JSON.parse(saved) : [];
      const counts = {};

      // Count regular users by their roleId
      regularUsers.forEach((u) => {
        counts[u.roleId] = (counts[u.roleId] || 0) + 1;
      });

      // BUG-1 FIX: also count the synthetic Admin whose roleId comes from
      // the live roles list (whichever role is named "Admin")
      if (adminUser) {
        const adminRole = roles.find((r) => r.name === "Admin");
        if (adminRole) {
          counts[adminRole.id] = (counts[adminRole.id] || 0) + 1;
        }
      }

      setUserCounts(counts);
      setTotalUsers(regularUsers.length + (adminUser ? 1 : 0));
    } catch {
      setUserCounts({});
      setTotalUsers(0);
    }
  }, [roles, adminUser]);

  useEffect(() => {
    computeUserCounts();
    window.addEventListener("apex-driveos-users-updated", computeUserCounts);
    return () =>
      window.removeEventListener(
        "apex-driveos-users-updated",
        computeUserCounts,
      );
  }, [computeUserCounts]);

  const [formOpen, setFormOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getPermissionSummary = useCallback((role) => {
    let granted = 0,
      total = 0;
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
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="flex items-center justify-between bg-gold/[0.04] border border-gold/15 rounded-2xl px-4 py-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
            <UsersIcon size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-text-primary">
              {totalUsers} user{totalUsers !== 1 ? "s" : ""} across{" "}
              {roles.length} role{roles.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[10px] text-text-subtle mt-0.5">
              Manage individual team members in the Users module
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>
          Go to Users →
        </Button>
      </div>

      <div className="bg-base border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase">
              Roles & Permissions
            </p>
            <p className="text-[10px] text-text-subtle mt-1">
              Define what each role can see and do across the platform
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setEditRole(null);
              setFormOpen(true);
            }}
          >
            Create Role
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </motion.div>
  );
}

export default UserManagement;
