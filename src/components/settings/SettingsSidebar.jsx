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
    desc: "Name, email, password, avatar",
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
    desc: "Showroom, logo, address, TRN",
  },
  {
    id: "invoice",
    label: "Invoice Settings",
    icon: FileText,
    desc: "VAT, currency, template, footer",
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    desc: "Roles, permissions, team",
  },
];

function SettingsSidebar({ active, onChange }) {
  return (
    <motion.div
      className="w-56 flex-shrink-0 bg-card border border-border rounded-2xl
                 overflow-hidden flex flex-col"
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
              transition={{ delay: i * 0.05 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-2 bottom-2 w-0.5 bg-gold rounded-full"
                  layoutId="settings-active-bar"
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

              {/* Text */}
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

      {/* Version footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[9px] text-text-subtle">APEX GT Dashboard</p>
        <p className="text-[9px] text-text-subtle/50 mt-0.5">
          Sprint 1 · v1.0.0
        </p>
      </div>
    </motion.div>
  );
}

export default SettingsSidebar;
