import "server-only";

import type { BirdeyeCallLogEntry } from "@/lib/proof/apiCallLogger";

type SupabaseProofStats = {
  totalBirdeyeCalls: number;
  uniqueEndpoints: number;
  tokensAnalyzed: number;
  caseFilesGenerated: number;
  generatedAt: string;
  storageMode: "supabase";
};

type SupabaseProofRow = {
  endpoint?: string | null;
  token_address?: string | null;
  case_id?: string | null;
  calls?: number | null;
};

function readSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    restUrl: `${url.replace(/\/$/, "")}/rest/v1/launchdna_api_calls`,
    serviceRoleKey,
  };
}

function normalizeText(value?: string | null) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function hasSupabaseProofStore(): boolean {
  return readSupabaseConfig() !== null;
}

export async function persistBirdeyeCall(entry: BirdeyeCallLogEntry): Promise<void> {
  const config = readSupabaseConfig();
  if (!config) {
    return;
  }

  const payload = {
    endpoint: entry.endpoint,
    token_address: normalizeText(entry.tokenAddress) ?? null,
    case_id: normalizeText(entry.caseId) ?? null,
    calls: entry.calls,
    status: entry.status,
    status_code: entry.statusCode ?? null,
    duration_ms: entry.durationMs ?? null,
  };

  const response = await fetch(config.restUrl, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase proof insert failed: ${response.status}`);
  }
}

export async function getSupabaseProofStats(): Promise<SupabaseProofStats | null> {
  const config = readSupabaseConfig();
  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    select: "endpoint,token_address,case_id,calls",
    limit: "10000",
    order: "created_at.desc",
  });

  const response = await fetch(`${config.restUrl}?${params.toString()}`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json().catch(() => null)) as SupabaseProofRow[] | null;
  if (!Array.isArray(rows)) {
    return null;
  }

  const endpointSet = new Set<string>();
  const tokenSet = new Set<string>();
  const caseSet = new Set<string>();
  let totalBirdeyeCalls = 0;

  for (const row of rows) {
    const endpoint = normalizeText(row.endpoint);
    const tokenAddress = normalizeText(row.token_address);
    const caseId = normalizeText(row.case_id);
    const callCount =
      typeof row.calls === "number" && Number.isFinite(row.calls) && row.calls > 0
        ? row.calls
        : 0;

    totalBirdeyeCalls += callCount;

    if (endpoint) {
      endpointSet.add(endpoint);
    }

    if (tokenAddress) {
      tokenSet.add(tokenAddress);
    }

    if (caseId ?? tokenAddress) {
      caseSet.add(caseId ?? tokenAddress!);
    }
  }

  return {
    totalBirdeyeCalls,
    uniqueEndpoints: endpointSet.size,
    tokensAnalyzed: tokenSet.size,
    caseFilesGenerated: caseSet.size,
    generatedAt: new Date().toISOString(),
    storageMode: "supabase",
  };
}
