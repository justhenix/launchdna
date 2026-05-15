import type { BirdeyeEndpoint } from "@/lib/birdeye/endpoints";
import type { LaunchCase } from "@/types/launch-case";

type EndpointStatus = NonNullable<LaunchCase["endpointProof"][number]["status"]>;

export type EndpointCallResult = {
  endpoint: BirdeyeEndpoint;
  calls: number;
  status: EndpointStatus;
};

function mergeStatus(current: EndpointStatus, next: EndpointStatus): EndpointStatus {
  if (current === "failed" || next === "failed") {
    return "failed";
  }

  if (current === "ok" || next === "ok") {
    return "ok";
  }

  return "fallback";
}

export function buildEndpointProof(
  results: EndpointCallResult[],
  endpointOrder: readonly BirdeyeEndpoint[] = [],
): LaunchCase["endpointProof"] {
  const byEndpoint = new Map<BirdeyeEndpoint, EndpointCallResult>();

  for (const endpoint of endpointOrder) {
    byEndpoint.set(endpoint, {
      endpoint,
      calls: 0,
      status: "fallback",
    });
  }

  for (const result of results) {
    const existing = byEndpoint.get(result.endpoint);
    if (!existing) {
      byEndpoint.set(result.endpoint, { ...result });
      continue;
    }

    byEndpoint.set(result.endpoint, {
      endpoint: result.endpoint,
      calls: existing.calls + result.calls,
      status: mergeStatus(existing.status, result.status),
    });
  }

  return Array.from(byEndpoint.values());
}

export function fallbackEndpointProof(
  endpointOrder: readonly BirdeyeEndpoint[],
): LaunchCase["endpointProof"] {
  return endpointOrder.map((endpoint) => ({
    endpoint,
    calls: 0,
    status: "fallback",
  }));
}
