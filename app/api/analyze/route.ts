import { NextResponse } from "next/server";

import { BirdeyeClient, type BirdeyeRequestResult } from "@/lib/birdeye/client";
import { BIRDEYE_CASE_ENDPOINTS } from "@/lib/birdeye/endpoints";
import { classifyLaunch, createMockLaunchCase } from "@/lib/classifier/classifyLaunch";
import { buildEndpointProof, fallbackEndpointProof } from "@/lib/proof/apiCallLogger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MOCK_ADDRESS = "Mock11111111111111111111111111111111111111";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeAddress(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : MOCK_ADDRESS;
}

function isLikelySolanaAddress(address: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const address = normalizeAddress(isRecord(body) ? body.address : undefined);
  const client = new BirdeyeClient();

  if (!client.hasApiKey() || !isLikelySolanaAddress(address)) {
    const endpointProof = fallbackEndpointProof(BIRDEYE_CASE_ENDPOINTS);
    return NextResponse.json(createMockLaunchCase(address, endpointProof, "mock"));
  }

  const now = Math.floor(Date.now() / 1000);
  const oneHourAgo = now - 3600;
  const results: BirdeyeRequestResult[] = [];

  const overview = await client.getTokenOverview(address);
  results.push(overview);

  const security = await client.getTokenSecurity(address);
  results.push(security);

  const ohlcv = await client.getOhlcv(address, oneHourAgo, now);
  results.push(ohlcv);

  const txs = await client.getTokenTxs(address);
  results.push(txs);

  const holders = await client.getTokenHolders(address);
  results.push(holders);

  const holderPositions = await client.getHolderPositions(address);
  results.push(holderPositions);

  const endpointProof = buildEndpointProof(results, BIRDEYE_CASE_ENDPOINTS);
  const liveCount = results.filter((result) => result.ok).length;

  if (liveCount === 0) {
    return NextResponse.json(createMockLaunchCase(address, endpointProof, "mock"));
  }

  return NextResponse.json(classifyLaunch({
    address,
    overview: overview.data,
    security: security.data,
    ohlcv: ohlcv.data,
    txs: txs.data,
    holders: holders.data,
    holderPositions: holderPositions.data,
    endpointProof,
    dataMode: liveCount === results.length ? "live" : "partial",
  }));
}
