"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export const TOOLTIP_COPY: Record<string, string> = {
  "Sniper Swarm":
    "A launch pattern where many early wallets buy in a tight time window, often before organic holder growth.",
  "Organic Grind":
    "A slower launch pattern with smoother price action, lower concentration, and more balanced buy/sell behavior.",
  "Liquidity Mirage":
    "A launch pattern that looks active from volume or price movement, but shows weak liquidity or sell-pressure structure.",
  "Early Buy Compression":
    "How much first-hour buying happened in the first few minutes. High values can indicate rushed or coordinated entry.",
  "Top 10 Holder Concentration":
    "Estimated share controlled by the ten largest holders with meaningful share data in the available Birdeye sample.",
  "Trade Pressure":
    "Whether observed trades lean toward buys, sells, or balanced activity.",
  "Liquidity Shock Proxy":
    "A heuristic estimate using price movement, volume, and sell pressure when direct pool-level liquidity data is incomplete.",
  "Security Flags":
    "Risk indicators from available token security or holder data. None means no elevated risk found in the current sample.",
  "OHLCV":
    "Open, High, Low, Close, and Volume candles used to replay price and volume over time.",
  "Holder Concentration":
    "Supply concentration uses holder share data only. Tagged wallets without share data are shown separately.",
  "Partial Evidence":
    "Some Birdeye endpoints returned incomplete data, usually because the token is very new.",
  "Birdeye Snapshot":
    "A stable case file generated from Birdeye-derived data so judges can review the product even when live tokens are incomplete.",
};

type TooltipAlign = "start" | "center" | "end";

type InfoTooltipProps = {
  label: string;
  text: string;
  align?: TooltipAlign;
  className?: string;
};

export function InfoTooltip({ label, text, align = "center", className }: InfoTooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const alignClass =
    align === "start"
      ? "left-0"
      : align === "end"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        aria-label={`Information about ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            event.currentTarget.blur();
          }
        }}
        className="cursor-help decoration-ldna-muted/50 decoration-dotted underline underline-offset-4 hover:decoration-ldna-accent transition-colors focus-visible:outline-none focus-visible:decoration-ldna-accent"
      >
        <span className="sr-only">Information about {label}: </span>
        {label}
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "absolute top-full z-50 mt-2 w-64 border border-ldna-grid bg-ldna-panel px-3 py-2 text-xs text-ldna-text shadow-[0_0_20px_rgba(0,0,0,0.45)] normal-case tracking-normal",
          "transition-opacity",
          alignClass,
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {text}
      </span>
    </span>
  );
}

type TooltipLabelProps = {
  label: string;
  className?: string;
  align?: TooltipAlign;
};

export function TooltipLabel({ label, className, align = "center" }: TooltipLabelProps) {
  const text = TOOLTIP_COPY[label];

  if (!text) {
    return <span className={className}>{label}</span>;
  }

  return (
    <InfoTooltip label={label} text={text} align={align} className={className} />
  );
}
