// src/pages/Settings.jsx
// Left sidebar nav + right panel layout

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SettingsSidebar from "../components/settings/SettingsSidebar";
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
    <div className="flex gap-4 h-full min-h-0 pb-3">
      {/* ── Left sidebar ── */}
      <SettingsSidebar active={activeSection} onChange={setActiveSection} />

      {/* ── Right content panel ── */}
      <div className="flex-1 overflow-y-auto scrollbar-none min-w-0">
        <AnimatePresence mode="wait">
          <ActivePanel key={activeSection} />
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Settings;
