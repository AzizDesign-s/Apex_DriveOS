// src/components/inventory/CarDetailDrawer.jsx
// Slide-in drawer from right showing full car details.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Car,
  Wrench,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Badge, Button } from "../ui";

function DetailRow({ label, value }) {
  return (
    <div className="bg-base border border-border rounded-xl p-3">
      <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase mb-1">
        {label}
      </p>
      <p className="text-xs font-semibold text-text-primary">{value || "—"}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p
      className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase
                  mb-2 pb-2 border-b border-border mt-4 first:mt-0"
    >
      {children}
    </p>
  );
}

function CarDetailDrawer({ car, isOpen, onClose, onEdit, onDelete }) {
  const [serviceHistory, setServiceHistory] = useState([]);

  const [reservedByLead, setReservedByLead] = useState(null);

  useEffect(() => {
    if (!car || car.status !== "reserved") {
      setReservedByLead(null);
      return;
    }
    const findReservation = () => {
      try {
        const saved = localStorage.getItem("apex-driveos-leads");
        const leads = saved ? JSON.parse(saved) : [];
        const match = leads.find(
          (l) => l.interestedCarId === car.id && l.status === "reserved",
        );
        setReservedByLead(match || null);
      } catch {
        setReservedByLead(null);
      }
    };
    findReservation();
    window.addEventListener("apex-driveos-leads-updated", findReservation);
    return () =>
      window.removeEventListener("apex-driveos-leads-updated", findReservation);
  }, [car]);

  useEffect(() => {
    if (!car) return;
    try {
      const saved = localStorage.getItem("apex-driveos-service");
      const orders = saved ? JSON.parse(saved) : [];
      const history = orders
        .filter((o) => o.vehicleId === car.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      setServiceHistory(history);
    } catch {
      setServiceHistory([]);
    }
  }, [car]);

  useEffect(() => {
    const reload = () => {
      if (!car) return;
      try {
        const saved = localStorage.getItem("apex-driveos-service");
        const orders = saved ? JSON.parse(saved) : [];
        const history = orders
          .filter((o) => o.vehicleId === car.id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        setServiceHistory(history);
      } catch {
        setServiceHistory([]);
      }
    };
    window.addEventListener("apex-driveos-service-updated", reload);
    return () =>
      window.removeEventListener("apex-driveos-service-updated", reload);
  }, [car]);

  return (
    <AnimatePresence>
      {isOpen && car && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 lg:w-[400px] w-11/12 z-40
                       bg-card border-l border-border flex flex-col shadow-glass"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between px-2 py-4
                            border-b border-border flex-shrink-0"
            >
              <div>
                <h3 className="text-sm font-extrabold text-text-primary">
                  {car.brand} {car.model}
                </h3>
                <p className="text-[10px] text-text-subtle mt-0.5">
                  {car.year} · {car.bodyType} · {car.plate}
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
            <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-none space-y-4">
              {/* Hero image / placeholder */}

              {car.status === "reserved" && (
                <div className="mb-4">
                  {/* Banner header */}
                  <div
                    className="flex items-center gap-2 bg-sky-accent/[0.06]
                              border border-sky-accent/20 rounded-2xl p-4"
                  >
                    <div
                      className="w-9 h-9 rounded-xl bg-sky-accent/10 flex items-center
                                justify-center flex-shrink-0"
                    >
                      <Shield size={16} className="text-sky-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[9px] font-bold tracking-[0.2em]
                                text-sky-accent uppercase"
                      >
                        Vehicle Reserved
                      </p>
                      {reservedByLead ? (
                        <>
                          <p className="text-xs font-bold text-text-primary mt-0.5">
                            {reservedByLead.name}
                          </p>
                          <p className="text-[10px] text-text-subtle">
                            Lead {reservedByLead.leadId}
                            {reservedByLead.assignedExec
                              ? ` · ${reservedByLead.assignedExec}`
                              : ""}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-text-muted mt-0.5">
                          Reserved via Lead Management
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Deposit + Expiry row — only if lead has these fields */}
                  {reservedByLead &&
                    (reservedByLead.depositAmount ||
                      reservedByLead.reservationExpiry) && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Deposit */}
                        <div
                          className="flex items-center gap-2 bg-gold/[0.04]
                                  border border-gold/15 rounded-xl px-3 py-2.5"
                        >
                          <DollarSign
                            size={12}
                            className="text-gold flex-shrink-0"
                          />
                          <div>
                            <p
                              className="text-[8px] font-bold tracking-[0.15em]
                                    text-text-subtle uppercase"
                            >
                              Deposit
                            </p>
                            <p className="text-xs font-extrabold text-gold">
                              {reservedByLead.depositAmount
                                ? `AED ${Number(reservedByLead.depositAmount).toLocaleString()}`
                                : "Not collected"}
                            </p>
                          </div>
                        </div>

                        {/* Expiry */}
                        {reservedByLead.reservationExpiry &&
                          (() => {
                            const diff = Math.ceil(
                              (new Date(
                                reservedByLead.reservationExpiry,
                              ).getTime() -
                                Date.now()) /
                                (1000 * 60 * 60 * 24),
                            );
                            const isUrgent = diff <= 3;
                            const isExpired = diff < 0;
                            return (
                              <div
                                className={clsx(
                                  "flex items-center gap-2 rounded-xl px-3 py-2.5 border",
                                  isExpired
                                    ? "bg-rose-400/8  border-rose-400/20"
                                    : isUrgent
                                      ? "bg-amber-400/8 border-amber-400/20"
                                      : "bg-base border-border",
                                )}
                              >
                                {isExpired || isUrgent ? (
                                  <AlertTriangle
                                    size={12}
                                    className={
                                      isExpired
                                        ? "text-rose-400"
                                        : "text-amber-400"
                                    }
                                  />
                                ) : (
                                  <Shield
                                    size={12}
                                    className="text-text-subtle"
                                  />
                                )}
                                <div>
                                  <p
                                    className="text-[8px] font-bold tracking-[0.15em]
                                        text-text-subtle uppercase"
                                  >
                                    Expiry
                                  </p>
                                  <p
                                    className={clsx(
                                      "text-xs font-extrabold",
                                      isExpired
                                        ? "text-rose-400"
                                        : isUrgent
                                          ? "text-amber-400"
                                          : "text-text-primary",
                                    )}
                                  >
                                    {new Date(
                                      reservedByLead.reservationExpiry,
                                    ).toLocaleDateString("en-AE", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                  <p
                                    className={clsx(
                                      "text-[9px] font-semibold",
                                      isExpired
                                        ? "text-rose-400/70"
                                        : isUrgent
                                          ? "text-amber-400/70"
                                          : "text-text-subtle",
                                    )}
                                  >
                                    {isExpired
                                      ? `${Math.abs(diff)}d overdue`
                                      : diff === 0
                                        ? "Today"
                                        : `${diff}d left`}
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                      </div>
                    )}
                </div>
              )}
              <div
                className="w-full h-auto rounded-2xl bg-base border border-border
                              flex items-center justify-center overflow-hidden"
              >
                {/* ── Photo bento grid ── */}
                {(() => {
                  const allPhotos = [
                    ...(car.images || []),
                    ...(car.photos || []),
                  ];

                  if (allPhotos.length === 0) {
                    return (
                      <div
                        className="w-full h-36 rounded-2xl bg-base border border-border
                      flex items-center justify-center "
                      >
                        <Car size={40} className="text-text-subtle/30" />
                      </div>
                    );
                  }

                  // 1 photo — full width
                  if (allPhotos.length === 1) {
                    return (
                      <div className="w-full h-44 rounded-2xl overflow-hidden border border-border ">
                        <img
                          src={allPhotos[0].url}
                          alt={allPhotos[0].label || "Car photo"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  }

                  // 2 photos — side by side
                  if (allPhotos.length === 2) {
                    return (
                      <div className="grid grid-cols-2 gap-2 ">
                        {allPhotos.map((p, i) => (
                          <div
                            key={i}
                            className="h-36 rounded-xl overflow-hidden border border-border relative group"
                          >
                            <img
                              src={p.url}
                              alt={p.label}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold
                             bg-black/60 text-white px-2 py-0.5 rounded-full"
                            >
                              {p.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // 3 photos — 1 large left + 2 stacked right
                  if (allPhotos.length === 3) {
                    return (
                      <div className="grid grid-cols-2 gap-2 ">
                        <div className="row-span-2 rounded-xl overflow-hidden border border-border relative group">
                          <img
                            src={allPhotos[0].url}
                            alt={allPhotos[0].label}
                            className="w-full h-full object-cover"
                            style={{ height: "176px" }}
                          />
                          <span
                            className="absolute bottom-1.5 left-1.5 text-[9px] font-semibold
                           bg-black/60 text-white px-2 py-0.5 rounded-full"
                          >
                            {allPhotos[0].label}
                          </span>
                        </div>
                        {allPhotos.slice(1).map((p, i) => (
                          <div
                            key={i}
                            className="h-20 rounded-xl overflow-hidden border border-border relative"
                          >
                            <img
                              src={p.url}
                              alt={p.label}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className="absolute bottom-1 left-1.5 text-[8px] font-semibold
                             bg-black/60 text-white px-1.5 py-0.5 rounded-full"
                            >
                              {p.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // 4+ photos — bento: 1 large top + row of smaller below + "+N more" badge
                  return (
                    <div className="flex flex-col gap-2 ">
                      {/* Main hero */}
                      <div className="w-full h-40 rounded-xl overflow-hidden border border-border relative">
                        <img
                          src={allPhotos[0].url}
                          alt={allPhotos[0].label}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className="absolute bottom-2 left-2 text-[9px] font-semibold
                         bg-black/60 text-white px-2 py-0.5 rounded-full"
                        >
                          {allPhotos[0].label}
                        </span>
                      </div>

                      {/* Secondary row */}
                      <div className="grid grid-cols-3 gap-2">
                        {allPhotos.slice(1, 4).map((p, i) => {
                          const isLast = i === 2 && allPhotos.length > 4;
                          return (
                            <div
                              key={i}
                              className="h-20 rounded-xl overflow-hidden border border-border relative"
                            >
                              <img
                                src={p.url}
                                alt={p.label}
                                className="w-full h-full object-cover"
                              />
                              {/* +N more overlay on last visible cell */}
                              {isLast && (
                                <div
                                  className="absolute inset-0 bg-black/60 flex items-center justify-center
                                rounded-xl"
                                >
                                  <span className="text-white font-bold text-sm">
                                    +{allPhotos.length - 4}
                                  </span>
                                </div>
                              )}
                              {!isLast && (
                                <span
                                  className="absolute bottom-1 left-1.5 text-[8px] font-semibold
                                 bg-black/60 text-white px-1.5 py-0.5 rounded-full"
                                >
                                  {p.label}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Price + status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-subtle">Listed Price</p>
                  <p className="text-xl font-extrabold text-text-primary">
                    {car.currency || "AED"} {Number(car.price).toLocaleString()}
                  </p>
                  {Number(car.discount) > 0 && (
                    <p className="text-xs text-emerald-400 mt-0.5">
                      −{car.currency || "AED"}{" "}
                      {Number(car.discount).toLocaleString()} discount
                    </p>
                  )}
                </div>
                <Badge status={car.status} />
              </div>

              {/* Basic details */}
              <div>
                <SectionTitle>Basic Details</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <DetailRow label="Brand" value={car.brand} />
                  <DetailRow label="Model" value={car.model} />
                  <DetailRow label="Year" value={car.year} />
                  <DetailRow label="Body Type" value={car.bodyType} />
                  <DetailRow label="Fuel" value={car.fuel || car.fuelType} />
                  <DetailRow label="Transmission" value={car.transmission} />
                  <DetailRow label="Drive Type" value={car.driveType} />
                  <DetailRow
                    label="Mileage"
                    value={
                      car.mileage
                        ? `${Number(car.mileage).toLocaleString()} km`
                        : "—"
                    }
                  />
                  <DetailRow label="Total Units" value={car.units} />
                  <DetailRow label="Plate No." value={car.plate} />
                </div>
              </div>

              {/* Colors */}
              <div>
                <SectionTitle>Colors</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-base border border-border rounded-xl p-3">
                    <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase mb-2">
                      Exterior
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg border border-border flex-shrink-0"
                        style={{ background: car.exteriorColor }}
                      />
                      <p className="text-xs font-semibold text-text-primary">
                        {car.exteriorColorName || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-base border border-border rounded-xl p-3">
                    <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase mb-2">
                      Interior
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg border border-border flex-shrink-0"
                        style={{ background: car.interiorColor }}
                      />
                      <p className="text-xs font-semibold text-text-primary">
                        {car.interiorColorName || "—"}
                      </p>
                    </div>
                  </div>
                  <DetailRow label="Color Type" value={car.colorType} />
                </div>
              </div>

              {/* Features */}
              {car.features && (
                <div>
                  <SectionTitle>Features</SectionTitle>
                  <div
                    className="bg-base border border-border rounded-xl p-3
                                  text-xs text-text-muted leading-[1.8] whitespace-pre-line"
                  >
                    {car.features}
                  </div>
                </div>
              )}

              {/* Condition */}
              {car.condition && (
                <div>
                  <SectionTitle>Condition</SectionTitle>
                  <div
                    className="bg-base border border-border rounded-xl p-3
                                  text-xs text-text-muted leading-relaxed"
                  >
                    {car.condition}
                  </div>
                </div>
              )}

              <div>
                <SectionTitle>Service History</SectionTitle>

                {serviceHistory.length === 0 ? (
                  <div
                    className="flex flex-col items-center py-6
                                  border border-dashed border-border rounded-xl"
                  >
                    <Wrench size={20} className="text-text-subtle/30 mb-2" />
                    <p className="text-[10px] text-text-subtle">
                      No service records for this vehicle
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {serviceHistory.map((order) => {
                      const statusColor =
                        {
                          pending: "text-amber-400   bg-amber-400/10",
                          in_progress: "text-sky-accent  bg-sky-accent/10",
                          completed: "text-emerald-400 bg-emerald-400/10",
                          cancelled: "text-text-subtle bg-text-subtle/10",
                        }[order.status] || "text-text-muted bg-border/30";

                      return (
                        <div
                          key={order.id}
                          className="bg-base border border-border rounded-xl p-3"
                        >
                          {/* Top row: WO ID + status + date */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gold font-mono">
                                {order.workOrderId}
                              </span>
                              <span
                                className={`text-[8px] font-bold uppercase
                                            tracking-wide px-1.5 py-0.5
                                            rounded-full ${statusColor}`}
                              >
                                {order.status.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-text-subtle">
                              <Clock size={9} />
                              <span className="text-[9px]">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-AE",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Service type + technician */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Wrench size={10} className="text-text-subtle" />
                              <span className="text-[11px] font-semibold text-text-muted">
                                {order.type}
                              </span>
                            </div>
                            {order.technicianName && (
                              <span className="text-[10px] text-text-subtle">
                                {order.technicianName}
                              </span>
                            )}
                          </div>

                          {/* Cost */}
                          {(order.actualCost != null ||
                            order.estimatedCost) && (
                            <div
                              className="flex items-center gap-2 mt-2 pt-2
                                            border-t border-border"
                            >
                              {order.actualCost != null ? (
                                <span className="text-[10px] text-emerald-400 font-semibold">
                                  AED{" "}
                                  {Number(order.actualCost).toLocaleString()}{" "}
                                  actual
                                </span>
                              ) : (
                                <span className="text-[10px] text-text-subtle">
                                  Est. AED{" "}
                                  {Number(
                                    order.estimatedCost || 0,
                                  ).toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Notes preview */}
                          {order.notes && (
                            <p
                              className="text-[10px] text-text-subtle mt-1.5
                                          leading-relaxed line-clamp-2"
                            >
                              {order.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
                  onEdit(car);
                }}
              >
                <Edit size={13} /> Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => onDelete(car)}
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

export default CarDetailDrawer;
