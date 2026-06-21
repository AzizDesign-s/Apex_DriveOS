// src/components/testdrives/TestDriveFormPage.jsx
// Single-page form (no tabs — all fields fit cleanly in one scroll)

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { Button, Input, Select } from "../ui";
import {
  customers as seedCustomers,
  cars as seedCars,
  SALES_EXECUTIVES,
  TIME_SLOTS,
  generateBookingId,
  isCustomerFacingRole,
  roles,
} from "../../data/mockData";
import apexToast from "../../utils/toast";

const getLiveCustomers = () => {
  try {
    const saved = localStorage.getItem("apex-gt-customers");
    return saved ? JSON.parse(saved) : seedCustomers;
  } catch {
    return seedCustomers;
  }
};

const getLiveCars = () => {
  try {
    const saved = localStorage.getItem("apex-gt-cars");
    return saved ? JSON.parse(saved) : seedCars;
  } catch {
    return seedCars;
  }
};

const getLiveUsers = () => {
  try {
    const saved = localStorage.getItem("apex-gt-users");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getLiveRoles = () => {
  try {
    const saved = localStorage.getItem("apex-gt-roles");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const EMPTY = {
  bookingId: "",
  customerId: "",
  customerName: "",
  customerMobile: "",
  carId: "",
  carName: "",
  carPlate: "",
  date: "",
  time: "10:00 AM",
  duration: "45 minutes",
  location: "Apex DriveOS Showroom, Sheikh Zayed Road, Dubai",
  exec: "",
  source: "Walk-in",
  status: "pending",
  notes: "",
};

function FormSection({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4">
      <p
        className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase
                    mb-4 pb-2.5 border-b border-border"
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

function TestDriveFormPage({
  isOpen,
  onClose,
  onSave,
  editBooking = null,
  allBookings = [],
  prefilledDate = "",
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const [liveCustomers, setLiveCustomers] = useState(getLiveCustomers);
  const [liveCars, setLiveCars] = useState(getLiveCars);

  const [liveUsers, setLiveUsers] = useState(getLiveUsers);
  const [liveRoles, setLiveRoles] = useState(getLiveRoles);

  useEffect(() => {
    if (isOpen) {
      setLiveUsers(getLiveUsers());
      setLiveRoles(getLiveRoles());
    }
  }, [isOpen]);

  // Bug 3 FIX: only show users whose role qualifies as customer-facing
  const assignableExecs = liveUsers.filter((u) => {
    const role = liveRoles.find((r) => r.id === Number(u.roleId));
    return role && isCustomerFacingRole(role) && u.status === "active";
  });

  useEffect(() => {
    if (isOpen) {
      setLiveCustomers(getLiveCustomers());
      setLiveCars(getLiveCars());

      if (editBooking) {
        setForm({ ...EMPTY, ...editBooking });
      } else {
        setForm({
          ...EMPTY,
          bookingId: generateBookingId(allBookings),
          // BUG-031 FIX: pre-fill date if coming from calendar day click
          date: prefilledDate || "",
        });
      }
      setErrors({});
    }
  }, [isOpen, editBooking, allBookings, prefilledDate]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // When customer is selected — auto-fill their details
  const handleCustomerChange = (customerId) => {
    const customer = liveCustomers.find((c) => c.id === Number(customerId));
    if (customer) {
      set("customerId", customerId);
      set("customerName", customer.name);
      set("customerMobile", `${customer.mobileCode} ${customer.mobile}`);
    } else {
      set("customerId", "");
      set("customerName", "");
      set("customerMobile", "");
    }
  };

  // When car is selected — auto-fill car details
  const handleCarChange = (carId) => {
    const car = liveCars.find((c) => c.id === Number(carId));
    if (car) {
      set("carId", carId);
      set("carName", `${car.brand} ${car.model}`);
      set("carPlate", car.plate);
    } else {
      set("carId", "");
      set("carName", "");
      set("carPlate", "");
    }
  };

  const availableCars = liveCars.filter(
    (c) =>
      c.status === "available" ||
      c.status === "reserved" ||
      c.id === Number(form.carId), // always include currently-selected car when editing
  );

  const validate = () => {
    const e = {};
    if (!form.customerId) e.customerId = "Required";
    if (!form.carId) e.carId = "Required";
    if (!form.date) e.date = "Required";
    if (!form.time) e.time = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      apexToast.error("Validation Failed", "Please fill all required fields.");
      return;
    }
    onSave({
      ...form,
      id: editBooking?.id || Date.now(),
      createdAt:
        editBooking?.createdAt || new Date().toISOString().split("T")[0],
    });
    apexToast.success(
      editBooking ? "Booking Updated" : "Booking Created",
      `${form.bookingId} has been ${editBooking ? "updated" : "created"} successfully.`,
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-base flex flex-col"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div
            className="flex-shrink-0 bg-card border-b border-border px-4 py-4
                          flex items-center justify-between sticky top-0 z-10"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center
                           text-text-muted hover:text-text-primary hover:border-gold/40 transition-all"
                aria-label="Go back"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="sm:text-sm text-[12px] font-extrabold text-text-primary">
                  {editBooking
                    ? `Edit · ${editBooking.bookingId}`
                    : "Book Test Drive"}
                </h2>
                <p className="text-[10px] text-text-subtle mt-1.5">
                  ID auto-generated · Required fields marked *
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Check}
                onClick={handleSave}
              >
                <span className="hidden sm:inline">
                  {editBooking ? "Update Booking" : "Save Booking"}
                </span>
              </Button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-6">
              {/* Booking Identity */}
              <FormSection title="Booking Identity">
                <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
                  <Field label="Booking ID">
                    <div
                      className="input-luxury py-2 text-xs font-bold text-gold
                                    bg-gold/[0.04] border-gold/15 cursor-not-allowed"
                    >
                      {form.bookingId}
                    </div>
                  </Field>
                  <Field label="Status">
                    <Select
                      value={form.status}
                      onChange={(e) => set("status", e.target.value)}
                      options={[
                        { value: "pending", label: "Pending" },
                        { value: "approved", label: "Approved" },
                        { value: "rejected", label: "Rejected" },
                        { value: "completed", label: "Completed" },
                        { value: "cancelled", label: "Cancelled" },
                      ]}
                    />
                  </Field>
                  <Field label="Source">
                    <Select
                      value={form.source}
                      onChange={(e) => set("source", e.target.value)}
                      options={[
                        "Instagram",
                        "Facebook",
                        "WhatsApp",
                        "Walk-in",
                        "Referral",
                        "Website",
                        "Google Ads",
                        "Exhibition",
                        "Other",
                      ]}
                    />
                  </Field>
                </div>
              </FormSection>

              {/* Customer & Car */}
              <FormSection title="Customer & Car">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <Field label="Customer" required error={errors.customerId}>
                    <Select
                      value={form.customerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      options={liveCustomers.map((c) => ({
                        value: String(c.id),
                        label: `${c.name} (${c.customerId})`,
                      }))}
                      placeholder="Select Customer from CRM"
                    />
                  </Field>
                  <Field label="Customer Mobile">
                    <div
                      className={`input-luxury py-2.5 text-xs ${form.customerMobile ? "text-text-primary" : "text-text-subtle"}`}
                    >
                      {form.customerMobile || "Auto-filled from CRM"}
                    </div>
                  </Field>
                  <Field label="Car" required error={errors.carId}>
                    <Select
                      value={form.carId}
                      onChange={(e) => handleCarChange(e.target.value)}
                      options={availableCars.map((c) => ({
                        value: String(c.id),
                        label: `${c.brand} ${c.model} · ${c.plate}`,
                      }))}
                      placeholder="Select Car from Inventory"
                    />
                  </Field>
                  <Field label="Plate No.">
                    <div
                      className={`input-luxury py-2.5 text-xs ${form.carPlate ? "text-text-primary" : "text-text-subtle"}`}
                    >
                      {form.carPlate || "Auto-filled from Inventory"}
                    </div>
                  </Field>
                </div>
              </FormSection>

              {/* Date, Time & Location */}
              <FormSection title="Date, Time & Location">
                <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
                  <Field label="Date" required error={errors.date}>
                    <input
                      type="date"
                      className="input-luxury text-xs py-2"
                      value={form.date}
                      onChange={(e) => set("date", e.target.value)}
                    />
                  </Field>
                  <Field label="Time Slot" required error={errors.time}>
                    <Select
                      value={form.time}
                      onChange={(e) => set("time", e.target.value)}
                      options={TIME_SLOTS}
                    />
                  </Field>
                  <Field label="Duration">
                    <Select
                      value={form.duration}
                      onChange={(e) => set("duration", e.target.value)}
                      options={[
                        "30 minutes",
                        "45 minutes",
                        "60 minutes",
                        "90 minutes",
                      ]}
                    />
                  </Field>
                  <div className="sm:col-span-3 col-span-1">
                    <Field label="Location">
                      <Input
                        placeholder="e.g. Apex DriveOS Showroom, Sheikh Zayed Road, Dubai"
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Assignment & Notes */}
              <FormSection title="Assignment & Notes">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                  <Field label="Sales Executive">
                    <Select
                      value={form.exec}
                      onChange={(e) => set("exec", e.target.value)}
                      options={assignableExecs.map((u) => ({
                        value: u.fullName,
                        label: `${u.fullName} (${roles.find((r) => r.id === u.roleId)?.name || ""})`,
                      }))}
                      placeholder="Assign Sales Executive"
                    />
                  </Field>
                  <Field label="Notes">
                    <Input
                      rows={3}
                      placeholder="Any special requirements or notes..."
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                    />
                  </Field>
                </div>
              </FormSection>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex-shrink-0 bg-card border-t border-border px-6 py-3
                          flex items-center justify-end gap-3 sticky bottom-0"
          >
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSave}
            >
              {editBooking ? "Update Booking" : "Save Booking"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TestDriveFormPage;
