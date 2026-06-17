// src/pages/Settings.jsx
// Left sidebar nav + right panel layout

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DesktopSidebar,
  MobileSettingsNav,
} from "../components/settings/SettingsSidebar";
import ProfileSettings from "../components/settings/ProfileSettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import CompanySettings from "../components/settings/CompanySettings";
import InvoiceSettings from "../components/settings/InvoiceSettings";
import UserManagement from "../components/settings/UserManagement";

// Map section id → component
const SECTION_MAP = {
  profile: ProfileSettings,
  appearance: AppearanceSettings,
  notifications: NotificationSettings,
  company: CompanySettings,
  invoice: InvoiceSettings,
  users: UserManagement,
};

function Settings() {
  const [activeSection, setActiveSection] = useState("profile");

  const ActivePanel = SECTION_MAP[activeSection] || ProfileSettings;

  return (
    <div className="flex flex-col h-full min-h-0  gap-3 lg:flex-row lg:gap-4 lg:pb-3 pb-48">
      {/* ── Left sidebar ── */}
      <MobileSettingsNav active={activeSection} onChange={setActiveSection} />

      <DesktopSidebar active={activeSection} onChange={setActiveSection} />

      {/* ── Right content panel ── */}
      <div className="flex-1 overflow-y-auto scrollbar-none min-w-0 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <ActivePanel />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Settings;
