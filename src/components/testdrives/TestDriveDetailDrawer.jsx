// src/components/testdrives/TestDriveDetailDrawer.jsx

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Check,
  XCircle,
  Flag,
  Ban,
  CalendarCheck,
  MapPin,
  Clock,
  User,
  Car,
  UserCheck,
} from "lucide-react";
import { Badge, Button } from "../ui";

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

// Quick action buttons inside detail drawer
function QuickAction({ label, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px]
                  font-semibold transition-all cursor-pointer ${color}`}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function TestDriveDetailDrawer({
  booking,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onComplete,
  onCancel,
}) {
  if (!booking) return null;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d + "T00:00:00").toLocaleDateString("en-AE", {
      weekday: "long",
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
            className="fixed top-0 right-0 bottom-0 w-[420px] z-40
                       bg-card border-l border-border flex flex-col shadow-glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between px-5 py-4
                            border-b border-border flex-shrink-0"
            >
              <div>
                <h3 className="text-sm font-extrabold text-text-primary">
                  {booking.bookingId}
                </h3>
                <p className="text-[10px] text-text-subtle mt-0.5">
                  Booked{" "}
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString("en-AE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
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

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-none">
              {/* Status + Quick Actions */}
              <div className="flex items-start justify-between mb-4">
                <Badge status={booking.status} />
              </div>

              {/* Quick action buttons — context-aware */}
              <div className="flex flex-wrap gap-2 mb-4">
                {booking.status === "pending" && (
                  <>
                    <QuickAction
                      label="Approve"
                      icon={Check}
                      color="bg-emerald-400/8 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/15"
                      onClick={() => onApprove(booking)}
                    />
                    <QuickAction
                      label="Reject"
                      icon={XCircle}
                      color="bg-rose-400/8 text-rose-400 border-rose-400/30 hover:bg-rose-400/15"
                      onClick={() => onReject(booking)}
                    />
                  </>
                )}
                {booking.status === "approved" && (
                  <QuickAction
                    label="Mark Complete"
                    icon={Flag}
                    color="bg-sky-accent/8 text-sky-accent border-sky-accent/30 hover:bg-sky-accent/15"
                    onClick={() => onComplete(booking)}
                  />
                )}
                {(booking.status === "pending" ||
                  booking.status === "approved") && (
                  <QuickAction
                    label="Cancel"
                    icon={Ban}
                    color="bg-text-subtle/8 text-text-muted border-border hover:bg-card"
                    onClick={() => onCancel(booking)}
                  />
                )}
              </div>

              {/* Booking Details */}
              <SectionTitle>Booking Details</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <DetailRow
                  label="Customer"
                  value={booking.customerName}
                  icon={User}
                />
                <DetailRow label="Mobile" value={booking.customerMobile} />
                <DetailRow label="Car" value={booking.carName} icon={Car} />
                <DetailRow label="Plate No." value={booking.carPlate} />
                <DetailRow
                  label="Date"
                  value={formatDate(booking.date)}
                  icon={CalendarCheck}
                />
                <DetailRow label="Time" value={booking.time} icon={Clock} />
                <DetailRow label="Duration" value={booking.duration} />
                <DetailRow
                  label="Location"
                  value={booking.location}
                  icon={MapPin}
                />
              </div>

              {/* Assignment */}
              <SectionTitle>Assignment</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <DetailRow
                  label="Sales Exec"
                  value={booking.exec}
                  icon={UserCheck}
                />
                <DetailRow label="Source" value={booking.source} />
              </div>

              {/* Notes */}
              {booking.notes && (
                <>
                  <SectionTitle>Notes</SectionTitle>
                  <div
                    className="bg-base border border-border rounded-xl p-3
                                  text-xs text-text-muted leading-relaxed"
                  >
                    {booking.notes}
                  </div>
                </>
              )}
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
                  onEdit(booking);
                }}
              >
                <Edit size={13} /> Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => onDelete(booking)}
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

export default TestDriveDetailDrawer;
