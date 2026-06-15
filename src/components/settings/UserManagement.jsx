// src/components/settings/UserManagement.jsx
// Sprint 1 — static role display with future auth integration planned.

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Check,
  Shield,
  Eye,
  Edit,
  Trash2,
  Crown,
  User,
} from "lucide-react";
import { Button, Badge } from "../ui";
import { AVATAR_PALETTE } from "../../data/mockData";
import apexToast from "../../utils/toast";
import clsx from "clsx";

function SectionCard({ title, desc, children }) {
  return (
    <div className="bg-base border border-border rounded-2xl p-5 mb-4">
      <div className="mb-4 pb-3 border-b border-border">
        <p className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase">
          {title}
        </p>
        {desc && <p className="text-[10px] text-text-subtle mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// Mock team members
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@apexgt.ae",
    role: "super_admin",
    status: "active",
    lastActive: "Now",
  },
  {
    id: 2,
    name: "Ahmed Al-Sayed",
    email: "ahmed.s@apexgt.ae",
    role: "sales_exec",
    status: "active",
    lastActive: "2h ago",
  },
  {
    id: 3,
    name: "Fatima Hassan",
    email: "fatima.h@apexgt.ae",
    role: "sales_exec",
    status: "active",
    lastActive: "1d ago",
  },
  {
    id: 4,
    name: "Omar Khalid",
    email: "omar.k@apexgt.ae",
    role: "sales_exec",
    status: "inactive",
    lastActive: "3d ago",
  },
  {
    id: 5,
    name: "Sara Mohammed",
    email: "sara.m@apexgt.ae",
    role: "viewer",
    status: "active",
    lastActive: "5h ago",
  },
];

const ROLE_CONFIG = {
  super_admin: {
    label: "Super Admin",
    icon: Crown,
    color: "text-gold",
    bg: "bg-gold/10",
    desc: "Full access to all modules and settings",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-sky-accent",
    bg: "bg-sky-accent/10",
    desc: "Manage inventory, customers, invoices, test drives",
  },
  sales_exec: {
    label: "Sales Executive",
    icon: User,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    desc: "View and update assigned customers and bookings",
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "text-text-subtle",
    bg: "bg-text-subtle/10",
    desc: "Read-only access to dashboard and reports",
  },
};

// Permission matrix for display
const PERMISSIONS = [
  {
    module: "Dashboard",
    super_admin: true,
    admin: true,
    sales_exec: true,
    viewer: true,
  },
  {
    module: "Inventory",
    super_admin: true,
    admin: true,
    sales_exec: false,
    viewer: true,
  },
  {
    module: "Customers",
    super_admin: true,
    admin: true,
    sales_exec: true,
    viewer: true,
  },
  {
    module: "Test Drives",
    super_admin: true,
    admin: true,
    sales_exec: true,
    viewer: true,
  },
  {
    module: "Invoices",
    super_admin: true,
    admin: true,
    sales_exec: false,
    viewer: true,
  },
  {
    module: "Analytics",
    super_admin: true,
    admin: true,
    sales_exec: false,
    viewer: true,
  },
  {
    module: "Notifications",
    super_admin: true,
    admin: true,
    sales_exec: true,
    viewer: false,
  },
  {
    module: "Settings",
    super_admin: true,
    admin: false,
    sales_exec: false,
    viewer: false,
  },
];

function Avatar({ name, index }) {
  const { bg, text } = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center
                 text-xs font-bold flex-shrink-0"
      style={{ background: bg, color: text }}
    >
      {initials}
    </div>
  );
}

