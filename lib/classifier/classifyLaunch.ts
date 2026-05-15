import { MOCK_LAUNCH_CASE } from "@/lib/mock/launch-case";
import { isReadableTokenText, sanitizeTokenName, sanitizeTokenSymbol } from "@/lib/listings";
import type {
  EvidenceSeverity,
  LaunchArchetype,
  LaunchCase,
} from "@/types/launch-case";

type JsonRecord = Record<string, unknown>;

type ClassifyLaunchInput = {
  address: string;
  name?: string;
  symbol?: string;
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

type NormalizedChart = {
  chart: LaunchCase["chart"];
  hasOhlcvData: boolean;
};

type TradeStats = {
  buys: number;
  sells: number;
  earlyBuyCompression: number;
  buyClusterDensity: number;
  buyVolumeUsd: number;
  sellVolumeUsd: number;
  hasTradeData: boolean;
  hasTimedTrades: boolean;
};

type DataQuality = {
  hasHolderShareData: boolean;
  hasTradeData: boolean;
  hasOhlcvData: boolean;
};

const MEANINGFUL_HOLDER_SHARE = 0.01;

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

export function safeNumber(value: unknown, fallback = 0) {
  const numeric = toNumber(value);
  return numeric === undefined ? fallback : numeric;
}

export function clampPercent(value: unknown) {
  return clamp(safeNumber(value), 0, 100);
}

export function normalizeHolderShare(value: unknown, fallback = 0) {
  const numeric = toNumber(value);
  if (numeric === undefined) {
    return clampPercent(fallback);
  }

  return clampPercent(Math.abs(numeric) <= 1 ? numeric * 100 : numeric);
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatPercent(value: unknown, digits = 0) {
  const rounded = round(clampPercent(value), digits);
  return `${rounded}%`;
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

function neutralChart(): LaunchCase["chart"] {
  return Array.from({ length: 60 }).map((_, index) => ({
    time: `Minute ${index + 1}`,
    price: 1,
    volume: 0,
  }));
}

function normalizeChart(ohlcv: unknown): NormalizedChart {
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
    return {
      chart,
      hasOhlcvData: true,
    };
  }

  return {
    chart: neutralChart(),
    hasOhlcvData: false,
  };
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
    volumeUsd: Math.max(0, firstNumber(row, [
      "volumeUSD",
      "volume_usd",
      "amountUsd",
      "amount_usd",
      "valueUsd",
      "value",
    ]) ?? 0),
  }));
}

function holderAddress(row: JsonRecord) {
  return firstString(row, [
    "owner",
    "address",
    "wallet",
    "walletAddress",
    "wallet_address",
    "holder",
    "ownerAddress",
    "owner_address",
    "holderAddress",
    "holder_address",
  ]);
}

function holderTag(row: JsonRecord) {
  return firstStringOrList(row, [
    "tag",
    "label",
    "labels",
    "tags",
    "nameTag",
    "name_tag",
    "addressLabel",
    "address_label",
    "ownerName",
    "owner_name",
  ]);
}

function capHolderShares(holders: LaunchCase["holders"]) {
  const capped = holders.map((holder) => ({
    ...holder,
    percentage: round(clampPercent(holder.percentage), 2),
  }));
  const total = capped.reduce((sum, holder) => sum + holder.percentage, 0);

  if (total <= 100 || total <= 0) {
    return capped;
  }

  let remaining = 100;

  return capped.map((holder, index) => {
    const scaled = index === capped.length - 1
      ? remaining
      : Math.min(round((holder.percentage / total) * 100, 2), remaining);
    remaining = round(Math.max(0, remaining - scaled), 2);

    return {
      ...holder,
      percentage: scaled,
    };
  });
}

function normalizeHolders(holders: unknown): LaunchCase["holders"] {
  const rows = extractArray(holders).slice(0, 10);

  const normalized = rows.flatMap((row) => {
    const address = holderAddress(row);
    if (!address) {
      return [];
    }

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
    const tag = holderTag(row);

    return [{
      address,
      percentage: round(normalizeHolderShare(explicitPercent, 0), 2),
      ...(tag ? { tag } : {}),
    }];
  });

  return capHolderShares(normalized);
}

