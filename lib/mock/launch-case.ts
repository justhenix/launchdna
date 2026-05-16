import type { LaunchCase } from "@/types/launch-case";

export type { EvidenceSeverity, LaunchArchetype, LaunchCase } from "@/types/launch-case";

export const MOCK_LAUNCH_CASE: LaunchCase = {
  token: {
    address: "7v6mN7qkJXf3V9pH5d2Xr8cWyLk7QnF9sZtY3uP2aB1",
    name: "Case Files",
    symbol: "SNAP",
    chain: "solana",
  },
  classification: {
    archetype: "Liquidity Mirage",
    confidence: 76,
    summary: "Launch shows early volume lift with softer liquidity follow-through and moderate sell pressure in the first hour.",
  },
  evidence: [
    {
      label: "Early Buy Compression",
      value: "22%",
      severity: "neutral",
      explanation: "Early buy clustering is present but not extreme in the first few minutes.",
    },
    {
      label: "Top 10 Holder Concentration",
      value: "27.4%",
      severity: "neutral",
      explanation: "Top 10 holders control an estimated 27.4% of visible supply.",
    },
    {
      label: "Trade Pressure",
      value: "SELL",
      severity: "warning",
      explanation: "Observed sells outweighed buys across the first-hour trade sample.",
    },
    {
      label: "Liquidity Shock Proxy",
      value: "58%",
      severity: "warning",
      explanation: "Proxy combines OHLCV movement, early volume, and sell pressure signals.",
    },
    {
      label: "Security Flags",
      value: "None",
      severity: "good",
      explanation: "No elevated risk indicators surfaced in the Birdeye security sample.",
    },
  ],
  metrics: {
    earlyBuyCompression: 22,
    top10HolderConcentration: 27.4,
    buySellRatio: 0.74,
    priceChange1h: -12.8,
    sellPressure: 57,
    liquidityShock: 58,
    flaggedHolderCount: 0,
    totalTrades: 1840,
    totalHolders: 620,
  },
  scores: {
    sniperSwarm: 33,
    liquidityMirage: 71,
    organicGrind: 48,
  },
  chart: Array.from({ length: 60 }).map((_, i) => {
    const base = 0.012;
    let price = base;
    let volume = 12000;
    if (i < 8) {
      price = base + i * 0.002;
      volume = 22000 + i * 5000;
    } else if (i < 20) {
      price = 0.028 - (i - 8) * 0.0009;
      volume = 52000 - (i - 8) * 1200;
    } else {
      price = 0.018 + Math.sin(i / 6) * 0.0006;
      volume = 24000 + Math.cos(i / 5) * 800;
    }
    return {
      time: `Minute ${i + 1}`,
      price: Number(Math.max(price, 0.005).toFixed(4)),
      volume: Math.round(Math.max(volume, 4000)),
    };
  }),
  timeline: [
    { time: "0m", label: "Analysis Window Opened", detail: "Birdeye snapshot window opened for the launch replay.", severity: "neutral" },
    { time: "4m", label: "Early Buy Compression", detail: "Initial swap burst pushed volume above baseline.", severity: "warning" },
    { time: "9m", label: "First-Hour Price Peak", detail: "Price reached a local high before cooling.", severity: "neutral" },
    { time: "22m", label: "Sell Pressure", detail: "Sell flow overtook buys and slowed momentum.", severity: "warning" },
    { time: "60m", label: "First-Hour Closeout", detail: "Price and volume stabilized into a narrower range.", severity: "neutral" },
  ],
  holders: [
    { address: "9bGqv6XwY7tV2hK8mR3pZ5sQ1cN4dF6jT8uE2aH7yP3", percentage: 9.8 },
    { address: "4tZ6mQ7rU2xV9pH3cD5nK8sY1wJ7gF6qB2aE9hT3uM5", percentage: 7.2 },
    { address: "F8tYx3QmK7pN4aZ6dH2sL9rW5jV1qX8cT6uB3eD9nP2", percentage: 5.1 },
    { address: "6hN3pQ8tV2rY7sK5mD1xC9wF4gJ8uB2aT6eZ3qM7nP5", percentage: 4.7 },
    { address: "8Qm2tZ7kV4rY9pN3cH6sX1dF5gW2jB7uT9aE3qM6nP4", percentage: 3.9 },
  ],
  trades: {
    buys: 620,
    sells: 840,
    buyVolumeUsd: 420000,
    sellVolumeUsd: 710000,
    netPressure: "sell",
  },
  endpointProof: [
    { endpoint: "/defi/token_overview", calls: 1, status: "ok" },
    { endpoint: "/defi/token_security", calls: 1, status: "ok" },
    { endpoint: "/defi/v3/ohlcv", calls: 2, status: "ok" },
    { endpoint: "/defi/v3/token/txs", calls: 3, status: "ok" },
    { endpoint: "/defi/v3/token/holder", calls: 1, status: "ok" },
    { endpoint: "/token/v1/holder-positions", calls: 1, status: "ok" },
  ],
  evidenceQuality: { status: "complete", missing: [] },
  generatedAt: new Date().toISOString(),
  dataMode: "mock",
};
