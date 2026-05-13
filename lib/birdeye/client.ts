import {
  BIRDEYE_CASE_ENDPOINTS,
  BIRDEYE_CHAIN,
  BIRDEYE_ENDPOINTS,
  buildBirdeyeUrl,
  type BirdeyeEndpoint,
} from "@/lib/birdeye/endpoints";
import {
  fallbackEndpointProof,
  logBirdeyeCall,
  type EndpointCallResult,
} from "@/lib/proof/apiCallLogger";

type JsonRecord = Record<string, unknown>;

export type BirdeyeRequestResult<T = unknown> = EndpointCallResult & {
  ok: boolean;
  data?: T;
  raw?: unknown;
  error?: string;
  statusCode?: number;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapBirdeyeData(raw: unknown) {
  if (!isRecord(raw)) {
    return raw;
  }

  return raw.data ?? raw;
}

function readError(raw: unknown, fallback: string) {
  if (!isRecord(raw)) {
    return fallback;
  }

  const message = raw.message ?? raw.error ?? raw.msg;
  return typeof message === "string" ? message : fallback;
}

export class BirdeyeClient {
  private readonly apiKey = process.env.BIRDEYE_API_KEY?.trim();
  private readonly timeoutMs = 10_000;

  hasApiKey() {
    return Boolean(this.apiKey);
  }

  getMissingKeyProof() {
    return fallbackEndpointProof(BIRDEYE_CASE_ENDPOINTS);
  }

  async request<T = unknown>(
    endpoint: BirdeyeEndpoint,
    params: Record<string, string | number | boolean | undefined> = {},
    tokenAddress?: string,
  ): Promise<BirdeyeRequestResult<T>> {
    if (!this.apiKey) {
      return {
        endpoint,
        calls: 0,
        status: "fallback",
        ok: false,
        error: "Missing BIRDEYE_API_KEY",
      };
    }

    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(buildBirdeyeUrl(endpoint, params), {
        headers: {
          "X-API-KEY": this.apiKey,
          "x-chain": BIRDEYE_CHAIN,
          Accept: "application/json",
          "User-Agent": "LaunchDNA/0.1",
        },
        cache: "no-store",
        signal: controller.signal,
      });
      const raw = await response.json().catch(() => undefined);
      const durationMs = Date.now() - startedAt;

      if (!response.ok) {
        const error = readError(raw, `Birdeye ${response.status}`);
        logBirdeyeCall({
          endpoint,
          calls: 1,
          status: "failed",
          durationMs,
          statusCode: response.status,
          tokenAddress,
          error,
        });

        return {
          endpoint,
          calls: 1,
          status: "failed",
          ok: false,
          raw,
          error,
          statusCode: response.status,
        };
      }

      if (isRecord(raw) && raw.success === false) {
        const error = readError(raw, "Birdeye returned success=false");
        logBirdeyeCall({
          endpoint,
          calls: 1,
          status: "failed",
          durationMs,
          statusCode: response.status,
          tokenAddress,
          error,
        });

        return {
          endpoint,
          calls: 1,
          status: "failed",
          ok: false,
          raw,
          error,
          statusCode: response.status,
        };
      }

      logBirdeyeCall({
        endpoint,
        calls: 1,
        status: "ok",
        durationMs,
        statusCode: response.status,
        tokenAddress,
      });

      return {
        endpoint,
        calls: 1,
        status: "ok",
        ok: true,
        raw,
        data: unwrapBirdeyeData(raw) as T,
        statusCode: response.status,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : "Birdeye request failed";

      logBirdeyeCall({
        endpoint,
        calls: 1,
        status: "failed",
        durationMs,
        tokenAddress,
        error: message,
      });

      return {
        endpoint,
        calls: 1,
        status: "failed",
        ok: false,
        error: message,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  getNewListings(limit = 20) {
    return this.request(BIRDEYE_ENDPOINTS.newListings, { limit });
  }

  getTokenOverview(address: string) {
    return this.request(BIRDEYE_ENDPOINTS.tokenOverview, { address }, address);
  }

  getTokenSecurity(address: string) {
    return this.request(BIRDEYE_ENDPOINTS.tokenSecurity, { address }, address);
  }

  getOhlcv(address: string, timeFrom: number, timeTo: number) {
    return this.request(
      BIRDEYE_ENDPOINTS.ohlcv,
      {
        address,
        type: "1m",
        time_from: timeFrom,
        time_to: timeTo,
      },
      address,
    );
  }

  getTokenTxs(address: string, limit = 100) {
    return this.request(
      BIRDEYE_ENDPOINTS.tokenTxs,
      {
        address,
        tx_type: "swap",
        limit,
      },
      address,
    );
  }

  getTokenHolders(address: string, limit = 20) {
    return this.request(BIRDEYE_ENDPOINTS.tokenHolders, { address, limit }, address);
  }

  getHolderPositions(address: string, limit = 20) {
    return this.request(BIRDEYE_ENDPOINTS.holderPositions, { address, limit }, address);
  }
}
