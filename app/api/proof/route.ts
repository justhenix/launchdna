import { NextResponse } from "next/server";

import { getApiCallStats } from "@/lib/proof/apiCallLogger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stats = getApiCallStats();

  return NextResponse.json({
    totalCalls: stats.totalCalls,
    okCalls: stats.okCalls,
    failedCalls: stats.failedCalls,
    fallbackCalls: stats.fallbackCalls,
    endpointsIntegrated: stats.endpointsIntegrated,
    endpointProof: stats.endpointProof,
    generatedAt: stats.generatedAt,
  });
}
