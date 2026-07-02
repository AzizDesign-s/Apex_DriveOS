// src/components/customers/CustomerDetailDrawer.jsx
// Phase 7: added Profile | Timeline tabs (underline style, matches
// the Notifications page tab pattern). All existing content moved
// into the Profile tab unchanged. Timeline tab is new.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Crown,
  Car,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  User,
  TrendingUp,
} from "lucide-react";
import { Badge, Button } from "../ui";
import { AVATAR_PALETTE } from "../../data/mockData";
import CustomerTimeline from "./CustomerTimeline";
import clsx from "clsx";

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, index, size = "lg" }) {
  const { bg, text } = AVATAR_PALETTE[index % AVATAR_PALETTE.length];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const dim = size === "lg" ? "w-14 h-14 text-base" : "w-9 h-9 text-xs";
  return (
    <div
      className={clsx(
        "rounded-2xl flex items-center justify-center font-bold flex-shrink-0",
        dim,
      )}
      style={{ background: bg, color: text }}
    >
      {initials}
    </div>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="bg-base border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={10} className="text-text-subtle" />}
        <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase">
          {label}
        </p>
      </div>
      <p className="text-xs font-semibold text-text-primary">{value || "—"}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p
      className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase
                  mb-3 pb-2 border-b border-border mt-5 first:mt-0"
    >
      {children}
    </p>
  );
}

function TimelineItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  sub,
  date,
  isLast,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon size={13} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border/50 min-h-[10px] my-1" />
        )}
      </div>
      <div
        className={clsx(
          "flex-1 min-w-0 flex items-start justify-between",
          !isLast && "pb-3",
        )}
      >
        <div>
          <p className="text-xs font-semibold text-text-primary leading-tight">
            {title}
          </p>
          <p className="text-[10px] text-text-subtle mt-0.5 leading-relaxed">
            {sub}
          </p>
        </div>
        <span className="text-[10px] text-text-subtle flex-shrink-0 ml-3 mt-0.5">
          {date}
        </span>
      </div>
    </div>
  );
}

function KpiPill({ label, value, color = "text-text-primary" }) {
  return (
    <div className="bg-base border border-border rounded-xl p-3 text-center">
      <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase mb-1.5">
        {label}
      </p>
      <p className={clsx("text-base font-extrabold", color)}>{value}</p>
    </div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "timeline", label: "Timeline", icon: TrendingUp },
];

