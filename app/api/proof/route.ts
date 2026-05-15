import { NextResponse } from "next/server";

import { getDurableApiCallStats } from "@/lib/proof/apiCallLogger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stats = await getDurableApiCallStats();

  return NextResponse.json({
    totalBirdeyeCalls: stats.totalBirdeyeCalls,
    uniqueEndpoints: stats.uniqueEndpoints,
    tokensAnalyzed: stats.tokensAnalyzed,
    caseFilesGenerated: stats.caseFilesGenerated,
    generatedAt: stats.generatedAt,
    storageMode: stats.storageMode,
  });
}
