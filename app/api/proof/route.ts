import { NextResponse } from "next/server";

import { getDurableApiCallStats } from "@/lib/proof/apiCallLogger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stats = await getDurableApiCallStats();
  const isProofEmpty =
    stats.totalBirdeyeCalls === 0 ||
    stats.uniqueEndpoints === 0 ||
    stats.tokensAnalyzed === 0;

  return NextResponse.json({
    totalBirdeyeCalls: stats.totalBirdeyeCalls,
    uniqueEndpoints: stats.uniqueEndpoints,
    tokensAnalyzed: stats.tokensAnalyzed,
    caseFilesGenerated: stats.caseFilesGenerated,
    generatedAt: stats.generatedAt,
    storageMode: stats.storageMode,
    storageLabel: stats.storageMode === "supabase" ? "Supabase durable store" : "Local fallback store",
    isProofEmpty,
  });
}
