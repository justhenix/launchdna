import { MOCK_LAUNCH_CASE } from "@/lib/mock/launch-case";
import type {
  EvidenceSeverity,
  LaunchArchetype,
  LaunchCase,
} from "@/types/launch-case";

type JsonRecord = Record<string, unknown>;

type ClassifyLaunchInput = {
  address: string;
  overview?: unknown;
  security?: unknown;
  ohlcv?: unknown;
  txs?: unknown;
  holders?: unknown;
  holderPositions?: unknown;
  endpointProof: LaunchCase["endpointProof"];
  dataMode: LaunchCase["dataMode"];
};

type NormalizedTrade = {
  side: "buy" | "sell" | "unknown";
  time?: number;
  volumeUsd: number;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function field(record: unknown, keys: string[]) {
  if (!isRecord(record)) {
    return undefined;
  }

  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function firstNumber(record: unknown, keys: string[]) {
  return toNumber(field(record, keys));
}

function firstString(record: unknown, keys: string[]) {
  const value = field(record, keys);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function firstStringOrList(record: unknown, keys: string[]) {
  const value = field(record, keys);
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  if (Array.isArray(value)) {
    const labels = value
      .filter((item): item is string => typeof item === "string" && item.trim() !== "")
      .map((item) => item.trim());
    return labels.length > 0 ? labels.join(", ") : undefined;
  }

  return undefined;
}

function toBool(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "yes", "1"].includes(value.toLowerCase());
  }

  if (typeof value === "number") {
    return value > 0;
  }

  return false;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function asPercent(value: unknown, fallback = 0) {
  const numeric = toNumber(value);
  if (numeric === undefined) {
    return fallback;
  }

  return clamp(Math.abs(numeric) <= 1 ? numeric * 100 : numeric);
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function extractArray(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of ["items", "tokens", "data", "txs", "transactions", "holders", "list"]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested.filter(isRecord);
    }

    if (isRecord(nested)) {
      const result = extractArray(nested);
      if (result.length > 0) {
        return result;
      }
    }
  }

  return [];
}

function timeLabel(value: unknown, fallbackIndex: number) {
  const numeric = toNumber(value);
  if (numeric === undefined || numeric <= 0) {
    return `Minute ${fallbackIndex + 1}`;
  }

  const ms = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? `Minute ${fallbackIndex + 1}` : date.toISOString().slice(11, 16);
}

function normalizeChart(ohlcv: unknown): LaunchCase["chart"] {
  const rows = extractArray(ohlcv);
  const chart = rows
    .map((row, index) => ({
      time: timeLabel(field(row, ["unix_time", "unixTime", "time", "timestamp", "t"]), index),
      price: firstNumber(row, ["c", "close", "price", "value"]) ?? 0,
      volume: firstNumber(row, ["v_usd", "vUsd", "volumeUsd", "volume_usd", "volume", "v"]) ?? 0,
    }))
    .filter((point) => point.price > 0 || point.volume > 0)
    .slice(-60);

  if (chart.length > 0) {
    return chart;
  }

  return Array.from({ length: 60 }).map((_, index) => ({
    time: `Minute ${index + 1}`,
    price: round(0.01 + index * 0.0002, 6),
    volume: 1000 + index * 20,
  }));
}

function tradeSide(row: JsonRecord): NormalizedTrade["side"] {
  const side = [
    firstString(row, ["side", "txSide", "tradeSide", "type", "txType"]),
    firstString(row, ["source", "eventType"]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (side.includes("buy")) {
    return "buy";
  }

  if (side.includes("sell")) {
    return "sell";
  }

  return "unknown";
}

function normalizeTradeTime(row: JsonRecord) {
  const direct = firstNumber(row, ["blockUnixTime", "block_unix_time", "unix_time", "timestamp", "time"]);
  if (direct !== undefined) {
    return direct > 1_000_000_000_000 ? Math.floor(direct / 1000) : direct;
  }

  const iso = firstString(row, ["blockTime", "block_time", "createdAt"]);
  if (!iso) {
    return undefined;
  }

  const parsed = new Date(iso).getTime();
  return Number.isNaN(parsed) ? undefined : Math.floor(parsed / 1000);
}

function normalizeTrades(txs: unknown): NormalizedTrade[] {
  return extractArray(txs).map((row) => ({
    side: tradeSide(row),
    time: normalizeTradeTime(row),
    volumeUsd: firstNumber(row, [
      "volumeUSD",
      "volume_usd",
      "amountUsd",
      "amount_usd",
      "valueUsd",
      "value",
    ]) ?? 0,
  }));
}

function normalizeHolders(holders: unknown, security: unknown): LaunchCase["holders"] {
  const top10FromSecurity = asPercent(field(security, ["top10HolderPercent", "top10HolderPercentage"]), 0);
  const rows = extractArray(holders).slice(0, 10);

  return rows.map((row, index) => {
    const explicitPercent = field(row, [
      "percentage",
      "percent",
      "share",
      "uiAmountPercent",
      "ui_amount_percent",
      "amountPercent",
      "amount_percent",
      "amountPercentage",
      "amount_percentage",
      "supplyPercent",
      "supply_percent",
      "percentOfSupply",
      "percent_of_supply",
    ]);
    const fallbackPercent = rows.length > 0 && top10FromSecurity > 0 ? top10FromSecurity / rows.length : 0;
    const tag = firstStringOrList(row, ["tag", "label", "labels", "tags", "nameTag", "ownerName", "type"]);

    return {
      address: firstString(row, [
        "owner",
        "address",
        "wallet",
        "holder",
        "ownerAddress",
        "owner_address",
        "holderAddress",
        "holder_address",
      ]) ?? `Holder ${index + 1}`,
      percentage: round(asPercent(explicitPercent, fallbackPercent), 2),
      ...(tag ? { tag } : {}),
    };
  });
}

function mergeHolderEvidence(
  holders: LaunchCase["holders"],
  taggedHolders: LaunchCase["holders"],
): LaunchCase["holders"] {
  const merged = holders.map((holder) => ({ ...holder }));

  for (const tagged of taggedHolders) {
    const existing = merged.find((holder) => holder.address === tagged.address);
    if (existing) {
      if (!existing.tag && tagged.tag) {
        existing.tag = tagged.tag;
      }
      continue;
    }

    if (tagged.tag) {
      merged.push(tagged);
    }
  }

  return merged.slice(0, 10);
}

function securityFlagCount(security: unknown) {
  const flags = [
    toBool(field(security, ["freezeable", "freezeAuthority", "isFreezeable"])),
    toBool(field(security, ["transferFeeEnable", "transferFeeEnabled"])),
    toBool(field(security, ["isMintable", "mintable"])),
    toBool(field(security, ["mutableMetadata", "isMutableMetadata"])),
    asPercent(field(security, ["creatorPercentage", "creatorPercent"])) > 20,
  ];

  return flags.filter(Boolean).length;
}

function holderTagFlags(holders: LaunchCase["holders"]) {
  const suspicious = ["creator", "sniper", "suspicious", "insider", "team", "flagged"];
  return holders.filter((holder) => {
    const tag = holder.tag?.toLowerCase() ?? "";
    return suspicious.some((needle) => tag.includes(needle));
  }).length;
}

function netPressure(buys: number, sells: number): LaunchCase["trades"]["netPressure"] {
  if (buys > sells * 1.2) {
    return "buy";
  }

  if (sells > buys * 1.2) {
    return "sell";
  }

  return "balanced";
}

function severityFromScore(score: number): EvidenceSeverity {
  if (score >= 70) {
    return "danger";
  }

  if (score >= 40) {
    return "warning";
  }

  return "good";
}

function summaryFor(archetype: LaunchArchetype, metrics: LaunchCase["metrics"]) {
  if (archetype === "Sniper Swarm") {
    return `Launch shows compressed early buying, ${round(metrics.top10HolderConcentration)}% top-holder concentration, and fast spike behavior.`;
  }

  if (archetype === "Liquidity Mirage") {
    return `Launch shows early volume shock, ${round(metrics.sellPressure)}% sell pressure, and price weakness after initial activity.`;
  }

  return `Launch shows smoother price action, lower concentration, and balanced buy/sell behavior compared with sniper or liquidity-shock patterns.`;
}

function dominantArchetype(scores: LaunchCase["scores"]): LaunchArchetype {
  const entries: [LaunchArchetype, number][] = [
    ["Sniper Swarm", scores.sniperSwarm],
    ["Liquidity Mirage", scores.liquidityMirage],
    ["Organic Grind", scores.organicGrind],
  ];

  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function chartStats(chart: LaunchCase["chart"]) {
  const first = chart[0]?.price ?? 0;
  const last = chart[chart.length - 1]?.price ?? first;
  const prices = chart.map((point) => point.price).filter((price) => price > 0);
  const max = prices.length > 0 ? Math.max(...prices) : first;
  const peakIndex = chart.findIndex((point) => point.price === max);
  const earlyMax = Math.max(...chart.slice(0, 10).map((point) => point.price), first);
  const priceChange1h = first > 0 ? ((last - first) / first) * 100 : 0;
  const fastSpike = first > 0 ? clamp(((earlyMax - first) / first) * 100) : 0;
  const collapse = max > 0 ? clamp(((max - last) / max) * 100) : 0;
  const earlyVolume = chart.slice(0, 10).map((point) => point.volume);
  const laterVolume = chart.slice(10).map((point) => point.volume);
  const maxEarlyVolume = earlyVolume.length > 0 ? Math.max(...earlyVolume) : 0;
  const avgLaterVolume = laterVolume.length > 0
    ? laterVolume.reduce((sum, volume) => sum + volume, 0) / laterVolume.length
    : maxEarlyVolume;
  const earlyVolumeSpike = avgLaterVolume > 0 ? clamp((maxEarlyVolume / avgLaterVolume - 1) * 25) : 0;

  return {
    priceChange1h,
    fastSpike,
    collapse,
    earlyVolumeSpike,
    peakIndex: peakIndex >= 0 ? peakIndex : 0,
  };
}

function tradeStats(trades: NormalizedTrade[]) {
  let buys = trades.filter((trade) => trade.side === "buy").length;
  let sells = trades.filter((trade) => trade.side === "sell").length;

  if (buys + sells === 0 && trades.length > 0) {
    buys = Math.ceil(trades.length / 2);
    sells = Math.floor(trades.length / 2);
  }

  if (buys + sells === 0) {
    buys = 1;
    sells = 1;
  }

  const timedTrades = trades.filter((trade) => trade.time !== undefined);
  const firstTradeTime = timedTrades.length > 0 ? Math.min(...timedTrades.map((trade) => trade.time ?? 0)) : undefined;
  const firstHourTrades = firstTradeTime === undefined
    ? timedTrades
    : timedTrades.filter((trade) => (trade.time ?? 0) <= firstTradeTime + 3600);
  const firstHourBuys = firstHourTrades.filter((trade) => trade.side === "buy");
  const earlyBuys = firstTradeTime === undefined
    ? []
    : firstHourBuys.filter((trade) => (trade.time ?? 0) <= firstTradeTime + 180);
  const earlyTradeCluster = firstTradeTime === undefined
    ? 0
    : firstHourTrades.filter((trade) => (trade.time ?? 0) <= firstTradeTime + 180).length;
  const earlyBuyCompression = firstHourBuys.length > 0
    ? (earlyBuys.length / firstHourBuys.length) * 100
    : 0;
  const buyClusterDensity = firstHourTrades.length > 0
    ? (earlyTradeCluster / firstHourTrades.length) * 100
    : 0;

  return {
    buys,
    sells,
    earlyBuyCompression,
    buyClusterDensity,
    buyVolumeUsd: trades
      .filter((trade) => trade.side === "buy")
      .reduce((sum, trade) => sum + trade.volumeUsd, 0),
    sellVolumeUsd: trades
      .filter((trade) => trade.side === "sell")
      .reduce((sum, trade) => sum + trade.volumeUsd, 0),
  };
}

function cloneEndpointProof(endpointProof: LaunchCase["endpointProof"]) {
  return endpointProof.map((proof) => ({ ...proof }));
}

export function createMockLaunchCase(
  address: string,
  endpointProof: LaunchCase["endpointProof"] = MOCK_LAUNCH_CASE.endpointProof,
  dataMode: LaunchCase["dataMode"] = "mock",
): LaunchCase {
  return {
    ...MOCK_LAUNCH_CASE,
    token: {
      ...MOCK_LAUNCH_CASE.token,
      address: address || MOCK_LAUNCH_CASE.token.address,
    },
    evidence: MOCK_LAUNCH_CASE.evidence.map((item) => ({ ...item })),
    chart: MOCK_LAUNCH_CASE.chart.map((item) => ({ ...item })),
    timeline: MOCK_LAUNCH_CASE.timeline.map((item) => ({ ...item })),
    holders: MOCK_LAUNCH_CASE.holders.map((item) => ({ ...item })),
    endpointProof: cloneEndpointProof(endpointProof),
    generatedAt: new Date().toISOString(),
    dataMode,
  };
}

export function classifyLaunch(input: ClassifyLaunchInput): LaunchCase {
  const overview = isRecord(input.overview) ? input.overview : {};
  const security = isRecord(input.security) ? input.security : {};
  const chart = normalizeChart(input.ohlcv);
  const normalizedHolders = normalizeHolders(input.holders, security);
  const taggedHolders = normalizeHolders(input.holderPositions, security);
  const holders = normalizedHolders.length > 0
    ? mergeHolderEvidence(normalizedHolders, taggedHolders)
    : taggedHolders;
  const trades = normalizeTrades(input.txs);
  const tradeMetrics = tradeStats(trades);
  const priceMetrics = chartStats(chart);
  const top10HolderConcentration = holders.length > 0
    ? holders.slice(0, 10).reduce((sum, holder) => sum + holder.percentage, 0)
    : asPercent(field(security, ["top10HolderPercent", "top10HolderPercentage"]), 0);
  const flaggedHolderCount = holderTagFlags(holders) + securityFlagCount(security);
  const totalTrades = trades.length;
  const totalHolders = firstNumber(overview, ["holder", "holderCount", "holders", "numberHolders"]) ?? holders.length;
  const sellPressure = ((tradeMetrics.sells / (tradeMetrics.buys + tradeMetrics.sells)) * 100);
  const buySellRatio = tradeMetrics.sells === 0 ? tradeMetrics.buys : tradeMetrics.buys / tradeMetrics.sells;
  const liquidityShock = clamp(
    priceMetrics.collapse * 0.45 +
    priceMetrics.earlyVolumeSpike * 0.35 +
    sellPressure * 0.2,
  );
  const weakHolderQuality = clamp(top10HolderConcentration + flaggedHolderCount * 12);

  const metrics: LaunchCase["metrics"] = {
    earlyBuyCompression: round(tradeMetrics.earlyBuyCompression),
    top10HolderConcentration: round(top10HolderConcentration, 1),
    buySellRatio: round(buySellRatio, 2),
    priceChange1h: round(firstNumber(overview, ["priceChange1hPercent", "priceChange1h"]) ?? priceMetrics.priceChange1h, 2),
    sellPressure: round(sellPressure),
    liquidityShock: round(liquidityShock),
    flaggedHolderCount,
    totalTrades,
    totalHolders: Math.round(totalHolders),
  };

  const scores: LaunchCase["scores"] = {
    sniperSwarm: round(clamp(
      tradeMetrics.earlyBuyCompression * 0.32 +
      top10HolderConcentration * 0.24 +
      priceMetrics.fastSpike * 0.18 +
      tradeMetrics.buyClusterDensity * 0.16 +
      Math.min(flaggedHolderCount * 10, 25),
    )),
    liquidityMirage: round(clamp(
      priceMetrics.earlyVolumeSpike * 0.25 +
      sellPressure * 0.24 +
      priceMetrics.collapse * 0.26 +
      liquidityShock * 0.2 +
      weakHolderQuality * 0.05,
    )),
    organicGrind: round(clamp(
      82 -
      Math.abs(50 - sellPressure) * 0.55 -
      top10HolderConcentration * 0.45 -
      priceMetrics.collapse * 0.25 -
      Math.min(flaggedHolderCount * 10, 30) +
      Math.min(Math.log10(Math.max(totalHolders, 1)) * 5, 15),
    )),
  };

  const archetype = dominantArchetype(scores);
  const confidence = clamp(Math.max(scores.sniperSwarm, scores.liquidityMirage, scores.organicGrind), 55, 95);
  const securityFlagsDetected = flaggedHolderCount > 0 ? "Detected" : "None";

  return {
    token: {
      address: firstString(overview, ["address", "tokenAddress"]) ?? input.address,
      name: firstString(overview, ["name", "tokenName"]) ?? "Unknown Token",
      symbol: firstString(overview, ["symbol", "tokenSymbol"]) ?? "UNKNOWN",
      chain: "solana",
      logoURI: firstString(overview, ["logoURI", "logoUri", "logo", "icon"]),
    },
    classification: {
      archetype,
      confidence: Math.round(confidence),
      summary: summaryFor(archetype, metrics),
    },
    evidence: [
      {
        label: "Early Buy Compression",
        value: `${metrics.earlyBuyCompression}%`,
        severity: severityFromScore(metrics.earlyBuyCompression),
        explanation: `${metrics.earlyBuyCompression}% of first-hour buys clustered into the first 3 minutes when timestamps were available.`,
      },
      {
        label: "Top 10 Holder Concentration",
        value: `${metrics.top10HolderConcentration}%`,
        severity: severityFromScore(metrics.top10HolderConcentration),
        explanation: "Top holder share estimated from holder endpoint, with security endpoint as fallback.",
      },
      {
        label: "Trade Pressure",
        value: netPressure(tradeMetrics.buys, tradeMetrics.sells).toUpperCase(),
        severity: severityFromScore(metrics.sellPressure),
        explanation: `${tradeMetrics.buys} buys vs ${tradeMetrics.sells} sells in normalized Birdeye trade data.`,
      },
      {
        label: "Liquidity Shock Proxy",
        value: `${metrics.liquidityShock}%`,
        severity: severityFromScore(metrics.liquidityShock),
        explanation: "Proxy combines price collapse, early volume spike, and sell pressure because pool-level liquidity history may be absent.",
      },
      {
        label: "Security Flags",
        value: securityFlagsDetected,
        severity: flaggedHolderCount > 2 ? "danger" : flaggedHolderCount > 0 ? "warning" : "good",
        explanation: `${flaggedHolderCount} holder tags or token security fields indicated elevated risk.`,
      },
    ],
    metrics,
    scores,
    chart,
    timeline: [
      {
        time: "0m",
        label: "First Sample",
        detail: "Birdeye sample window opened for launch classification.",
        severity: "neutral",
      },
      {
        time: "3m",
        label: "Early Buy Window",
        detail: `${metrics.earlyBuyCompression}% early buy compression detected.`,
        severity: severityFromScore(metrics.earlyBuyCompression),
      },
      {
        time: `${priceMetrics.peakIndex + 1}m`,
        label: "Price Peak",
        detail: `${round(priceMetrics.fastSpike)}% fast spike score before post-peak action.`,
        severity: severityFromScore(priceMetrics.fastSpike),
      },
      {
        time: "60m",
        label: "Closeout",
        detail: `${round(metrics.priceChange1h, 2)}% price change with ${metrics.sellPressure}% sell pressure.`,
        severity: metrics.priceChange1h < -25 ? "danger" : metrics.priceChange1h < 0 ? "warning" : "good",
      },
    ],
    holders,
    trades: {
      buys: tradeMetrics.buys,
      sells: tradeMetrics.sells,
      buyVolumeUsd: round(tradeMetrics.buyVolumeUsd, 2),
      sellVolumeUsd: round(tradeMetrics.sellVolumeUsd, 2),
      netPressure: netPressure(tradeMetrics.buys, tradeMetrics.sells),
    },
    endpointProof: cloneEndpointProof(input.endpointProof),
    generatedAt: new Date().toISOString(),
    dataMode: input.dataMode,
  };
}