function normalizeLabeledWallets(...sources: unknown[]): NonNullable<LaunchCase["labeledWallets"]> {
  const seen = new Set<string>();
  const labeledWallets: NonNullable<LaunchCase["labeledWallets"]> = [];

  for (const source of sources) {
    for (const row of extractArray(source)) {
      const address = holderAddress(row);
      const tag = holderTag(row);

      if (!address || !tag || seen.has(address)) {
        continue;
      }

      seen.add(address);
      labeledWallets.push({ address, tag });
    }
  }

  return labeledWallets.slice(0, 10);
}

function mergeHolderLabels(
  holders: LaunchCase["holders"],
  labeledWallets: NonNullable<LaunchCase["labeledWallets"]>,
): LaunchCase["holders"] {
  const merged = holders.map((holder) => ({ ...holder }));

  for (const labeled of labeledWallets) {
    const existing = merged.find((holder) => holder.address === labeled.address);
    if (existing && !existing.tag) {
      existing.tag = labeled.tag;
    }
  }

  return capHolderShares(merged);
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

function holderTagFlags(labeledWallets: NonNullable<LaunchCase["labeledWallets"]>) {
  const suspicious = ["creator", "sniper", "bundler", "bundle", "suspicious", "insider", "team", "flagged"];
  return labeledWallets.filter((wallet) => {
    const tag = wallet.tag.toLowerCase();
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

function summaryFor(archetype: LaunchArchetype, metrics: LaunchCase["metrics"], quality: DataQuality) {
  if (archetype === "Sniper Swarm") {
    return `Launch shows ${quality.hasTradeData ? "observed" : "insufficient"} early-buy compression, ${quality.hasHolderShareData ? formatPercent(metrics.top10HolderConcentration) : "unavailable"} holder concentration, and ${quality.hasOhlcvData ? "observed" : "insufficient"} spike evidence.`;
  }

  if (archetype === "Liquidity Mirage") {
    return `Launch shows ${quality.hasOhlcvData ? "observed/proxy" : "insufficient"} volume shock evidence, ${formatPercent(metrics.sellPressure)} sell pressure, and ${quality.hasOhlcvData ? "observed" : "insufficient"} price weakness evidence.`;
  }

  return `Available data shows smoother price action, ${quality.hasHolderShareData ? "lower holder concentration" : "unavailable holder concentration"}, and ${quality.hasTradeData ? "observed" : "insufficient"} buy/sell balance compared with sniper or liquidity-shock patterns.`;
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

function tradeStats(trades: NormalizedTrade[]): TradeStats {
  const buys = trades.filter((trade) => trade.side === "buy").length;
  const sells = trades.filter((trade) => trade.side === "sell").length;
  const hasTradeData = buys + sells > 0;

  const timedTrades = trades.filter((trade) => trade.time !== undefined);
  const firstTradeTime = timedTrades.length > 0 ? Math.min(...timedTrades.map((trade) => trade.time ?? 0)) : undefined;
  const firstHourTrades = firstTradeTime === undefined
    ? []
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
    hasTradeData,
    hasTimedTrades: timedTrades.length > 0,
  };
}

function cloneEndpointProof(endpointProof: LaunchCase["endpointProof"]) {
  return endpointProof.map((proof) => ({ ...proof }));
}

export function createMockLaunchCase(
  address: string,
  endpointProof: LaunchCase["endpointProof"] = MOCK_LAUNCH_CASE.endpointProof,
  dataMode: LaunchCase["dataMode"] = "mock",
  metadata: { name?: string; symbol?: string } = {},
): LaunchCase {
  return {
    ...MOCK_LAUNCH_CASE,
    token: {
      ...MOCK_LAUNCH_CASE.token,
      address: address || MOCK_LAUNCH_CASE.token.address,
      name: metadata.name ?? MOCK_LAUNCH_CASE.token.name,
      symbol: metadata.symbol ?? MOCK_LAUNCH_CASE.token.symbol,
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
  const chartResult = normalizeChart(input.ohlcv);
  const chart = chartResult.chart;
  const normalizedHolders = normalizeHolders(input.holders);
  const labeledWallets = normalizeLabeledWallets(input.holders, input.holderPositions);
  const holdersWithLabels = mergeHolderLabels(normalizedHolders, labeledWallets);
  const holders = holdersWithLabels.filter((holder) => holder.percentage > MEANINGFUL_HOLDER_SHARE);
  const trades = normalizeTrades(input.txs);
  const tradeMetrics = tradeStats(trades);
  const priceMetrics = chartStats(chart);
  const hasHolderShareData = holders.some((holder) => holder.percentage > MEANINGFUL_HOLDER_SHARE);
  const top10HolderConcentration = hasHolderShareData
    ? clampPercent(holders.slice(0, 10).reduce((sum, holder) => sum + holder.percentage, 0))
    : 0;
  const tokenSecurityFlagCount = securityFlagCount(security);
  const flaggedHolderCount = holderTagFlags(labeledWallets) + tokenSecurityFlagCount;
  const totalTrades = trades.length;
  const totalHolders = firstNumber(overview, ["holder", "holderCount", "holders", "numberHolders"]) ?? holders.length;
  const tradeSideCount = tradeMetrics.buys + tradeMetrics.sells;
  const sellPressure = tradeSideCount > 0 ? (tradeMetrics.sells / tradeSideCount) * 100 : 0;
  const buySellRatio = tradeMetrics.sells === 0 ? tradeMetrics.buys : tradeMetrics.buys / tradeMetrics.sells;
  const liquidityShock = clamp(
    priceMetrics.collapse * 0.45 +
    priceMetrics.earlyVolumeSpike * 0.35 +
    sellPressure * 0.2,
  );
  const weakHolderQuality = clamp(top10HolderConcentration + tokenSecurityFlagCount * 12);

  const metrics: LaunchCase["metrics"] = {
    earlyBuyCompression: round(clampPercent(tradeMetrics.earlyBuyCompression)),
    top10HolderConcentration: round(top10HolderConcentration, 1),
    buySellRatio: round(buySellRatio, 2),
    priceChange1h: round(clamp(firstNumber(overview, ["priceChange1hPercent", "priceChange1h"]) ?? priceMetrics.priceChange1h, -100, 100), 2),
    sellPressure: round(clampPercent(sellPressure)),
    liquidityShock: round(clampPercent(liquidityShock)),
    flaggedHolderCount,
    totalTrades,
    totalHolders: Math.round(totalHolders),
  };

  const scores: LaunchCase["scores"] = {
    sniperSwarm: round(clamp(
      tradeMetrics.earlyBuyCompression * 0.32 +
      (hasHolderShareData ? top10HolderConcentration * 0.24 : 0) +
      priceMetrics.fastSpike * 0.18 +
      tradeMetrics.buyClusterDensity * 0.16 +
      Math.min(tokenSecurityFlagCount * 10, 25),
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
      (hasHolderShareData ? top10HolderConcentration * 0.45 : 0) -
      priceMetrics.collapse * 0.25 -
      Math.min(tokenSecurityFlagCount * 10, 30) +
      Math.min(Math.log10(Math.max(totalHolders, 1)) * 5, 15),
    )),
  };

  const archetype = dominantArchetype(scores);
  const quality = {
    hasHolderShareData,
    hasTradeData: tradeMetrics.hasTradeData,
    hasOhlcvData: chartResult.hasOhlcvData,
  };
  const dataQuality = [quality.hasHolderShareData, quality.hasTradeData, quality.hasOhlcvData].filter(Boolean).length;
  const confidenceCap = quality.hasHolderShareData && quality.hasTradeData && quality.hasOhlcvData
    ? 95
    : dataQuality >= 2
      ? 75
      : 65;
  const confidence = clamp(Math.max(scores.sniperSwarm, scores.liquidityMirage, scores.organicGrind), 55, confidenceCap);
  const securityFlagsDetected = flaggedHolderCount > 0 ? "Detected" : "None";
  const holderEvidenceText = hasHolderShareData
    ? "Observed from Birdeye holder share rows; tag-only wallet labels excluded from concentration."
    : "Unavailable in current Birdeye holder sample; tag-only wallet labels excluded from concentration.";
  const tradeEvidenceText = tradeMetrics.hasTradeData
    ? `${tradeMetrics.buys} observed buys vs ${tradeMetrics.sells} observed sells in normalized Birdeye trade data.`
    : "Insufficient Birdeye trade rows; neutral trade pressure used.";
  const ohlcvEvidenceText = chartResult.hasOhlcvData
    ? "Proxy combines observed OHLCV movement, early volume, and trade pressure."
    : "Insufficient OHLCV rows; neutral chart fallback used and confidence capped.";

  const overviewName = firstString(overview, ["name", "tokenName"]);
  const overviewSymbol = firstString(overview, ["symbol", "tokenSymbol"]);
  const preferredName = isReadableTokenText(overviewName) ? overviewName : input.name;
  const preferredSymbol = isReadableTokenText(overviewSymbol) ? overviewSymbol : input.symbol;
  const safeName = sanitizeTokenName(preferredName, preferredSymbol, input.address);
  const safeSymbol = sanitizeTokenSymbol(preferredSymbol, preferredName, input.address);

  return {
    token: {
      address: firstString(overview, ["address", "tokenAddress"]) ?? input.address,
      name: safeName,
      symbol: safeSymbol,
      chain: "solana",
      logoURI: firstString(overview, ["logoURI", "logoUri", "logo", "icon"]),
    },
    classification: {
      archetype,
      confidence: Math.round(confidence),
      summary: summaryFor(archetype, metrics, quality),
    },
    evidence: [
      {
        label: "Early Buy Compression",
        value: formatPercent(metrics.earlyBuyCompression),
        severity: severityFromScore(metrics.earlyBuyCompression),
        explanation: tradeMetrics.hasTimedTrades
          ? `${formatPercent(metrics.earlyBuyCompression)} of observed first-hour buys clustered into the first 3 minutes.`
          : "Insufficient Birdeye timestamps; neutral early-buy compression used.",
      },
      {
        label: "Top 10 Holder Concentration",
        value: hasHolderShareData ? formatPercent(metrics.top10HolderConcentration, 1) : "Unavailable",
        severity: hasHolderShareData ? severityFromScore(metrics.top10HolderConcentration) : "neutral",
        explanation: holderEvidenceText,
      },
      {
        label: "Trade Pressure",
        value: netPressure(tradeMetrics.buys, tradeMetrics.sells).toUpperCase(),
        severity: severityFromScore(metrics.sellPressure),
        explanation: tradeEvidenceText,
      },
      {
        label: "Liquidity Shock Proxy",
        value: formatPercent(metrics.liquidityShock),
        severity: severityFromScore(metrics.liquidityShock),
        explanation: ohlcvEvidenceText,
      },
      {
        label: "Security Flags",
        value: securityFlagsDetected,
        severity: flaggedHolderCount > 2 ? "danger" : flaggedHolderCount > 0 ? "warning" : "good",
        explanation: flaggedHolderCount > 0
          ? `${flaggedHolderCount} observed Birdeye holder tags or token security fields indicated elevated risk.`
          : "No Birdeye holder tags or token security fields indicated elevated risk.",
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
        detail: tradeMetrics.hasTimedTrades
          ? `${formatPercent(metrics.earlyBuyCompression)} observed early buy compression.`
          : "Insufficient trade timestamps for early buy compression.",
        severity: severityFromScore(metrics.earlyBuyCompression),
      },
      {
        time: `${priceMetrics.peakIndex + 1}m`,
        label: "Price Peak",
        detail: chartResult.hasOhlcvData
          ? `${formatPercent(priceMetrics.fastSpike)} observed fast spike score before post-peak action.`
          : "Insufficient OHLCV data for peak replay.",
        severity: severityFromScore(priceMetrics.fastSpike),
      },
      {
        time: "60m",
        label: "Closeout",
        detail: `${round(metrics.priceChange1h, 2)}% price change with ${formatPercent(metrics.sellPressure)} observed/proxy sell pressure.`,
        severity: metrics.priceChange1h < -25 ? "danger" : metrics.priceChange1h < 0 ? "warning" : "good",
      },
    ],
    holders,
    ...(labeledWallets.length > 0 ? { labeledWallets } : {}),
    trades: {
      buys: tradeMetrics.buys,
      sells: tradeMetrics.sells,
      buyVolumeUsd: round(tradeMetrics.buyVolumeUsd, 2),
      sellVolumeUsd: round(tradeMetrics.sellVolumeUsd, 2),
      netPressure: netPressure(tradeMetrics.buys, tradeMetrics.sells),
    },
    endpointProof: cloneEndpointProof(input.endpointProof),
    generatedAt: new Date().toISOString(),
    dataMode: input.dataMode === "live" && dataQuality === 3 ? "live" : input.dataMode === "mock" ? "mock" : "partial",
  };
}
