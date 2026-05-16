import "server-only";

import { BIRDEYE_ENDPOINTS } from "@/lib/birdeye/endpoints";
import { buildEndpointProof, type EndpointCallResult } from "@/lib/proof/endpointProof";

export type BirdeyeCallLogEntry = EndpointCallResult & {
  at: string;
  durationMs?: number;
  statusCode?: number;
  tokenAddress?: string;
  caseId?: string;
  error?: string;
};

export type DurableApiCallStats = {
  totalBirdeyeCalls: number;
  uniqueEndpoints: number;
  tokensAnalyzed: number;
  caseFilesGenerated: number;
  generatedAt: string;
  storageMode: "supabase" | "local";
};

type ApiLogGlobal = typeof globalThis & {
  __launchDnaBirdeyeCalls?: BirdeyeCallLogEntry[];
  __launchDnaPendingPersists?: Promise<void>[];
};

function getStore() {
  const store = globalThis as ApiLogGlobal;
  if (!store.__launchDnaBirdeyeCalls) {
    // Memory store is fallback only. Supabase is durable proof store.
    store.__launchDnaBirdeyeCalls = [];
  }

  return store.__launchDnaBirdeyeCalls;
}

function getPendingPersists(): Promise<void>[] {
  const store = globalThis as ApiLogGlobal;
  if (!store.__launchDnaPendingPersists) {
    store.__launchDnaPendingPersists = [];
  }

  return store.__launchDnaPendingPersists;
}

export function logBirdeyeCall(entry: Omit<BirdeyeCallLogEntry, "at">) {
  const fullEntry = {
    ...entry,
    at: new Date().toISOString(),
  };

  getStore().push(fullEntry);
  const persistPromise: Promise<void> = import("@/lib/proof/supabaseProofStore")
    .then(({ hasSupabaseProofStore, persistBirdeyeCall }) => {
      if (!hasSupabaseProofStore()) {
        return;
      }

      return persistBirdeyeCall(fullEntry);
    })
    .catch((error) => {
      console.error("Supabase launchdna_api_calls insert failed:", error);
    });

  getPendingPersists().push(persistPromise);
}

export async function flushBirdeyeCallLogs(): Promise<void> {
  const pending = getPendingPersists();
  const batch = pending.splice(0, pending.length);
  if (batch.length === 0) {
    return;
  }

  try {
    await Promise.allSettled(batch);
  } catch (error) {
    console.error("Birdeye call log flush failed:", error);
  }
}

export function getApiCallStats() {
  const entries = getStore();
  const endpointOrder = Object.values(BIRDEYE_ENDPOINTS);
  const endpointProof = buildEndpointProof(entries, endpointOrder);

  return {
    totalCalls: entries.reduce((total, entry) => total + entry.calls, 0),
    okCalls: entries
      .filter((entry) => entry.status === "ok")
      .reduce((total, entry) => total + entry.calls, 0),
    failedCalls: entries
      .filter((entry) => entry.status === "failed")
      .reduce((total, entry) => total + entry.calls, 0),
    fallbackCalls: entries
      .filter((entry) => entry.status === "fallback")
      .reduce((total, entry) => total + entry.calls, 0),
    endpointsIntegrated: endpointOrder,
    generatedAt: new Date().toISOString(),
    endpointProof,
    entries,
  };
}

function buildMemoryStats(): DurableApiCallStats {
  const entries = getStore();
  const endpointSet = new Set<string>();
  const tokenSet = new Set<string>();
  const caseSet = new Set<string>();

  for (const entry of entries) {
    endpointSet.add(entry.endpoint);

    if (entry.tokenAddress?.trim()) {
      tokenSet.add(entry.tokenAddress.trim());
    }

    const caseKey = entry.caseId?.trim() || entry.tokenAddress?.trim();
    if (caseKey) {
      caseSet.add(caseKey);
    }
  }

  return {
    totalBirdeyeCalls: entries.reduce((total, entry) => total + entry.calls, 0),
    uniqueEndpoints: endpointSet.size,
    tokensAnalyzed: tokenSet.size,
    caseFilesGenerated: caseSet.size,
    generatedAt: new Date().toISOString(),
    storageMode: "local",
  };
}

export async function getDurableApiCallStats(): Promise<DurableApiCallStats> {
  const { getSupabaseProofStats, hasSupabaseProofStore } = await import("@/lib/proof/supabaseProofStore");
  if (!hasSupabaseProofStore()) {
    return buildMemoryStats();
  }

  const supabaseStats = await getSupabaseProofStats();
  if (supabaseStats) {
    return supabaseStats;
  }

  return buildMemoryStats();
}
