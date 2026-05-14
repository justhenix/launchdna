export type LaunchArchetype =
  | "Sniper Swarm"
  | "Liquidity Mirage"
  | "Organic Grind";

export type EvidenceSeverity =
  | "good"
  | "warning"
  | "danger"
  | "neutral";

export type LaunchCase = {
  token: {
    address: string;
    name: string;
    symbol: string;
    chain: "solana";
    logoURI?: string;
  };

  classification: {
    archetype: LaunchArchetype;
    confidence: number;
    summary: string;
  };

  evidence: {
    label: string;
    value: string;
    severity: EvidenceSeverity;
    explanation: string;
  }[];

  metrics: {
    earlyBuyCompression: number;
    top10HolderConcentration: number;
    buySellRatio: number;
    priceChange1h: number;
    sellPressure: number;
    liquidityShock: number;
    flaggedHolderCount?: number;
    totalTrades?: number;
    totalHolders?: number;
  };

  scores: {
    sniperSwarm: number;
    liquidityMirage: number;
    organicGrind: number;
  };

  chart: {
    time: string;
    price: number;
    volume: number;
  }[];

  timeline: {
    time: string;
    label: string;
    detail: string;
    severity: EvidenceSeverity;
  }[];

  holders: {
    address: string;
    percentage: number;
    tag?: string;
  }[];

  trades: {
    buys: number;
    sells: number;
    buyVolumeUsd?: number;
    sellVolumeUsd?: number;
    netPressure: "buy" | "sell" | "balanced";
  };

  endpointProof: {
    endpoint: string;
    calls: number;
    status?: "ok" | "fallback" | "failed";
  }[];

  generatedAt: string;
  dataMode: "live" | "mock" | "partial";
};

export type NewListingFeedItem = {
  address: string;
  name: string;
  symbol: string;
  createdAt?: string;
  age?: string;
  volume?: string;
  archetype?: LaunchArchetype | "Evaluating...";
  isDanger?: boolean;
  isSafe?: boolean;
  logoURI?: string;
};

export type NewListingsResponse = {
  tokens: NewListingFeedItem[];
  endpointProof: LaunchCase["endpointProof"];
  generatedAt: string;
  dataMode: LaunchCase["dataMode"];
};
