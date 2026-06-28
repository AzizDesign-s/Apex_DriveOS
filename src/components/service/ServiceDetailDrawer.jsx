// src/components/service/ServiceDetailDrawer.jsx
// Right-side drawer showing full work order details.
// Same chrome pattern as CustomerDetailDrawer.
//
// QUICK ACTIONS:
//   — Mark In Progress (pending → in_progress)
//   — Mark Completed   (in_progress → completed)
//   — Mark Cancelled

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Car,
  Wrench,
  User,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  PlayCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "../ui";
import clsx from "clsx";

const STATUS_STYLE = {
  pending: "text-amber-400   bg-amber-400/10   border-amber-400/20",
  in_progress: "text-sky-accent  bg-sky-accent/10  border-sky-accent/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelled: "text-text-subtle bg-text-subtle/10 border-border",
};

const STATUS_LABEL = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

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
      className="text-[9px] font-bold tracking-[0.2em] text-text-subtle
                  uppercase mb-3 pb-2 border-b border-border mt-5 first:mt-0"
    >
      {children}
    </p>
  );
}

function ServiceDetailDrawer({
  order,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  if (!order) return null;

  const partsTotal = (order.parts || []).reduce(
    (sum, p) => sum + (Number(p.qty) || 0) * (Number(p.unitCost) || 0),
    0,
  );

  const isTerminal =
    order.status === "completed" || order.status === "cancelled";

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
            className="fixed top-0 right-0 bottom-0 lg:w-[420px] w-11/12 z-40
                       bg-card border-l border-border flex flex-col shadow-glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-start gap-3 px-4 py-4 border-b
                            border-border flex-shrink-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-text-primary">
                    {order.workOrderId}
                  </h3>
                  <span
                    className={clsx(
                      "text-[9px] font-bold uppercase tracking-wide",
                      "px-2 py-0.5 rounded-full border flex-shrink-0",
                      STATUS_STYLE[order.status],
                    )}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <p className="text-[10px] text-text-subtle mt-1">
                  {order.type} · {order.vehicleName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg border border-border flex items-center
                           justify-center text-text-muted hover:text-rose-400
                           hover:border-rose-400/40 transition-all flex-shrink-0"
              >
                <X size={13} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
              {/* Vehicle */}
              <div className="border border-border rounded-xl overflow-hidden mb-4">
                {order.vehicleImage && (
                  <img
                    src={order.vehicleImage}
                    alt={order.vehicleName}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div className="p-3 flex items-center gap-2">
                  <Car size={14} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-text-primary">
                      {order.vehicleName}
                    </p>
                    <p className="text-[10px] text-text-subtle mt-0.5">
                      {order.vehiclePlate}
                      {order.mileageAtService
                        ? ` · ${Number(order.mileageAtService).toLocaleString()} km`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service details */}
              <SectionTitle>Service Details</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <DetailRow label="Type" value={order.type} icon={Wrench} />
                <DetailRow
                  label="Technician"
                  value={order.technicianName || "Unassigned"}
                  icon={User}
                />
                <DetailRow
                  label="Start Date"
                  value={
                    order.startDate
                      ? new Date(order.startDate).toLocaleDateString("en-AE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"
                  }
                  icon={Calendar}
                />
                <DetailRow
                  label="Completed"
                  value={
                    order.completedDate
                      ? new Date(order.completedDate).toLocaleDateString(
                          "en-AE",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "—"
                  }
                  icon={Clock}
                />
              </div>

              {/* Notes */}
              {order.notes && (
                <>
                  <SectionTitle>Notes</SectionTitle>
                  <div className="bg-base border border-border rounded-xl p-3 mb-2">
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {order.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Parts */}
              {order.parts?.length > 0 && (
                <>
                  <SectionTitle>Parts Used</SectionTitle>
                  <div
                    className="bg-base border border-border rounded-xl
                                  overflow-hidden mb-2"
                  >
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th
                            className="px-3 py-2 text-left text-[8px] font-bold
                                         tracking-[0.15em] text-text-subtle uppercase"
                          >
                            Part
                          </th>
                          <th
                            className="px-3 py-2 text-center text-[8px] font-bold
                                         tracking-[0.15em] text-text-subtle uppercase"
                          >
                            Qty
                          </th>
                          <th
                            className="px-3 py-2 text-right text-[8px] font-bold
                                         tracking-[0.15em] text-text-subtle uppercase"
                          >
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.parts.map((p, i) => (
                          <tr
                            key={i}
                            className="border-b border-border last:border-0"
                          >
                            <td className="px-3 py-2 text-[11px] text-text-muted">
                              {p.name}
                            </td>
                            <td
                              className="px-3 py-2 text-[11px] text-text-subtle
                                           text-center"
                            >
                              {p.qty}
                            </td>
                            <td
                              className="px-3 py-2 text-[11px] text-text-muted
                                           text-right font-semibold"
                            >
                              AED{" "}
                              {Number(
                                (Number(p.qty) || 0) *
                                  (Number(p.unitCost) || 0),
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Cost summary */}
              <SectionTitle>Cost Summary</SectionTitle>
              <div className="bg-base border border-border rounded-xl p-4 space-y-2">
                {partsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[10px] text-text-subtle">Parts</span>
                    <span className="text-[10px] font-semibold text-text-muted">
                      AED {partsTotal.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[10px] text-text-subtle">
                    Estimated total
                  </span>
                  <span className="text-[10px] font-semibold text-text-muted">
                    AED {Number(order.estimatedCost || 0).toLocaleString()}
                  </span>
                </div>
                {order.actualCost != null && (
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span
                      className="text-[10px] font-bold text-text-primary
                                     uppercase tracking-wide"
                    >
                      Actual Cost
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      AED {Number(order.actualCost).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex-shrink-0 border-t border-border px-4 py-4">
              {isTerminal ? (
                <div className="flex gap-2">
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
                      onEdit(order);
                    }}
                  >
                    <Edit size={13} /> Edit
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Quick status actions */}
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => {
                          onStatusChange(order, "in_progress");
                          onClose();
                        }}
                      >
                        <PlayCircle size={13} /> Start Work
                      </Button>
                    )}
                    {order.status === "in_progress" && (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => {
                          onStatusChange(order, "completed");
                          onClose();
                        }}
                      >
                        <CheckCircle2 size={13} /> Mark Completed
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      fullWidth
                    >
                      <X size={13} /> Close
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      className="!border-gold/30 !text-gold hover:!bg-gold/5"
                      onClick={() => {
                        onClose();
                        onEdit(order);
                      }}
                    >
                      <Edit size={13} /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        onStatusChange(order, "cancelled");
                        onClose();
                      }}
                    >
                      <XCircle size={13} /> Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ServiceDetailDrawer;
