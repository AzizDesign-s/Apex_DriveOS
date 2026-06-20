// src/components/reports/InventoryReportTab.jsx
//
// Inventory Reports — Available/Reserved/Sold/Maintenance metrics,
// Inventory Distribution, Top Selling Brands, Stock Status Overview (aging)

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Car, CheckCircle2, Clock, Wrench, AlertTriangle } from "lucide-react";
import {
  computeInventoryStatus,
  computeSalesByBrand,
} from "../../utils/analyticsUtils";
import { computeStockStatusOverview } from "../../utils/reportUtils";
import ReportSummaryCard from "./ReportSummaryCard";
import InventoryStatusChart from "../analytics/InventoryStatusChart";

function ReportSection({ title, sub, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 ">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-text-primary">{title}</h3>
        {sub && <p className="text-[10px] text-text-subtle mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// Stock aging buckets — Fresh / Aging / Stale
function StockAgingBar({ buckets, total }) {
  const segments = [
    { key: "fresh", label: "Fresh (0–30d)", color: "#10B981" },
    { key: "aging", label: "Aging (31–90d)", color: "#FBBF24" },
    { key: "stale", label: "Stale (90d+)", color: "#FB7185" },
  ];

  return (
    <div>
      <div className="h-3 rounded-full overflow-hidden flex bg-base mb-3">
        {segments.map((s) => {
          const pct = total > 0 ? (buckets[s.key] / total) * 100 : 0;
          return pct > 0 ? (
            <motion.div
              key={s.key}
              style={{ background: s.color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
            />
          ) : null;
        })}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-[10px] text-text-muted">{s.label}</span>
            <span className="text-[10px] font-bold text-text-primary">
              {buckets[s.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Slowest moving inventory — list with day counts
function SlowMovingList({ items }) {
  if (items.length === 0) {
    return (
      <p className="text-xs text-text-subtle text-center py-6">
        No aging stock to flag
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((car, i) => (
        <motion.div
          key={car.id}
          className="flex items-center justify-between px-3 py-2.5 bg-base border border-border rounded-xl"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <div className="min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">
              {car.brand} {car.model}
            </p>
            <p className="text-[10px] text-text-subtle mt-0.5">
              {car.plate} · AED {Number(car.price).toLocaleString()}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
              car.daysInStock > 90
                ? "bg-rose-400/10 text-rose-400"
                : "bg-amber-400/10 text-amber-400"
            }`}
          >
            {car.daysInStock}d
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function InventoryReportTab({ cars = [] }) {
  const stats = useMemo(
    () => ({
      available: cars.filter((c) => c.status === "available").length,
      reserved: cars.filter((c) => c.status === "reserved").length,
      sold: cars.filter((c) => c.status === "sold").length,
      maintenance: cars.filter((c) => c.status === "maintenance").length,
    }),
    [cars],
  );

  const inventoryDistribution = useMemo(
    () => computeInventoryStatus(cars),
    [cars],
  );
  const topBrands = useMemo(
    () =>
      computeSalesByBrand([], cars).length > 0
        ? computeSalesByBrand([], cars)
        : [
            ...cars
              .reduce((map, c) => {
                if (!map.has(c.brand))
                  map.set(c.brand, { brand: c.brand, sales: 0 });
                map.get(c.brand).sales += 1;
                return map;
              }, new Map())
              .values(),
          ]
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 6),
    [cars],
  );

  const stockOverview = useMemo(() => computeStockStatusOverview(cars), [cars]);

  return (
    <div>
      {/* Summary cards — the 4 metrics from the brief */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <ReportSummaryCard
          label="Available"
          value={String(stats.available)}
          sub="Ready for sale"
          icon={CheckCircle2}
          iconClass="bg-emerald-400/10 text-emerald-400"
          delay={0}
        />
        <ReportSummaryCard
          label="Reserved"
          value={String(stats.reserved)}
          sub="Pending finalization"
          icon={Clock}
          iconClass="bg-sky-accent/10 text-sky-accent"
          delay={0.05}
        />
        <ReportSummaryCard
          label="Sold"
          value={String(stats.sold)}
          sub="Completed sales"
          icon={Car}
          iconClass="bg-gold/10 text-gold"
          delay={0.1}
        />
        <ReportSummaryCard
          label="Maintenance"
          value={String(stats.maintenance)}
          sub="Currently serviced"
          icon={Wrench}
          iconClass="bg-rose-400/10 text-rose-400"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Inventory Distribution — reused from Analytics */}
        <InventoryStatusChart data={inventoryDistribution} />

        {/* Top Selling Brands — by unit count across current inventory */}
        <ReportSection
          title="Top Brands in Inventory"
          sub="Distribution of current stock by brand"
        >
          <div className="space-y-2.5">
            {topBrands.map((b, i) => {
              const max = Math.max(...topBrands.map((x) => x.sales), 1);
              return (
                <div key={b.brand}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-text-muted">
                      {b.brand}
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      {b.sales}
                    </span>
                  </div>
                  <div className="h-1.5 bg-base rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold/70 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.sales / max) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ReportSection>
      </div>

      {/* Stock Status Overview — new, aging buckets + slowest movers */}
      <ReportSection
        title="Stock Status Overview"
        sub={`${stockOverview.totalAvailable} available vehicles by days in stock`}
      >
        <StockAgingBar
          buckets={stockOverview.buckets}
          total={stockOverview.totalAvailable}
        />

        {stockOverview.buckets.stale > 0 && (
          <div className="flex items-start gap-2 bg-rose-400/8 border border-rose-400/20 rounded-xl px-3 py-2.5 mt-4 mb-4">
            <AlertTriangle
              size={13}
              className="text-rose-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-rose-400/80 leading-relaxed">
              {stockOverview.buckets.stale} vehicle
              {stockOverview.buckets.stale > 1 ? "s have" : " has"} been in
              stock over 90 days. Consider promotional pricing.
            </p>
          </div>
        )}

        <p className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase mb-3 mt-4">
          Slowest Moving Vehicles
        </p>
        <SlowMovingList items={stockOverview.slowestMoving} />
      </ReportSection>
    </div>
  );
}

export default InventoryReportTab;
