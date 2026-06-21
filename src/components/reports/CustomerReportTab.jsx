// src/components/reports/CustomerReportTab.jsx
//
// Customer Reports — New/Returning/Growth metrics, Customer Acquisition chart,
// Customer Distribution (status + source breakdown)

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  UserCheck,
  TrendingUp,
  Users as UsersIcon,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { computeCustomerGrowth } from "../../utils/analyticsUtils";
import { computeCustomerDistribution } from "../../utils/reportUtils";
import ReportSummaryCard from "./ReportSummaryCard";
import CustomerGrowthChart from "../analytics/CustomerGrowthChart";

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

function DistTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-glass">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: d.payload.color }}
        />
        <span className="text-xs font-bold text-text-primary capitalize">
          {d.name}
        </span>
      </div>
      <p className="text-xs text-text-muted mt-1">
        {d.value} customer{d.value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// Donut + legend, reused pattern from InventoryStatusChart
function DistributionDonut({ data, total }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <ResponsiveContainer width={130} height={130}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<DistTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-[11px] text-text-muted capitalize">
                  {d.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-text-primary">
                  {d.value}
                </span>
                <span className="text-[9px] text-text-subtle w-7 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomerReportTab({ customers = [] }) {
  const kpis = useMemo(() => {
    const total = customers.length;
    const newCount = customers.filter(
      (c) => !c.purchases || c.purchases.length === 0,
    ).length;
    const returning = total - newCount;
    const vip = customers.filter((c) => c.status === "vip").length;
    return { total, newCount, returning, vip };
  }, [customers]);

  const growthData = useMemo(
    () => computeCustomerGrowth(customers),
    [customers],
  );
  const distribution = useMemo(
    () => computeCustomerDistribution(customers),
    [customers],
  );

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <ReportSummaryCard
          label="New Customers"
          value={String(kpis.newCount)}
          sub="No purchases yet"
          icon={UserPlus}
          iconClass="bg-sky-accent/10 text-sky-accent"
          delay={0}
        />
        <ReportSummaryCard
          label="Returning"
          value={String(kpis.returning)}
          sub="With purchase history"
          icon={UserCheck}
          iconClass="bg-emerald-400/10 text-emerald-400"
          delay={0.05}
        />
        <ReportSummaryCard
          label="Total Customers"
          value={String(kpis.total)}
          sub="In selected range"
          icon={UsersIcon}
          iconClass="bg-violet-400/10 text-violet-400"
          delay={0.1}
        />
        <ReportSummaryCard
          label="VIP Customers"
          value={String(kpis.vip)}
          sub="Highest tier"
          icon={TrendingUp}
          iconClass="bg-gold/10 text-gold"
          delay={0.15}
        />
      </div>

      {/* Customer Acquisition — reused from Analytics */}
      <CustomerGrowthChart data={growthData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Customer Distribution by Status — new */}
        <ReportSection
          title="Distribution by Status"
          sub="Customer base segmented by lifecycle status"
        >
          <DistributionDonut data={distribution.byStatus} total={kpis.total} />
        </ReportSection>

        {/* Customer Distribution by Source — new */}
        <ReportSection
          title="Distribution by Source"
          sub="Where customers are discovering Apex DriveOS"
        >
          <DistributionDonut data={distribution.bySource} total={kpis.total} />
        </ReportSection>
      </div>
    </div>
  );
}

export default CustomerReportTab;