function CustomerDetailDrawer({
  customer,
  isOpen,
  index = 0,
  onClose,
  onEdit,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState("profile");

  if (!customer) return null;

  const totalSpent =
    customer.purchases?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const formatDob = (dob) => {
    if (!dob) return "—";
    return new Date(dob).toLocaleDateString("en-AE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 bottom-0 lg:w-[400px] w-11/12 z-40
                       bg-card border-l border-border flex flex-col shadow-glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-start gap-4 px-2 py-4 border-b border-border flex-shrink-0">
              <Avatar name={customer.name} index={index} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-text-primary truncate">
                    {customer.name}
                  </h3>
                  {customer.status === "vip" && (
                    <Crown size={14} className="text-gold flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-text-subtle">
                    {customer.customerId}
                  </span>
                  <span className="text-text-subtle/40">·</span>
                  <Badge status={customer.status} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center
                           text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all"
                aria-label="Close drawer"
              >
                <X size={13} />
              </button>
            </div>

            {/* ── Tab switcher — underline style ── */}
            <div className="flex-shrink-0 border-b border-border px-2">
              <div className="flex gap-0">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        "flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold",
                        "border-b-2 transition-all duration-200",
                        isActive
                          ? "border-gold text-gold"
                          : "border-transparent text-text-subtle hover:text-text-muted",
                      )}
                    >
                      <tab.icon size={12} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-none">
              <AnimatePresence mode="wait">
                {/* ═══════════ TAB 1: PROFILE — unchanged content ═══════════ */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* KPI strip */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <KpiPill
                        label="Purchases"
                        value={customer.purchases?.length || 0}
                      />
                      <KpiPill
                        label="Test Drives"
                        value={
                          customer.inquiries?.filter(
                            (i) => i.type === "test_drive",
                          ).length || 0
                        }
                      />
                      <KpiPill
                        label="Total Spent"
                        value={
                          totalSpent >= 1000000
                            ? `AED ${(totalSpent / 1000000).toFixed(2)}M`
                            : totalSpent > 0
                              ? `AED ${totalSpent.toLocaleString()}`
                              : "AED 0"
                        }
                        color={
                          totalSpent > 0 ? "text-gold" : "text-text-primary"
                        }
                      />
                    </div>

                    {/* Contact Info */}
                    <SectionTitle>Contact Information</SectionTitle>
                    <div className="grid grid-cols-2 gap-2">
                      <DetailRow
                        label="Email"
                        value={customer.email}
                        icon={Mail}
                      />
                      <DetailRow
                        label="Mobile"
                        value={`${customer.mobileCode} ${customer.mobile}`}
                        icon={Phone}
                      />
                      <DetailRow
                        label="WhatsApp"
                        value={`${customer.whatsappCode} ${customer.whatsapp}`}
                        icon={Phone}
                      />
                      <DetailRow
                        label="Birthday"
                        value={formatDob(customer.dob)}
                      />
                      <DetailRow label="Source" value={customer.source} />
                      <DetailRow
                        label="Member Since"
                        value={
                          customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString(
                                "en-AE",
                                { month: "short", year: "numeric" },
                              )
                            : "—"
                        }
                      />
                    </div>

                    {/* Social links */}
                    {(customer.instagram || customer.facebook) && (
                      <>
                        <SectionTitle>Social Media</SectionTitle>
                        <div className="grid grid-cols-2 gap-2">
                          {customer.instagram && (
                            <div className="bg-base border border-border rounded-xl p-3">
                              <p
                                className="text-[9px] font-bold tracking-[0.15em]
                                            text-text-subtle uppercase mb-1"
                              >
                                Instagram
                              </p>
                              <p className="text-xs font-semibold text-sky-accent">
                                {customer.instagram}
                              </p>
                            </div>
                          )}
                          {customer.facebook && (
                            <div className="bg-base border border-border rounded-xl p-3">
                              <p
                                className="text-[9px] font-bold tracking-[0.15em]
                                            text-text-subtle uppercase mb-1"
                              >
                                Facebook
                              </p>
                              <p className="text-xs font-semibold text-sky-accent">
                                {customer.facebook}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Notes */}
                    {customer.notes && (
                      <>
                        <SectionTitle>Notes</SectionTitle>
                        <div
                          className="bg-base border border-border rounded-xl p-3
                                        text-xs text-text-muted leading-relaxed"
                        >
                          {customer.notes}
                        </div>
                      </>
                    )}

                    {/* Purchase history */}
                    <SectionTitle>Purchase History</SectionTitle>
                    {customer.purchases?.length > 0 ? (
                      customer.purchases.map((p, i) => (
                        <TimelineItem
                          key={i}
                          icon={Car}
                          iconBg="rgba(212,175,55,0.12)"
                          iconColor="#D4AF37"
                          title={p.car}
                          sub={`AED ${p.amount.toLocaleString()} · ${p.invoice} · ${p.method}`}
                          date={p.date}
                          isLast={i === customer.purchases.length - 1}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center py-4 text-center">
                        <div
                          className="w-8 h-8 rounded-lg bg-base border border-border
                                        flex items-center justify-center mb-2"
                        >
                          <Car size={14} className="text-text-subtle/40" />
                        </div>
                        <p className="text-[11px] text-text-subtle">
                          No purchases yet
                        </p>
                        <p className="text-[10px] text-text-subtle/60 mt-0.5">
                          Will update when an invoice is linked to this customer
                        </p>
                      </div>
                    )}

                    {/* Inquiry + test drive history */}
                    <SectionTitle>Inquiries & Test Drives</SectionTitle>
                    {customer.inquiries?.length > 0 ? (
                      customer.inquiries.map((inq, i) => (
                        <TimelineItem
                          key={i}
                          icon={
                            inq.type === "test_drive" ? Calendar : MessageSquare
                          }
                          iconBg={
                            inq.type === "test_drive"
                              ? "rgba(56,189,248,0.12)"
                              : "rgba(167,139,250,0.12)"
                          }
                          iconColor={
                            inq.type === "test_drive" ? "#38BDF8" : "#A78BFA"
                          }
                          title={`${inq.type === "test_drive" ? "Test Drive" : "Inquiry"} · ${inq.car}`}
                          sub={`${inq.status} · ${inq.note}`}
                          date={inq.date}
                          isLast={i === customer.inquiries.length - 1}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center py-4 text-center">
                        <div
                          className="w-8 h-8 rounded-lg bg-base border border-border
                                        flex items-center justify-center mb-2"
                        >
                          <Calendar size={14} className="text-text-subtle/40" />
                        </div>
                        <p className="text-[11px] text-text-subtle">
                          No inquiries yet
                        </p>
                        <p className="text-[10px] text-text-subtle/60 mt-0.5">
                          Test drives and inquiries will appear here when linked
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══════════ TAB 2: TIMELINE — new ═══════════ */}
                {activeTab === "timeline" && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="text-[10px] text-text-subtle mb-4 leading-relaxed">
                      Complete customer journey, automatically compiled from
                      Leads, Test Drives, Invoices, and Service records.
                    </p>
                    <CustomerTimeline customer={customer} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-5 py-4 border-t border-border flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={onClose} fullWidth>
                <X size={13} /> Close
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="!border-gold/30 !text-gold hover:!bg-gold/5"
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
              >
                <Edit size={13} /> Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => onDelete(customer)}
              >
                <Trash2 size={13} /> Delete
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CustomerDetailDrawer;
