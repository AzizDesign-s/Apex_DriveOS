// src/components/users/UserTable.jsx
// Same architecture as CustomerTable.jsx — columns prop, ColumnManager-driven, same pagination

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Eye,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Crown,
  Lock,
} from "lucide-react";
import { EmptyState, Button } from "../ui";
import { AVATAR_PALETTE } from "../../data/mockData";
import clsx from "clsx";

const COL_WIDTH = {
  user: "290px",
  role: "160px",
  department: "130px",
  status: "120px",
  lastLogin: "130px",
  joined: "120px",
};

const STATUS_STYLE = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  invited: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  suspended: "text-amber-400   bg-amber-400/10   border-amber-400/20",
  inactive: "text-text-subtle bg-text-subtle/10 border-border",
};

function Avatar({ name, avatar, index }) {
  const { bg, text } = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (avatar) {
    return (
      <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 tracking-wide"
      style={{ background: bg, color: text }}
    >
      {initials}
    </div>
  );
}

function SortIcon({ active, dir }) {
  if (!active)
    return <span className="ml-1 text-text-subtle/25 text-[10px]">↕</span>;
  return dir === "asc" ? (
    <ChevronUp size={11} className="ml-0.5 text-gold inline" />
  ) : (
    <ChevronDown size={11} className="ml-0.5 text-gold inline" />
  );
}

function Pagination({ page, totalPages, total, perPage, onPage }) {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-shrink-0">
      <p className="text-[10px] text-text-subtle">
        {total === 0
          ? "No users found"
          : `Showing ${start}–${end} of ${total} users`}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted
                     hover:text-gold hover:border-gold/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          aria-label="Previous page"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`e${i}`}
              className="w-7 h-7 flex items-center justify-center text-text-subtle text-xs"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              aria-current={page === p ? "page" : undefined}
              className={clsx(
                "w-7 h-7 rounded-lg border text-[11px] font-semibold transition-all",
                page === p
                  ? "border-gold/40 text-gold bg-gold/8"
                  : "border-border text-text-muted hover:border-gold/30 hover:text-gold",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted
                     hover:text-gold hover:border-gold/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function lastLoginLabel(ts) {
  if (!ts) return "Never";
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function UserTable({
  data = [],
  columns = [],
  total = 0,
  page = 1,
  onPage,
  perPage = 10,
  selected,
  onToggleSelect,
  onSelectAll,
  sortField,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete,
  onClearFilters,
  roles = [],
}) {
  const visibleCols = columns.filter((c) => c.visible);
  const allSelected = data.length > 0 && data.every((u) => selected.has(u.id));
  const totalPages = Math.ceil(total / perPage);
  const getRole = (roleId) => roles.find((r) => r.id === Number(roleId));

  const navigate = useNavigate();

  // Helper to identify if a user is the system Admin
  const isAdminUser = (user) => user.isAdmin === true;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-auto scrollbar-none">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed", minWidth: "760px" }}
        >
          <colgroup>
            <col style={{ width: "50px" }} />
            {visibleCols.map((col) => (
              <col key={col.id} style={{ width: COL_WIDTH[col.id] }} />
            ))}
            <col style={{ width: "140px" }} />
          </colgroup>

          <thead>
            <tr className="bg-[rgba(212,175,55,0.02)] border-b border-border">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="appearance-none w-3.5 h-3.5 rounded border border-border bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-3 text-left text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase
                             whitespace-nowrap select-none cursor-pointer hover:text-text-muted"
                  onClick={() => onSort(col.id)}
                >
                  {col.label}
                  <SortIcon active={sortField === col.id} dir={sortDir} />
                </th>
              ))}
              <th className="px-4 py-3 text-right text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 2}>
                  <EmptyState
                    icon={Users}
                    title="No users found"
                    subtitle="Try adjusting your search or filters"
                    action={
                      onClearFilters && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={onClearFilters}
                        >
                          Clear Filters
                        </Button>
                      )
                    }
                  />
                </td>
              </tr>
            ) : (
              data.map((user, i) => {
                const role = getRole(user.roleId);
                return (
                  <motion.tr
                    key={user.id}
                    className={clsx(
                      "border-b border-border last:border-0 cursor-pointer hover:bg-gold/[0.02] transition-colors",
                      selected.has(user.id) && "bg-gold/[0.04]",
                    )}
                    style={
                      selected.has(user.id)
                        ? { borderLeft: "2px solid #D4AF37" }
                        : {}
                    }
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onView(user)}
                  >
                    <td
                      className="px-4 py-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="appearance-none w-3.5 h-3.5 rounded border border-border bg-base cursor-pointer checked:bg-gold checked:border-gold transition-colors"
                        checked={selected.has(user.id)}
                        onChange={() => onToggleSelect(user.id)}
                        aria-label={`Select ${user.fullName}`}
                      />
                    </td>

                    {visibleCols.map((col) => (
                      <td key={col.id} className="px-4 py-3 align-middle">
                        {col.id === "user" && (
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={user.fullName}
                              avatar={user.avatar}
                              index={i}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-text-primary leading-tight truncate">
                                  {user.fullName}
                                </p>
                                {role?.name === "Admin" && (
                                  <Crown
                                    size={11}
                                    className="text-gold flex-shrink-0"
                                  />
                                )}
                              </div>
                              <p className="text-[10px] text-text-subtle mt-1.5 truncate">
                                {user.employeeId} · {user.email}
                              </p>
                            </div>
                          </div>
                        )}
                        {col.id === "role" && (
                          <span className="text-xs font-semibold text-text-muted">
                            {role?.name || "Unassigned"}
                          </span>
                        )}
                        {col.id === "department" && (
                          <span className="text-xs text-text-muted">
                            {user.department || "—"}
                          </span>
                        )}
                        {col.id === "status" && (
                          <span
                            className={clsx(
                              "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ",
                              STATUS_STYLE[user.status],
                            )}
                          >
                            {user.status}
                          </span>
                        )}
                        {col.id === "lastLogin" && (
                          <span className="text-xs text-text-subtle">
                            {lastLoginLabel(user.lastLogin)}
                          </span>
                        )}
                        {col.id === "joined" && (
                          <span className="text-xs text-text-subtle">
                            {user.joinDate
                              ? new Date(user.joinDate).toLocaleDateString(
                                  "en-AE",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </span>
                        )}
                      </td>
                    ))}

                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isAdminUser(user) ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className="flex items-center gap-1 text-[10px] text-text-subtle px-2 py-1
                   rounded-lg border border-border bg-base"
                            title="Admin identity is managed in Settings"
                          >
                            <Lock size={10} /> Settings-managed
                          </span>
                          <button
                            onClick={() => navigate("/settings")}
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-sky-accent hover:border-sky-accent/40
                                   hover:bg-sky-accent/8 transition-all"
                            title="Edit in Settings"
                            aria-label="Edit Admin profile in Settings"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-sky-accent hover:border-sky-accent/40
                                   hover:bg-sky-accent/8 transition-all"
                            onClick={() =>
                              onView(user)
                            } /* ...existing View button... */
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-gold hover:border-gold/40
                                   hover:bg-gold/8 transition-all"
                            onClick={() =>
                              onEdit(user)
                            } /* ...existing Edit button... */
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                                   text-text-subtle hover:text-rose-400 hover:border-rose-400/40
                                   hover:bg-rose-400/8 transition-all"
                            onClick={() =>
                              onDelete(user)
                            } /* ...existing Delete button... */
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        onPage={onPage}
      />
    </div>
  );
}

export default UserTable;
