// src/components/testdrives/TestDriveCalendar.jsx
// Monthly calendar view showing test drive bookings per day.

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Status → color class
const STATUS_COLORS = {
  pending: "bg-amber-400/15 text-amber-400",
  approved: "bg-emerald-400/15 text-emerald-400",
  completed: "bg-sky-accent/15 text-sky-accent",
  rejected: "bg-rose-400/15 text-rose-400",
  cancelled: "bg-text-subtle/15 text-text-subtle",
};

function TestDriveCalendar({ bookings = [], onBookingClick, onDayClick }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false, dateStr: null });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, current: true, dateStr });
  }

  // Next month padding
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, dateStr: null });
  }

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl overflow-hidden
                 flex flex-col flex-1 min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
                     text-text-muted hover:text-gold hover:border-gold/30 transition-all"
          aria-label="Previous month"
        >
          <ChevronLeft size={15} />
        </button>
        <div className="text-center">
          <h3 className="text-sm font-extrabold text-text-primary">
            {MONTHS[month]} {year}
          </h3>
          <p className="text-[10px] text-text-subtle mt-0.5">
            {
              bookings.filter((b) => {
                const d = new Date(b.date);
                return d.getFullYear() === year && d.getMonth() === month;
              }).length
            }{" "}
            bookings this month
          </p>
        </div>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center
                     text-text-muted hover:text-gold hover:border-gold/30 transition-all"
          aria-label="Next month"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 px-4 py-2 flex-shrink-0">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] font-bold tracking-[0.2em]
                                   text-text-subtle uppercase py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto scrollbar-none">
        <div className="grid grid-cols-7 gap-1 px-4 pb-4">
          {cells.map((cell, i) => {
            const isToday =
              cell.current &&
              cell.day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            const dayBookings = cell.dateStr
              ? bookings.filter((b) => b.date === cell.dateStr)
              : [];

            return (
              <div
                key={i}
                onClick={() =>
                  cell.current && onDayClick?.(cell.dateStr, dayBookings)
                }
                className={clsx(
                  "rounded-xl border p-1.5 min-h-[70px] transition-all",
                  cell.current
                    ? "border-border hover:border-gold/30 cursor-pointer"
                    : "border-border/30 opacity-30",
                  isToday && "border-gold/50 bg-gold/[0.03]",
                  !cell.current && "cursor-default",
                )}
              >
                {/* Day number */}
                <p
                  className={clsx(
                    "text-[11px] font-bold mb-1 leading-none",
                    isToday
                      ? "text-gold"
                      : cell.current
                        ? "text-text-muted"
                        : "text-text-subtle",
                  )}
                >
                  {cell.day}
                </p>

                {/* Booking chips — max 2 visible */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 2).map((b, bi) => (
                    <div
                      key={bi}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick?.(b);
                      }}
                      className={clsx(
                        "text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate",
                        "cursor-pointer hover:opacity-80 transition-opacity",
                        STATUS_COLORS[b.status] || "bg-gold/15 text-gold",
                      )}
                      title={`${b.customerName} · ${b.carName}`}
                    >
                      {b.customerName.split(" ")[0]}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-[9px] text-text-subtle font-semibold px-1">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-border flex-shrink-0">
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
          Status
        </p>
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={clsx("w-2.5 h-2.5 rounded-sm", cls)} />
            <span className="text-[9px] text-text-subtle capitalize">
              {status}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default TestDriveCalendar;
