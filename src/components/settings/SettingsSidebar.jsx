// src/components/settings/SettingsSidebar.jsx
// Left nav — click section to show that panel

import { motion } from "framer-motion";
import {
  User,
  Palette,
  Bell,
  Building2,
  FileText,
  Users,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

export const SETTINGS_SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    desc: "Name, email, password",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    desc: "Theme, language, density",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    desc: "Alerts, email, push toggles",
  },
  {
    id: "company",
    label: "Company Info",
    icon: Building2,
    desc: "Showroom, logo, TRN",
  },
  {
    id: "invoice",
    label: "Invoice Settings",
    icon: FileText,
    desc: "VAT, currency, template",
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    desc: "Roles, permissions, team",
  },
];

// ── Desktop sidebar ───────────────────────────────────────────────────────────
export function DesktopSidebar({ active, onChange }) {
  return (
    <motion.div
      className="w-56 flex-shrink-0 bg-card border border-border rounded-2xl
                 overflow-hidden flex-col hidden lg:flex"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-[9px] font-bold tracking-[0.25em] text-text-subtle uppercase">
          Settings
        </p>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-2">
        {SETTINGS_SECTIONS.map((s, i) => {
          const isActive = active === s.id;
          return (
            <motion.button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 text-left",
                "transition-all relative group",
                isActive
                  ? "bg-gold/8 text-gold"
                  : "text-text-muted hover:bg-gold/[0.03] hover:text-text-primary",
              )}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {/* Active bar */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-2 bottom-2 w-0.5 bg-gold rounded-full"
                  layoutId="settings-sidebar-active-indicator"
                />
              )}

              {/* Icon */}
              <div
                className={clsx(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  isActive
                    ? "bg-gold/15 text-gold"
                    : "bg-base text-text-subtle group-hover:text-text-muted",
                )}
              >
                <s.icon size={15} />
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className={clsx(
                    "text-xs font-semibold leading-tight",
                    isActive ? "text-gold" : "text-text-muted",
                  )}
                >
                  {s.label}
                </p>
                <p className="text-[9px] text-text-subtle mt-0.5 truncate">
                  {s.desc}
                </p>
              </div>

              <ChevronRight
                size={12}
                className={clsx(
                  "flex-shrink-0 transition-transform",
                  isActive
                    ? "text-gold"
                    : "text-text-subtle/40 group-hover:text-text-subtle",
                )}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Version */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[9px] text-text-subtle">APEX GT Dashboard</p>
        <p className="text-[9px] text-text-subtle/50 mt-0.5">
          Sprint 1 · v1.0.0
        </p>
      </div>
    </motion.div>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────────
export function MobileSettingsNav({ active, onChange }) {
  return (
    <div className="lg:hidden flex-shrink-0 fixed z-50 left-1/2 -translate-x-1/2 bottom-6 w-full ">
      {/* Active section label */}
      <div className="px-4 py-3 bg-card border border-border">
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-0.5">
          Settings
        </p>
        <p className="text-sm font-extrabold text-text-primary">
          {SETTINGS_SECTIONS.find((s) => s.id === active)?.label || "Profile"}
        </p>
      </div>

      {/* Bottom tab bar */}
      <div className="bg-card border border-border  overflow-hidden">
        <div className="flex">
          {SETTINGS_SECTIONS.map((s, i) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onChange(s.id)}
                className={clsx(
                  "flex-1 flex flex-col  items-center gap-1 py-3 px-1",
                  "text-[9px] font-semibold transition-all relative",
                  isActive
                    ? "text-gold"
                    : "text-text-subtle hover:text-text-muted",
                )}
                aria-label={s.label}
                title={s.label}
              >
                {/* Active dot */}
                {isActive && (
                  <motion.div
                    className="absolute top-0 left-1/2  -translate-x-1/2
                               w-6 h-0.5 bg-gold rounded-full"
                    layoutId="settings-mobile-active-bar"
                  />
                )}

                {/* Icon */}
                <div
                  className={clsx(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                    isActive ? "bg-gold/15 text-gold" : "text-text-subtle",
                  )}
                >
                  <s.icon size={17} />
                </div>

                {/* Label — hidden on very small screens */}
                <span
                  className={clsx(
                    "hidden xs:block truncate max-w-[48px] text-center leading-tight",
                    isActive ? "text-gold" : "text-text-subtle",
                  )}
                >
                  {s.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Legacy default export for backward compatibility
function SettingsSidebar({ active, onChange }) {
  return (
    <>
      <DesktopSidebar active={active} onChange={onChange} />
      <MobileSettingsNav active={active} onChange={onChange} />
    </>
  );
}

export default SettingsSidebar;
