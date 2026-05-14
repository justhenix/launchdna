import type { LaunchCase } from "@/types/launch-case";

export type { EvidenceSeverity, LaunchArchetype, LaunchCase } from "@/types/launch-case";

export const MOCK_LAUNCH_CASE: LaunchCase = {
  token: {
    address: "Mock11111111111111111111111111111111111111",
    name: "Mock Token",
    symbol: "MOCK",
    chain: "solana",
  },
  classification: {
    archetype: "Sniper Swarm",
    confidence: 84,
    summary: "High probability of coordinated sniper activity in the first 3 minutes, followed by heavy sell pressure leading to price collapse.",
  },
  evidence: [
    {
      label: "Early Buy Compression",
      value: "61%",
      severity: "danger",
      explanation: "61% of all buys in the first hour happened within the first 3 minutes.",
    },
    {
      label: "Top 10 Holder Concentration",
      value: "42%",
      severity: "warning",
      explanation: "Top 10 wallets control 42% of circulating supply.",
    },
    {
      label: "Sell Pressure",
      value: "Extreme",
      severity: "danger",
      explanation: "Massive sell walls appeared immediately after the initial price spike.",
    },
    {
      label: "Security Flags",
      value: "Detected",
      severity: "warning",
      explanation: "Suspicious contract behavior and mutable metadata detected.",
    },
  ],
  metrics: {
    earlyBuyCompression: 61,
    top10HolderConcentration: 42,
    buySellRatio: 0.35,
    priceChange1h: -45.2,
    sellPressure: 85,
    liquidityShock: 72,
    flaggedHolderCount: 14,
    totalTrades: 3420,
    totalHolders: 1105,
  },
  scores: {
    sniperSwarm: 84,
    liquidityMirage: 45,
    organicGrind: 12,
  },
  chart: Array.from({ length: 60 }).map((_, i) => {
    // Mocking an initial spike and then crash
    let price = 0.01;
    let volume = 5000;
    if (i < 5) {
      price = 0.01 + i * 0.05;
      volume = 50000 + i * 10000;
    } else if (i < 15) {
      price = 0.26 - (i - 5) * 0.02;
      volume = 100000 - (i - 5) * 5000;
    } else {
      price = 0.06 - (i - 15) * 0.001;
      volume = 20000 - (i - 15) * 200;
    }
    return {
      time: `Minute ${i + 1}`,
      price: Math.max(price, 0.001),
      volume: Math.max(volume, 1000),
    };
  }),
  timeline: [
    { time: "0m", label: "Liquidity Added", detail: "Initial liquidity pool created.", severity: "neutral" },
    { time: "1m", label: "Sniper Buys", detail: "24 coordinated wallets bought.", severity: "danger" },
    { time: "3m", label: "Price Peak", detail: "Token reached ATH.", severity: "warning" },
    { time: "5m", label: "Sell Off Begins", detail: "Snipers started dumping.", severity: "danger" },
    { time: "15m", label: "Liquidity Shock", detail: "Significant liquidity withdrawn.", severity: "danger" },
    { time: "60m", label: "Stagnation", detail: "Low volume sideways movement.", severity: "neutral" },
  ],
  holders: [
    { address: "CreatorWallet...", percentage: 15 },
    { address: "Sniper1...", percentage: 5 },
    { address: "Sniper2...", percentage: 4.5 },
    { address: "Wallet4...", percentage: 4 },
    { address: "Wallet5...", percentage: 3.5 },
  ],
  trades: {
    buys: 1200,
    sells: 2220,
    buyVolumeUsd: 450000,
    sellVolumeUsd: 1200000,
    netPressure: "sell",
  },
  endpointProof: [
    { endpoint: "/v1/token/trades", calls: 12, status: "ok" },
    { endpoint: "/v1/token/holders", calls: 4, status: "ok" },
    { endpoint: "/v1/token/security", calls: 1, status: "ok" },
    { endpoint: "/v1/token/ohlcv", calls: 2, status: "ok" },
    { endpoint: "/v1/token/overview", calls: 1, status: "ok" },
  ],
  generatedAt: new Date().toISOString(),
  dataMode: "mock",
};
