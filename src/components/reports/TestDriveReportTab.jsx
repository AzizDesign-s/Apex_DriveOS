// src/components/reports/TestDriveReportTab.jsx
//
// Test Drive Reports — Total/Approved/Rejected/Completed metrics,
// Most Requested Vehicles, Conversion Performance

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, XCircle, Flag } from "lucide-react";
import { computeTestDriveConversion } from "../../utils/analyticsUtils";
import { computeMostRequestedVehicles } from "../../utils/reportUtils";
import ReportSummaryCard from "./ReportSummaryCard";
import TopCarsChart from "../analytics/TopCarsChart";

function ReportSection({ title, sub, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 mb-4">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-text-primary">{title}</h3>
        {sub && <p className="text-[10px] text-text-subtle mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// Most Requested Vehicles — ranked bar list
function MostRequestedList({ data }) {
  if (data.length === 0) {
    return (
      <p className="text-xs text-text-subtle text-center py-10">
        No test drive requests in this range
      </p>
    );
  }
  const max = Math.max(...data.map((d) => d.requests), 1);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <motion.div
          key={item.model}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black flex-shrink-0 ${
                  i === 0
                    ? "bg-gold/15 text-gold"
                    : "bg-base text-text-subtle border border-border"
                }`}
              >
                {i + 1}
              </span>
              <span className="text-xs font-semibold text-text-primary mb-1.5">
                {item.model}
              </span>
            </div>
            <span className="text-xs font-bold text-gold flex-shrink-0 mt-1.5">
              {item.requests}
            </span>
          </div>
          <div className="h-1.5 bg-base rounded-full overflow-hidden ml-7 mt-2.5">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-accent/60 to-sky-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(item.requests / max) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TestDriveReportTab({ bookings = [], invoices = [] }) {
  const stats = useMemo(
    () => ({
      total: bookings.length,
      approved: bookings.filter((b) => b.status === "approved").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    }),
    [bookings],
  );

  const conversionData = useMemo(
    () => computeTestDriveConversion(bookings, invoices),
    [bookings, invoices],
  );
  const mostRequested = useMemo(
    () => computeMostRequestedVehicles(bookings),
    [bookings],
  );

  const overallConversion = useMemo(() => {
    const totalDrives = conversionData.reduce((s, d) => s + d.drives, 0);
    const converted = conversionData.reduce((s, d) => s + d.converted, 0);
    return totalDrives > 0 ? Math.round((converted / totalDrives) * 100) : 0;
  }, [conversionData]);

  return (
    <div>
      {/* Summary cards — Total/Approved/Rejected/Completed from the brief */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <ReportSummaryCard
          label="Total Bookings"
          value={String(stats.total)}
          sub="In selected range"
          icon={CalendarCheck}
          iconClass="bg-sky-accent/10 text-sky-accent"
          delay={0}
        />
        <ReportSummaryCard
          label="Approved"
          value={String(stats.approved)}
          sub="Confirmed test drives"
          icon={CheckCircle2}
          iconClass="bg-emerald-400/10 text-emerald-400"
          delay={0.05}
        />
        <ReportSummaryCard
          label="Rejected"
          value={String(stats.rejected)}
          sub="Declined requests"
          icon={XCircle}
          iconClass="bg-rose-400/10 text-rose-400"
          delay={0.1}
        />
        <ReportSummaryCard
          label="Completed"
          value={String(stats.completed)}
          sub={`${overallConversion}% led to sale`}
          icon={Flag}
          iconClass="bg-gold/10 text-gold"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Requested Vehicles — new */}
        <ReportSection
          title="Most Requested Vehicles"
          sub="Ranked by test drive request volume"
        >
          <MostRequestedList data={mostRequested} />
        </ReportSection>

        {/* Conversion Performance — reused TopCarsChart's conversion tab */}
        <ReportSection
          title="Conversion Performance"
          sub="Test drives vs. completed sales over time"
        >
          <TopCarsChart
            topCars={[]}
            conversionData={conversionData}
            paymentData={[]}
            activeTab={1}
            onTabChange={() => {}}
          />
        </ReportSection>
      </div>
    </div>
  );
}

export default TestDriveReportTab;
