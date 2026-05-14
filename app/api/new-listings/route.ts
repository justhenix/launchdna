import { NextResponse } from "next/server";

import { BirdeyeClient } from "@/lib/birdeye/client";
import { BIRDEYE_ENDPOINTS } from "@/lib/birdeye/endpoints";
import { dedupeListings, isReadableTokenText, sanitizeTokenName, sanitizeTokenSymbol } from "@/lib/listings";
import { buildEndpointProof, fallbackEndpointProof } from "@/lib/proof/apiCallLogger";
import type { NewListingFeedItem, NewListingsResponse } from "@/types/launch-case";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type JsonRecord = Record<string, unknown>;

const MOCK_TOKENS: NewListingFeedItem[] = [
  { symbol: "DEMO", name: "Mock Demo", age: "2m", volume: "$1.2M", address: "mock-token" },
  { symbol: "TRACE", name: "Mock Trace", age: "12m", volume: "$5.4M", address: "mock-trace" },
  { symbol: "CASE", name: "Mock Case", age: "45m", volume: "$400K", address: "mock-case" },
  { symbol: "PROOF", name: "Mock Proof", age: "58m", volume: "$2.1M", address: "mock-proof" },
];

const MAX_LISTINGS = 12;

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
  return extractRows(data).slice(0, 50).flatMap((row) => {
    const address = stringField(row, [
      "address",
      "tokenAddress",
      "token_address",
      "mint",
      "mintAddress",
      "mint_address",
      "tokenMint",
      "token_mint",
    ]);
    const symbol = stringField(row, ["symbol", "tokenSymbol", "token_symbol"]);
    const name = stringField(row, ["name", "tokenName", "token_name"]);

    if (!address || (!symbol && !name)) {
      return [];
    }

    const createdAt = toIsoTime(row);
    const safeSymbol = symbol ?? name ?? "";
    const safeName = name ?? symbol ?? safeSymbol;

    if (!safeSymbol || !safeName || !isReadableTokenText(safeSymbol) || !isReadableTokenText(safeName)) {
      return [];
    }

    return [{
      address,
      name: sanitizeTokenName(safeName, safeSymbol, address),
      symbol: sanitizeTokenSymbol(safeSymbol, safeName, address),
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
    }];
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

    const result = await client.getNewListings(MAX_LISTINGS);
    const endpointProof = buildEndpointProof([result], [BIRDEYE_ENDPOINTS.newListings]);
    const tokens = result.ok ? dedupeListings(normalizeListings(result.data)).slice(0, MAX_LISTINGS) : [];
    const hasLiveTokens = result.ok && tokens.length > 0;
    const response: NewListingsResponse = {
      tokens: hasLiveTokens ? tokens : MOCK_TOKENS,
      endpointProof,
      generatedAt: new Date().toISOString(),
      dataMode: hasLiveTokens ? "live" : "mock",
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
