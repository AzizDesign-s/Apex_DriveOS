// src/pages/Promotions.jsx
// Sprint 4 Phase 6 — Promotions & Discounts page.
// Thin page: only state management and layout.
// All components imported from src/components/promotions/

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Tag } from "lucide-react";
import {
  promotions as initialPromotions,
  generatePromotionId,
  getPromotionStatus,
} from "../data/mockPromotion";
import { activity } from "../utils/activityLogger";
import { DeleteConfirm, Button } from "../components/ui";
import PromotionStats from "../components/promotions/PromotionsStats";
import PromotionCard from "../components/promotions/PromotionCard";
import PromotionFormPage from "../components/promotions/PromotionFormPage";
import apexToast from "../utils/toast";
import clsx from "clsx";

const LS_KEY = "apex-driveos-promotions";

const loadPromotions = () => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : initialPromotions;
  } catch {
    return initialPromotions;
  }
};

function Promotions() {
  const [promotions, setPromotions] = useState(() => loadPromotions());
  const [formOpen, setFormOpen] = useState(false);
  const [editPromo, setEditPromo] = useState(null);
  const [deletePromo, setDeletePromo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Persist + dispatch on every change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(promotions));
    window.dispatchEvent(
      new CustomEvent("apex-driveos-promotions-updated", {
        detail: { promotions },
      }),
    );
  }, [promotions]);

  const handleSave = useCallback((data) => {
    setPromotions((prev) => {
      if (data.id) {
        apexToast.success(
          "Promotion Updated",
          `${data.name} has been updated.`,
        );
        return prev.map((p) => (p.id === data.id ? { ...data } : p));
      }
      const newPromo = {
        ...data,
        id: Date.now(),
        promotionId: generatePromotionId(prev),
        createdAt: new Date().toISOString(),
      };
      apexToast.success("Promotion Created", `${newPromo.name} is now live.`);
      return [newPromo, ...prev];
    });
    setFormOpen(false);
    setEditPromo(null);
  }, []);

  const handleDelete = useCallback((promo) => {
    setPromotions((prev) => prev.filter((p) => p.id !== promo.id));
    setDeletePromo(null);
    apexToast.info("Promotion Deleted", `${promo.name} removed.`);
  }, []);

  const handleEdit = useCallback((promo) => {
    setEditPromo(promo);
    setFormOpen(true);
  }, []);

  const filtered = useMemo(() => {
    if (filterStatus === "all") return promotions;
    return promotions.filter((p) => getPromotionStatus(p) === filterStatus);
  }, [promotions, filterStatus]);

  const activeCount = promotions.filter(
    (p) => getPromotionStatus(p) === "active",
  ).length;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6">
      {/* Page header */}
      <motion.div
        className="flex items-start justify-between flex-shrink-0"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-text-primary">
              Promotions & Discounts
            </h1>
            <span
              className="text-[10px] font-bold bg-gold/15 text-gold
                             px-2.5 py-1 rounded-full border border-gold/25"
            >
              {activeCount} active
            </span>
          </div>
          <p className="text-[10px] text-text-subtle mt-0.5 tracking-wide">
            Manage pricing rules · Apply to invoices during creation
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => {
            setEditPromo(null);
            setFormOpen(true);
          }}
        >
          <span className="hidden sm:inline">New Promotion</span>
        </Button>
      </motion.div>

      {/* Stats */}
      <PromotionStats promotions={promotions} />

      {/* Status filter tabs */}
      <div
        className="flex items-center gap-2 flex-shrink-0
                      overflow-x-auto scrollbar-none pb-0.5"
      >
        {["all", "active", "upcoming", "expired"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={clsx(
              "px-3 py-1.5 rounded-xl border text-[11px] font-semibold",
              "transition-all capitalize flex-shrink-0", // ← ADD flex-shrink-0
              filterStatus === s
                ? "border-gold/50 text-gold bg-gold/8"
                : "border-border text-text-subtle hover:text-text-muted hover:border-gold/25",
            )}
          >
            {s}
          </button>
        ))}
        <span className="text-[10px] text-text-subtle ml-auto">
          {filtered.length} promotion{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="w-14 h-14 rounded-2xl bg-gold/5 border border-gold/10
                          flex items-center justify-center mb-4"
          >
            <Tag size={22} className="text-text-subtle/30" />
          </div>
          <p className="text-sm font-bold text-text-primary mb-1">
            No promotions found
          </p>
          <p className="text-[11px] text-text-subtle">
            {filterStatus === "all"
              ? "Create your first promotion to get started"
              : `No ${filterStatus} promotions`}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((promo) => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onEdit={handleEdit}
                onDelete={setDeletePromo}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form page — slide-up full screen */}
      <PromotionFormPage
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditPromo(null);
        }}
        onSave={handleSave}
        editPromotion={editPromo}
      />

      {/* Delete confirm */}
      <DeleteConfirm
        isOpen={!!deletePromo}
        onClose={() => setDeletePromo(null)}
        onConfirm={() => handleDelete(deletePromo)}
        title="Delete Promotion?"
        itemName={deletePromo?.name}
        confirmText={deletePromo?.name}
      />
    </div>
  );
}

export default Promotions;
