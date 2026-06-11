// src/components/ui/Button.jsx
//
// The ONLY button component used across the entire app.
// Every module uses this — no more one-off inline buttons.
//
// VARIANTS:
//   primary  → gold gradient (main CTAs like "Add Car", "Save")
//   ghost    → outlined (secondary actions like "Cancel")
//   danger   → red outline (destructive actions like "Delete")
//   subtle   → minimal (tertiary actions)
//
// SIZES: sm | md | lg
// ICONS: pass any Lucide icon as `icon` prop (renders left of label)
//        pass `iconRight` for right-side icon

import { motion } from "framer-motion";
import clsx from "clsx";

const VARIANTS = {
  primary: `bg-gradient-to-r from-gold-dark via-gold to-gold-light
            text-base font-bold border-none
            hover:shadow-gold-lg disabled:opacity-50`,

  ghost: `bg-transparent border border-border text-text-muted
            hover:border-gold/40 hover:text-gold
            disabled:opacity-40`,

  danger: `bg-transparent border border-rose-400/30 text-rose-400
            hover:bg-rose-400/8 hover:border-rose-400/50
            disabled:opacity-40`,

  subtle: `bg-transparent border border-border text-text-subtle
            hover:text-text-muted hover:border-border
            disabled:opacity-40`,

  sky: `bg-transparent border border-sky-accent/30 text-sky-accent
            hover:bg-sky-accent/8 hover:border-sky-accent/50
            disabled:opacity-40`,
};

const SIZES = {
  sm: "px-3 py-1.5 text-[10px] rounded-lg gap-1.5  ",
  md: "px-4 py-2   text-xs    rounded-xl gap-2 ",
  lg: "px-5 py-2.5 text-sm    rounded-xl gap-2 ",
};

function Button({
  children,
  variant = "ghost",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  onClick,
  className = "",
  type = "button",
  fullWidth = false,
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      className={clsx(
        "inline-flex items-center justify-center font-semibold",
        "transition-all duration-200 select-none",
        "tracking-wide whitespace-nowrap",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {/* Loading spinner */}
      {loading && (
        <motion.span
          className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Left icon */}
      {!loading && Icon && <Icon size={size === "sm" ? 12 : 14} />}

      {/* Label */}
      {children}

      {/* Right icon */}
      {!loading && IconRight && <IconRight size={size === "sm" ? 12 : 14} />}
    </motion.button>
  );
}

export default Button;
