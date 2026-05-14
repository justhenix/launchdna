import { NextResponse } from "next/server";

import { BirdeyeClient } from "@/lib/birdeye/client";
import { BIRDEYE_ENDPOINTS } from "@/lib/birdeye/endpoints";
import { buildEndpointProof, fallbackEndpointProof } from "@/lib/proof/apiCallLogger";
import type { NewListingFeedItem, NewListingsResponse } from "@/types/launch-case";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type JsonRecord = Record<string, unknown>;

const MOCK_TOKENS: NewListingFeedItem[] = [
  { symbol: "PEPE", name: "Mock PEPE", age: "2m", volume: "$1.2M", archetype: "Evaluating...", address: "mock-pepe" },
  { symbol: "DOGE2", name: "Mock DOGE2", age: "12m", volume: "$5.4M", archetype: "Sniper Swarm", address: "mock-token", isDanger: true },
  { symbol: "CAT", name: "Mock CAT", age: "45m", volume: "$400K", archetype: "Organic Grind", address: "mock-cat", isSafe: true },
  { symbol: "MOON", name: "Mock MOON", age: "58m", volume: "$2.1M", archetype: "Liquidity Mirage", address: "mock-moon", isDanger: true },
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractRows(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of ["items", "tokens", "data", "list"]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested.filter(isRecord);
    }

    if (isRecord(nested)) {
      const rows = extractRows(nested);
      if (rows.length > 0) {
        return rows;
      }
    }
  }

  return [];
}

function stringField(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return undefined;
}

function numberField(record: JsonRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function toIsoTime(record: JsonRecord) {
  const numeric = numberField(record, [
    "createdTime",
    "created_time",
    "listingTime",
    "listing_time",
    "recentListingTime",
    "blockUnixTime",
  ]);

  if (numeric !== undefined) {
    const ms = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  return stringField(record, ["createdAt", "created_at", "listedAt", "listed_at"]);
}

function ageFromIso(iso?: string) {
  if (!iso) {
    return "new";
  }

  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) {
    return "new";
  }

  const minutes = Math.max(1, Math.round((Date.now() - created) / 60_000));
  if (minutes < 60) {
    return `${minutes}m`;
  }

  return `${Math.round(minutes / 60)}h`;
}

function usd(value?: number) {
  if (value === undefined) {
    return "$0";
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${Math.round(value / 1000)}K`;
  }

  return `$${Math.round(value)}`;
}

function normalizeListings(data: unknown): NewListingFeedItem[] {
  return extractRows(data).slice(0, 12).map((row, index) => {
    const createdAt = toIsoTime(row);
    const symbol = stringField(row, ["symbol", "tokenSymbol", "token_symbol"]) ?? `TOKEN${index + 1}`;

    return {
      address: stringField(row, [
        "address",
        "tokenAddress",
        "token_address",
        "mint",
        "mintAddress",
        "mint_address",
        "tokenMint",
        "token_mint",
      ]) ?? `mock-token-${index + 1}`,
      name: stringField(row, ["name", "tokenName", "token_name"]) ?? symbol,
      symbol,
      createdAt,
      age: ageFromIso(createdAt),
      volume: usd(numberField(row, [
        "v24hUSD",
        "v24h_usd",
        "volume24hUsd",
        "volume_24h_usd",
        "volumeUsd",
        "volume_usd",
        "volume24h",
        "liquidity",
        "liquidityUsd",
        "liquidity_usd",
      ])),
      archetype: "Evaluating...",
    };
  });
}

export async function GET() {
  try {
    const client = new BirdeyeClient();

    if (!client.hasApiKey()) {
      const response: NewListingsResponse = {
        tokens: MOCK_TOKENS,
        endpointProof: fallbackEndpointProof([BIRDEYE_ENDPOINTS.newListings]),
        generatedAt: new Date().toISOString(),
        dataMode: "mock",
      };

      return NextResponse.json(response);
    }

    const result = await client.getNewListings(12);
    const endpointProof = buildEndpointProof([result], [BIRDEYE_ENDPOINTS.newListings]);
    const tokens = result.ok ? normalizeListings(result.data) : [];
    const response: NewListingsResponse = {
      tokens: tokens.length > 0 ? tokens : MOCK_TOKENS,
      endpointProof,
      generatedAt: new Date().toISOString(),
      dataMode: result.ok && tokens.length > 0 ? "live" : "mock",
    };

    return NextResponse.json(response);
  } catch {
    const response: NewListingsResponse = {
      tokens: MOCK_TOKENS,
      endpointProof: fallbackEndpointProof([BIRDEYE_ENDPOINTS.newListings]),
      generatedAt: new Date().toISOString(),
      dataMode: "mock",
    };

    return NextResponse.json(response);
  }
}
