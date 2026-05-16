import "server-only";

import { getSupabaseServerConfig, supabaseRestRequest, type SupabaseRestError } from "@/lib/supabase/server";
import type { BirdeyeCallLogEntry } from "@/lib/proof/apiCallLogger";
import type { LaunchCase } from "@/types/launch-case";

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

type SupabaseCaseFileRow = {
  case_id?: string | null;
  token_address?: string | null;
};

const API_CALL_TABLE = "launchdna_api_calls";
const CASE_FILES_TABLE = "case_files";

function normalizeText(value?: string | null) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function hasSupabaseProofStore(): boolean {
  return getSupabaseServerConfig() !== null;
}

export async function persistBirdeyeCall(entry: BirdeyeCallLogEntry): Promise<void> {
  const payload = {
    endpoint: entry.endpoint,
    token_address: normalizeText(entry.tokenAddress) ?? null,
    case_id: normalizeText(entry.caseId) ?? null,
    calls: entry.calls,
    status: entry.status,
    status_code: entry.statusCode ?? null,
    duration_ms: entry.durationMs ?? null,
    error_message: normalizeText(entry.error) ?? null,
  };

  const result = await supabaseRestRequest<undefined>(API_CALL_TABLE, {
    method: "POST",
    body: payload,
    prefer: "return=minimal",
  });

  if (result.error) {
    throw result.error;
  }
}

export async function persistCaseFile(launchCase: LaunchCase): Promise<void> {
  const caseId = normalizeText(launchCase.token.address) ?? `case-${Date.now()}`;
  const payload = {
    case_id: caseId,
    token_address: normalizeText(launchCase.token.address) ?? null,
    token_name: normalizeText(launchCase.token.name) ?? null,
    token_symbol: normalizeText(launchCase.token.symbol) ?? null,
    archetype: launchCase.classification.archetype,
    confidence: launchCase.classification.confidence,
    data_mode: launchCase.dataMode,
    evidence_quality_status: launchCase.evidenceQuality.status,
    case_json: launchCase,
    updated_at: new Date().toISOString(),
  };
  const query = new URLSearchParams({ on_conflict: "case_id" });
  const result = await supabaseRestRequest<undefined>(CASE_FILES_TABLE, {
    method: "POST",
    query,
    body: payload,
    prefer: "resolution=merge-duplicates,return=minimal",
  });

  if (result.error) {
    throw result.error;
  }
}

export async function getSupabaseProofStats(): Promise<SupabaseProofStats | null> {
  if (!hasSupabaseProofStore()) {
    return null;
  }

  const params = new URLSearchParams({
    select: "endpoint,token_address,case_id,calls",
    limit: "10000",
    order: "created_at.desc",
  });
  const result = await supabaseRestRequest<SupabaseProofRow[]>(API_CALL_TABLE, {
    query: params,
  });

  if (result.error) {
    console.error(`Supabase ${API_CALL_TABLE} select failed:`, result.error);
    return null;
  }

  if (!Array.isArray(result.data)) {
    return null;
  }

  const endpointSet = new Set<string>();
  const tokenSet = new Set<string>();
  const caseSet = new Set<string>();
  let totalBirdeyeCalls = 0;

  for (const row of result.data) {
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
    caseFilesGenerated: await getCaseFilesGenerated(caseSet),
    generatedAt: new Date().toISOString(),
    storageMode: "supabase",
  };
}

async function getCaseFilesGenerated(fallbackCaseSet: Set<string>) {
  const params = new URLSearchParams({
    select: "case_id,token_address",
    limit: "10000",
    order: "created_at.desc",
  });
  const result = await supabaseRestRequest<SupabaseCaseFileRow[]>(CASE_FILES_TABLE, {
    query: params,
  });

  if (result.error) {
    console.error("Supabase case_files select failed:", result.error);
    return fallbackCaseSet.size;
  }

  if (!Array.isArray(result.data)) {
    return fallbackCaseSet.size;
  }

  const caseSet = new Set<string>();
  for (const row of result.data) {
    const caseId = normalizeText(row.case_id);
    const tokenAddress = normalizeText(row.token_address);
    if (caseId ?? tokenAddress) {
      caseSet.add(caseId ?? tokenAddress!);
    }
  }

  return caseSet.size;
}

export function supabaseErrorForClient(error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return "Supabase persistence failed";
  }

  const restError = error as Partial<SupabaseRestError>;
  if (typeof restError.message === "string") {
    return {
      status: restError.status,
      message: restError.message,
      details: restError.details,
    };
  }

  return error instanceof Error ? error.message : error;
}
