import { NextResponse } from "next/server";

import { getApiCallStats } from "@/lib/proof/apiCallLogger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stats = getApiCallStats();

  return NextResponse.json({
    totalBirdeyeCalls: stats.totalCalls,
    uniqueEndpoints: stats.endpointsIntegrated.length,
    minimumTargetReached: stats.totalCalls >= 50,
    generatedAt: stats.generatedAt,
  });
}
