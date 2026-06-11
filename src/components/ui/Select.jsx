// src/components/ui/Select.jsx
// Styled dropdown — fixes the ugly native select look

import { ChevronDown } from "lucide-react";
import clsx from "clsx";

function Select({
  label,
  value,
  onChange,
  options = [], // [{ value, label }] OR ['string', 'string']
  placeholder,
  error,
  required,
  disabled,
  className = "",
}) {
  // Normalize options to { value, label } format
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[9px] font-bold tracking-[0.2em] text-text-subtle uppercase">
          {label}
          {required && <span className="text-gold ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            "w-full bg-card border rounded-xl",
            "text-xs font-[Montserrat] text-text-primary",
            "pl-3 pr-9 py-2.5",
            "outline-none transition-all duration-200",

            "appearance-none cursor-pointer ",
            error
              ? "border-rose-400/50 focus:border-rose-400"
              : "border-border focus:border-gold/50 focus:ring-1 focus:ring-gold/15",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          {placeholder && (
            <option value="" className="text-text-subtle">
              {placeholder}
            </option>
          )}
          {normalized.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     text-text-subtle pointer-events-none"
        />
      </div>

      {error && <p className="text-[10px] text-rose-400">{error}</p>}
    </div>
  );
}

export default Select;
