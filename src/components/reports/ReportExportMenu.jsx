// src/components/reports/ReportExportMenu.jsx
//
// "Export This Report" (active tab only) + "Export Full Report" (all 4 tabs).
// Both PDF and Excel for each option = 4 actions total.

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { Button } from "../ui";

function ReportExportMenu({ activeTabLabel, onExportTab, onExportFull }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="primary"
        size="md"
        icon={Download}
        onClick={() => setOpen((p) => !p)}
      >
        Export{" "}
        <ChevronDown
          size={12}
          className={`ml-0.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-[calc(100%+6px)] w-64 z-30
                       bg-card border border-border rounded-xl shadow-glass overflow-hidden"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase">
                {activeTabLabel}
              </p>
            </div>
            <button
              onClick={() => {
                onExportTab("Excel");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-text-muted
                         hover:bg-gold/5 hover:text-gold transition-colors text-left"
            >
              <FileSpreadsheet size={13} /> Export This Report (Excel)
            </button>
            <button
              onClick={() => {
                onExportTab("PDF");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-text-muted
                         hover:bg-gold/5 hover:text-gold transition-colors text-left border-b border-border"
            >
              <FileText size={13} /> Export This Report (PDF)
            </button>

            <div className="px-3 py-2 border-b border-border">
              <p className="text-[9px] font-bold tracking-[0.15em] text-text-subtle uppercase">
                Full Report
              </p>
            </div>
            <button
              onClick={() => {
                onExportFull("Excel");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-text-muted
                         hover:bg-gold/5 hover:text-gold transition-colors text-left"
            >
              <FileSpreadsheet size={13} /> Export Full Report (Excel)
            </button>
            <button
              onClick={() => {
                onExportFull("PDF");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-text-muted
                         hover:bg-gold/5 hover:text-gold transition-colors text-left"
            >
              <FileText size={13} /> Export Full Report (PDF)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReportExportMenu;
