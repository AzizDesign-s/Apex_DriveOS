// src/components/ui/Tooltip.jsx
//
// Reusable tooltip wrapper using Radix UI.
// Usage anywhere in the app:
//   <Tooltip content="Dashboard">
//     <button>...</button>
//   </Tooltip>

import * as RadixTooltip from "@radix-ui/react-tooltip";

// Provider wraps the whole app — add to App.jsx (see below)
export function TooltipProvider({ children }) {
  return (
    <RadixTooltip.Provider delayDuration={300} skipDelayDuration={100}>
      {children}
    </RadixTooltip.Provider>
  );
}

// The actual Tooltip component
function Tooltip({ children, content, side = "right", disabled = false }) {
  // If no content or disabled, just render children as-is
  if (!content || disabled) return <>{children}</>;

  return (
    <RadixTooltip.Root>
      {/* The element that triggers the tooltip */}
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>

      {/* Where the tooltip renders — portalled to body to avoid clipping */}
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={8}
          className="
            z-50 px-2.5 py-1.5
            bg-card border border-border
            rounded-lg shadow-glass
            text-xs font-medium text-text-primary
            tracking-wide whitespace-nowrap
            animate-in fade-in-0 zoom-in-95
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=closed]:zoom-out-95
          "
        >
          {content}
          {/* Small arrow pointing at the trigger */}
          <RadixTooltip.Arrow className="fill-border" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

export default Tooltip;
