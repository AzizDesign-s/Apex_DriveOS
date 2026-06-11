// src/components/inventory/CarDetailDrawer.jsx
// Slide-in drawer from right showing full car details.

import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Trash2, Car } from "lucide-react";
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
            className="fixed top-0 right-0 bottom-0 w-[400px] z-40
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
            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-none space-y-4">
              {/* Hero image / placeholder */}
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
