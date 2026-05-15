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
    "Estimated share controlled by the ten largest holders in the available Birdeye sample.",
  "Trade Pressure":
    "Whether observed trades lean toward buys, sells, or balanced activity.",
  "Liquidity Shock Proxy":
    "A heuristic estimate using price movement, volume, and sell pressure when direct pool-level liquidity data is incomplete.",
  "Security Flags":
    "Risk indicators from available token security or holder data. None means no elevated risk found in the current sample.",
  "OHLCV":
    "Open, High, Low, Close, and Volume candles used to replay price and volume over time.",
  "Holder Concentration":
    "How much supply appears concentrated in top holders. High concentration can increase launch risk.",
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
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
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
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-ldna-grid bg-ldna-bg/80 text-[10px] font-mono text-ldna-muted transition-colors hover:text-ldna-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ldna-accent/40"
      >
        <span className="sr-only">{label}</span>
        <span aria-hidden="true">i</span>
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "absolute top-full z-50 mt-2 w-64 border border-ldna-grid bg-ldna-panel px-3 py-2 text-xs text-ldna-text shadow-[0_0_20px_rgba(0,0,0,0.45)]",
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

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span>{label}</span>
      {text ? <InfoTooltip label={label} text={text} align={align} /> : null}
    </span>
  );
}
