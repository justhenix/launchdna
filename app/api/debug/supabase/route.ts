import { NextResponse } from "next/server";

import { supabaseErrorForClient } from "@/lib/proof/supabaseProofStore";
import { getSupabaseEnvStatus, supabaseRestRequest } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DebugLogRow = {
  id?: string;
  endpoint?: string | null;
  token_address?: string | null;
  case_id?: string | null;
  calls?: number | null;
  status?: string | null;
  created_at?: string | null;
};

export async function GET() {
  const env = getSupabaseEnvStatus();

  if (!env.configured) {
    return NextResponse.json({
      ok: false,
      env,
      select: null,
      error: "Missing NEXT_PUBLIC_SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY",
    }, { status: 503 });
  }

  const query = new URLSearchParams({
    select: "id,endpoint,token_address,case_id,calls,status,created_at",
    limit: "1",
    order: "created_at.desc",
  });
  const result = await supabaseRestRequest<DebugLogRow[]>("launchdna_api_calls", { query });

  if (result.error) {
    console.error("Supabase debug select failed:", result.error);
    return NextResponse.json({
      ok: false,
      env,
      select: {
        table: "launchdna_api_calls",
        ok: false,
      },
      error: supabaseErrorForClient(result.error),
    }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    env,
    select: {
      table: "launchdna_api_calls",
      ok: true,
      rowCount: Array.isArray(result.data) ? result.data.length : 0,
      sample: Array.isArray(result.data) ? result.data[0] ?? null : null,
    },
  });
}
