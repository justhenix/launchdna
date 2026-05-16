import { NextResponse } from "next/server";

import { flushBirdeyeCallLogs, getDurableApiCallStats } from "@/lib/proof/apiCallLogger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  await flushBirdeyeCallLogs();
  const stats = await getDurableApiCallStats();

  return NextResponse.json({
    ok: true,
    stats,
    note: "Flushed pending Birdeye call log inserts",
  });
}
