import { NextResponse } from "next/server";

import { BirdeyeClient, type BirdeyeRequestResult } from "@/lib/birdeye/client";
import { BIRDEYE_CASE_ENDPOINTS } from "@/lib/birdeye/endpoints";
import { classifyLaunch, createMockLaunchCase } from "@/lib/classifier/classifyLaunch";
import { buildEndpointProof, fallbackEndpointProof } from "@/lib/proof/endpointProof";
import { persistCaseFile, supabaseErrorForClient } from "@/lib/proof/supabaseProofStore";
import type { LaunchCase } from "@/types/launch-case";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MOCK_ADDRESS = "7v6mN7qkJXf3V9pH5d2Xr8cWyLk7QnF9sZtY3uP2aB1";
const FIRST_HOUR_LOOKBACK_SECONDS = 7 * 24 * 60 * 60;
const SERVER_TIMEOUT_MS = 18_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAddress(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : MOCK_ADDRESS;
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
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

function toUnixSeconds(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value > 1_000_000_000_000 ? Math.floor(value / 1000) : Math.floor(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric > 1_000_000_000_000 ? Math.floor(numeric / 1000) : Math.floor(numeric);
    }

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? undefined : Math.floor(parsed / 1000);
  }

  return undefined;
}

function firstLaunchTime(...records: unknown[]) {
  const keys = [
    "createdTime",
    "created_time",
    "createdAt",
    "created_at",
    "creationTime",
    "creation_time",
    "listingTime",
    "listing_time",
    "recentListingTime",
    "recent_listing_time",
    "firstTradeUnixTime",
    "first_trade_unix_time",
    "launchTime",
    "launch_time",
  ];

  for (const record of records) {
    const unix = toUnixSeconds(field(record, keys));
    if (unix !== undefined) {
      return unix;
    }
  }

  return undefined;
}

function ohlcvWindow(overview: unknown, security: unknown) {
  const now = Math.floor(Date.now() / 1000);
  const launch = firstLaunchTime(overview, security);

  if (launch === undefined || launch > now || now - launch > FIRST_HOUR_LOOKBACK_SECONDS) {
    return {
      from: now - 3600,
      to: now,
    };
  }

  return {
    from: launch,
    to: Math.max(Math.min(now, launch + 3600), launch + 60),
  };
}

function isLikelySolanaAddress(address: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

async function jsonCase(launchCase: LaunchCase) {
  try {
    await persistCaseFile(launchCase);
  } catch (error) {
    console.error("Supabase case_files insert failed:", error);
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(launchCase, {
        headers: {
          "x-launchdna-supabase-error": JSON.stringify(supabaseErrorForClient(error)),
        },
      });
    }
  }

  return NextResponse.json(launchCase);
}

export async function POST(request: Request) {
  let address = MOCK_ADDRESS;
  let name: string | undefined;
  let symbol: string | undefined;

  try {
    const body = await request.json().catch(() => ({}));
    if (isRecord(body)) {
      address = normalizeAddress(body.address);
      name = normalizeOptionalString(body.name);
      symbol = normalizeOptionalString(body.symbol);
    }
    const client = new BirdeyeClient();

    if (!client.hasApiKey() || address === "mock-token" || !isLikelySolanaAddress(address)) {
      const endpointProof = fallbackEndpointProof(BIRDEYE_CASE_ENDPOINTS);
      const snapshotAddress = address === "mock-token" ? "" : address;
      return jsonCase(createMockLaunchCase(snapshotAddress, endpointProof, "mock", { name, symbol }));
    }

    const results: BirdeyeRequestResult[] = [];
    const deadline = Date.now() + SERVER_TIMEOUT_MS;
    const timedOut = () => Date.now() > deadline;

    const run = async (fn: () => Promise<BirdeyeRequestResult>) => {
      if (timedOut()) {
        return undefined;
      }

      const result = await fn();
      results.push(result);
      return result;
    };

    const overview = await run(() => client.getTokenOverview(address));

    const security = await run(() => client.getTokenSecurity(address));

    const window = ohlcvWindow(overview?.data, security?.data);
    const ohlcv = await run(() => client.getOhlcv(address, window.from, window.to));

    const txs = await run(() => client.getTokenTxs(address));

    const holders = await run(() => client.getTokenHolders(address));

    const holderPositions = await run(() => client.getHolderPositions(address));

    const endpointProof = buildEndpointProof(results, BIRDEYE_CASE_ENDPOINTS);
    const liveCount = results.filter((result) => result.ok).length;
    const hasCoreLiveEvidence = overview?.ok && (ohlcv?.ok || txs?.ok);

    if (timedOut()) {
      return jsonCase(classifyLaunch({
        address,
        name,
        symbol,
        overview: overview?.data,
        security: security?.data,
        ohlcv: ohlcv?.data,
        txs: txs?.data,
        holders: holders?.data,
        holderPositions: holderPositions?.data,
        endpointProof,
        dataMode: "partial",
      }));
    }

    if (liveCount === 0) {
      return jsonCase(classifyLaunch({
        address,
        name,
        symbol,
        overview: overview?.data,
        security: security?.data,
        ohlcv: ohlcv?.data,
        txs: txs?.data,
        holders: holders?.data,
        holderPositions: holderPositions?.data,
        endpointProof,
        dataMode: "partial",
      }));
    }

    return jsonCase(classifyLaunch({
      address,
      name,
      symbol,
      overview: overview?.data,
      security: security?.data,
      ohlcv: ohlcv?.data,
      txs: txs?.data,
      holders: holders?.data,
      holderPositions: holderPositions?.data,
      endpointProof,
      dataMode: hasCoreLiveEvidence ? "live" : "partial",
    }));
  } catch {
    if (address === "mock-token" || !isLikelySolanaAddress(address)) {
      const endpointProof = fallbackEndpointProof(BIRDEYE_CASE_ENDPOINTS);
      const snapshotAddress = address === "mock-token" ? "" : address;
      return jsonCase(createMockLaunchCase(snapshotAddress, endpointProof, "mock", { name, symbol }));
    }

    const endpointProof = fallbackEndpointProof(BIRDEYE_CASE_ENDPOINTS);
    return jsonCase(classifyLaunch({
      address,
      name,
      symbol,
      endpointProof,
      dataMode: "partial",
    }));
  }
}
