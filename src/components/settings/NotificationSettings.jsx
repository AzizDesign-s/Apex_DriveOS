// src/components/settings/NotificationSettings.jsx

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "../ui";
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

// Toggle switch component
function Toggle({ enabled, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-xs font-semibold text-text-primary">{label}</p>
        {desc && <p className="text-[10px] text-text-subtle mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        aria-checked={enabled}
        role="switch"
        aria-label={label}
        className={clsx(
          "relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ml-4",
          enabled ? "bg-gold" : "bg-border",
        )}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ left: enabled ? "24px" : "4px" }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
      </button>
    </div>
  );
}

const DEFAULT_NOTIF_SETTINGS = {
  // In-app
  testDriveInApp: true,
  invoiceInApp: true,
  inventoryInApp: true,
  customerInApp: true,
  systemInApp: false,
  // Email — future
  testDriveEmail: false,
  invoiceEmail: true,
  inventoryEmail: false,
  customerEmail: false,
  // Push — future
  testDrivePush: false,
  invoicePush: false,
};

function NotificationSettings() {
  const [settings, setSettings] = useState(DEFAULT_NOTIF_SETTINGS);

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const handleSave = () => {
    apexToast.success(
      "Notifications Saved",
      "Your notification preferences have been saved.",
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* In-app notifications */}
      <SectionCard
        title="In-App Notifications"
        desc="Control which alerts appear in your notification center"
      >
        <Toggle
          enabled={settings.testDriveInApp}
          onChange={(v) => set("testDriveInApp", v)}
          label="Test Drive Alerts"
          desc="Bookings created, approved, rejected, completed"
        />
        <Toggle
          enabled={settings.invoiceInApp}
          onChange={(v) => set("invoiceInApp", v)}
          label="Invoice Alerts"
          desc="Overdue invoices, new invoices, partial payments"
        />
        <Toggle
          enabled={settings.inventoryInApp}
          onChange={(v) => set("inventoryInApp", v)}
          label="Inventory Alerts"
          desc="Low stock, status changes, new cars added"
        />
        <Toggle
          enabled={settings.customerInApp}
          onChange={(v) => set("customerInApp", v)}
          label="Customer Alerts"
          desc="New customers registered, status changes"
        />
        <Toggle
          enabled={settings.systemInApp}
          onChange={(v) => set("systemInApp", v)}
          label="System Alerts"
          desc="Backups, maintenance, system events"
        />
      </SectionCard>

      {/* Email notifications — future */}
      <SectionCard
        title="Email Notifications"
        desc="Receive email alerts for critical events — backend integration required"
      >
        <div
          className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-amber-400/[0.06]
                        border border-amber-400/15 rounded-xl"
        >
          <span className="text-amber-400 text-xs">⚠</span>
          <p className="text-[10px] text-amber-400/80">
            Email sending requires backend integration. Configure SMTP in a
            future sprint.
          </p>
        </div>
        <div className="opacity-60 pointer-events-none">
          <Toggle
            enabled={settings.testDriveEmail}
            onChange={(v) => set("testDriveEmail", v)}
            label="Test Drive Emails"
            desc="Send email when test drive is booked or updated"
          />
          <Toggle
            enabled={settings.invoiceEmail}
            onChange={(v) => set("invoiceEmail", v)}
            label="Invoice Emails"
            desc="Email customer when invoice is created or overdue"
          />
          <Toggle
            enabled={settings.inventoryEmail}
            onChange={(v) => set("inventoryEmail", v)}
            label="Inventory Emails"
            desc="Alert admin when stock falls below threshold"
          />
          <Toggle
            enabled={settings.customerEmail}
            onChange={(v) => set("customerEmail", v)}
            label="Customer Emails"
            desc="Welcome email when new customer is registered"
          />
        </div>
      </SectionCard>

      {/* Push — future */}
      <SectionCard
        title="Push Notifications"
        desc="Browser push notifications — future sprint"
      >
        <div
          className="flex items-center gap-2 px-3 py-2.5 bg-text-subtle/[0.04]
                        border border-border rounded-xl mb-2"
        >
          <p className="text-[10px] text-text-subtle">
            Browser push notifications will be available when WebSocket
            integration is implemented in a future sprint.
          </p>
        </div>
        <div className="opacity-40 pointer-events-none">
          <Toggle
            enabled={settings.testDrivePush}
            onChange={(v) => set("testDrivePush", v)}
            label="Test Drive Push"
            desc="Instant push for pending bookings"
          />
          <Toggle
            enabled={settings.invoicePush}
            onChange={(v) => set("invoicePush", v)}
            label="Invoice Push"
            desc="Instant push for overdue invoices"
          />
        </div>
      </SectionCard>

      <Button variant="primary" size="sm" icon={Check} onClick={handleSave}>
        Save Notification Preferences
      </Button>
    </motion.div>
  );
}

export default NotificationSettings;
