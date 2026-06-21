// src/components/settings/AppearanceSettings.jsx

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Monitor, Sun, Moon } from "lucide-react";
import { Button } from "../ui";
import useAppStore from "../../store/useAppStore";
import apexToast from "../../utils/toast";
import { ACCENT_COLORS } from "../../utils/accentColors";
import clsx from "clsx";

function SectionCard({ title, desc, children }) {
  return (
    <div className="bg-base border border-border rounded-2xl p-5 mb-4">
      <div className="mb-4 pb-3 border-b border-border">
        <p className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase">
          {title}
        </p>
        {desc && <p className="text-[10px] text-text-subtle mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// Accent colour options — gold is default, others are future

const FONT_SIZES = ["Compact", "Default", "Comfortable"];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية (Arabic) — Coming Soon", disabled: true },
];

function AppearanceSettings() {
  const { theme, toggleTheme } = useAppStore();
  const [accent, setAccent] = useState("gold");
  const [fontSize, setFontSize] = useState("Default");
  const [language, setLanguage] = useState("en");

  const accentColor = useAppStore((s) => s.accentColor);
  const setAccentColor = useAppStore((s) => s.setAccentColor);

  const handleSave = () => {
    apexToast.success(
      "Appearance Saved",
      "Your appearance preferences have been applied.",
    );
  };

  const THEMES = [
    { id: "dark", label: "Dark", icon: Moon, desc: "Deep navy · Gold accents" },
    {
      id: "light",
      label: "Light",
      icon: Sun,
      desc: "Clean white · Professional",
    },
    {
      id: "system",
      label: "System",
      icon: Monitor,
      desc: "Follows OS preference",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* Theme */}
      <SectionCard title="Theme" desc="Choose how Apex DriveOS looks for you">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {THEMES.map((t) => {
            // BUG-052 FIX: correct active state check
            const isActive = theme === t.id;

            return (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id === "system") {
                    // System: detect OS preference and apply
                    const prefersDark = window.matchMedia(
                      "(prefers-color-scheme: dark)",
                    ).matches;
                    const osTheme = prefersDark ? "dark" : "light";
                    if (theme !== osTheme) toggleTheme();
                  } else if (theme !== t.id) {
                    // Only toggle if not already this theme
                    toggleTheme();
                  }
                }}
                className={clsx(
                  "flex flex-col items-start gap-2.5 p-4 rounded-xl border transition-all text-left",
                  isActive
                    ? "border-gold/50 bg-gold/8"
                    : "border-border hover:border-gold/25 bg-card",
                )}
              >
                <div
                  className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isActive
                      ? "bg-gold/15 text-gold"
                      : "bg-base text-text-muted",
                  )}
                >
                  <t.icon size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p
                      className={clsx(
                        "text-xs font-bold",
                        isActive ? "text-gold" : "text-text-muted",
                      )}
                    >
                      {t.label}
                    </p>
                    {isActive && <Check size={11} className="text-gold" />}
                  </div>
                  <p className="text-[9px] text-text-subtle mt-0.5">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Accent Color */}
      <SectionCard
        title="Accent Color"
        desc="Choose the primary accent color used across buttons, charts, and highlights"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => c.default && setAccent(c.id)}
              className={clsx(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                !c.default && "opacity-40 cursor-not-allowed",
                accent === c.id
                  ? "border-gold/50 bg-gold/8"
                  : "border-border hover:border-border/80",
              )}
              title={c.default ? c.label : `${c.label} — Coming soon`}
              disabled={!c.default}
            >
              <div
                className="w-8 h-8 rounded-xl border border-white/10 shadow-sm"
                style={{ background: c.hex }}
              />
              <p className="text-[9px] text-text-subtle font-semibold">
                {c.label}
              </p>
              {accent === c.id && <Check size={10} className="text-gold" />}
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-extrabold text-text-primary mb-1">
          Accent Color
        </h3>
        <p className="text-[11px] text-text-subtle mb-5">
          Choose the primary accent color used across buttons, charts, and
          highlights.
        </p>

        <div className="grid grid-cols-5 gap-3">
          {ACCENT_COLORS.map((accent) => {
            const isActive = accentColor === accent.id;
            return (
              <button
                key={accent.id}
                onClick={() => setAccentColor(accent.id)}
                className="flex flex-col items-center gap-2 group"
                aria-label={`Set accent color to ${accent.label}`}
                aria-pressed={isActive}
              >
                <div
                  className="relative w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all"
                  style={{
                    background: accent.swatch,
                    borderColor: isActive ? accent.swatch : "transparent",
                    boxShadow: isActive
                      ? `0 0 0 3px ${accent.swatch}33`
                      : "none",
                  }}
                >
                  {isActive && (
                    <Check
                      size={18}
                      className="text-white drop-shadow"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold transition-colors ${
                    isActive
                      ? "text-text-primary"
                      : "text-text-subtle group-hover:text-text-muted"
                  }`}
                >
                  {accent.label}
                  {accent.isDefault && (
                    <span className="block text-[9px] text-text-subtle font-normal">
                      Default
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <SectionCard
        title="Display Density"
        desc="Controls spacing and font size across the dashboard"
      >
        <div className="flex gap-3 mb-4">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={clsx(
                "flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all",
                fontSize === size
                  ? "border-gold/50 text-gold bg-gold/8"
                  : "border-border text-text-muted hover:border-gold/25",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Language */}
      <SectionCard title="Language" desc="Dashboard display language">
        <div className="flex flex-col gap-2 mb-4">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => !l.disabled && setLanguage(l.code)}
              disabled={l.disabled}
              className={clsx(
                "flex items-center justify-between px-4 py-3 rounded-xl border",
                "text-xs font-semibold transition-all text-left",
                l.disabled && "opacity-40 cursor-not-allowed",
                language === l.code && !l.disabled
                  ? "border-gold/50 text-gold bg-gold/8"
                  : "border-border text-text-muted hover:border-gold/25",
              )}
            >
              {l.label}
              {language === l.code && !l.disabled && (
                <Check size={13} className="text-gold" />
              )}
            </button>
          ))}
        </div>
        <Button variant="primary" size="md" icon={Check} onClick={handleSave}>
          Save Appearance
        </Button>
      </SectionCard>
    </motion.div>
  );
}

export default AppearanceSettings;