function UserManagement() {
  const [members, setMembers] = useState(TEAM_MEMBERS);

  const handleRemove = (id) => {
    if (id === 1) {
      apexToast.error(
        "Cannot Remove",
        "Super Admin account cannot be removed.",
      );
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    apexToast.info("User Removed", "Team member has been removed.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* Future note */}
      <div
        className="flex items-start gap-3 px-4 py-3 mb-4
                      bg-sky-accent/[0.05] border border-sky-accent/15 rounded-2xl"
      >
        <span className="text-sky-accent text-sm mt-0.5">ℹ</span>
        <div>
          <p className="text-xs font-semibold text-sky-accent">
            Auth Integration Required
          </p>
          <p className="text-[10px] text-sky-accent/70 mt-0.5 leading-relaxed">
            User creation, password management and role enforcement require
            backend authentication (JWT / Supabase Auth) planned for a future
            sprint. Current display is for UI planning only.
          </p>
        </div>
      </div>

      {/* Team members */}
      <SectionCard
        title="Team Members"
        desc={`${members.length} users in your workspace`}
      >
        <div className="space-y-2 mb-4">
          {members.map((member, i) => {
            const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.viewer;
            const RoleIcon = roleCfg.icon;
            return (
              <motion.div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3 bg-card border border-border
                           rounded-xl hover:border-gold/15 transition-colors"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Avatar name={member.name} index={i} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {member.name}
                    </p>
                    <span
                      className={clsx(
                        "text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1",
                        roleCfg.bg,
                        roleCfg.color,
                      )}
                    >
                      <RoleIcon size={8} />
                      {roleCfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-subtle mt-0.5">
                    {member.email} · Last active {member.lastActive}
                  </p>
                </div>

                {/* Status dot */}
                <div
                  className={clsx(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    member.status === "active"
                      ? "bg-emerald-400"
                      : "bg-text-subtle/40",
                  )}
                />

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                               text-text-subtle hover:text-gold hover:border-gold/40
                               hover:bg-gold/8 transition-all"
                    title="Edit user"
                    aria-label={`Edit ${member.name}`}
                    onClick={() =>
                      apexToast.info(
                        "Coming Soon",
                        "User editing requires backend auth.",
                      )
                    }
                  >
                    <Edit size={12} />
                  </button>
                  {member.id !== 1 && (
                    <button
                      className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                 text-text-subtle hover:text-rose-400 hover:border-rose-400/40
                                 hover:bg-rose-400/8 transition-all"
                      title="Remove user"
                      aria-label={`Remove ${member.name}`}
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={UserPlus}
          onClick={() =>
            apexToast.info("Coming Soon", "Invite users requires backend auth.")
          }
        >
          Invite Team Member
        </Button>
      </SectionCard>

      {/* Role descriptions */}
      <SectionCard
        title="Roles & Access Levels"
        desc="Planned permission structure for backend implementation"
      >
        <div className="grid grid-cols-2 gap-3 mb-5">
          {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
            const RoleIcon = cfg.icon;
            return (
              <div
                key={key}
                className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl"
              >
                <div
                  className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                    cfg.bg,
                    cfg.color,
                  )}
                >
                  <RoleIcon size={15} />
                </div>
                <div>
                  <p className={clsx("text-xs font-bold", cfg.color)}>
                    {cfg.label}
                  </p>
                  <p className="text-[10px] text-text-subtle mt-0.5 leading-relaxed">
                    {cfg.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Permission matrix */}
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-3">
          Permission Matrix
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]" style={{ minWidth: "380px" }}>
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-text-subtle font-bold pr-4">
                  Module
                </th>
                {Object.values(ROLE_CONFIG).map((r) => (
                  <th
                    key={r.label}
                    className="text-center py-2 text-text-subtle font-bold px-2"
                  >
                    {r.label.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr
                  key={p.module}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-4 text-text-muted pr-4 font-medium">
                    {p.module}
                  </td>
                  {["super_admin", "admin", "sales_exec", "viewer"].map(
                    (role) => (
                      <td key={role} className="py-2.5 text-center px-2">
                        {p[role] ? (
                          <span className="text-emerald-400">✓</span>
                        ) : (
                          <span className="text-text-subtle/30">—</span>
                        )}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </motion.div>
  );
}

export default UserManagement;
