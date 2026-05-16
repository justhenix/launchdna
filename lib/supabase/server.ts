import "server-only";

type SupabaseKeySource = "SUPABASE_SERVICE_ROLE_KEY" | "SUPABASE_SECRET_KEY";

export type SupabaseServerConfig = {
  url: string;
  restBaseUrl: string;
  serviceKey: string;
  keySource: SupabaseKeySource;
};

export type SupabaseRestError = {
  status: number;
  message: string;
  details?: unknown;
};

export type SupabaseRestResult<T> =
  | { data: T; status: number; error?: never }
  | { data?: never; status: number; error: SupabaseRestError };

export function getSupabaseEnvStatus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const keySource = serviceRoleKey
    ? "SUPABASE_SERVICE_ROLE_KEY"
    : secretKey
      ? "SUPABASE_SECRET_KEY"
      : null;

  return {
    configured: Boolean(url && keySource),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(url),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceRoleKey),
      SUPABASE_SECRET_KEY: Boolean(secretKey),
    },
    keySource,
    urlHost: url ? safeHost(url) : null,
  };
}

export function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url) {
    return null;
  }

  if (serviceRoleKey) {
    return buildConfig(url, serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");
  }

  if (secretKey) {
    return buildConfig(url, secretKey, "SUPABASE_SECRET_KEY");
  }

  return null;
}

export async function supabaseRestRequest<T>(
  table: string,
  init: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: URLSearchParams;
    body?: unknown;
    prefer?: string;
  } = {},
): Promise<SupabaseRestResult<T>> {
  const config = getSupabaseServerConfig();
  if (!config) {
    return {
      status: 0,
      error: {
        status: 0,
        message: "Supabase server env missing",
        details: getSupabaseEnvStatus(),
      },
    };
  }

  const path = table.replace(/^\/+/, "");
  const query = init.query?.toString();
  const url = `${config.restBaseUrl}/${path}${query ? `?${query}` : ""}`;

  try {
    const response = await fetch(url, {
      method: init.method ?? "GET",
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        status: response.status,
        error: await readRestError(response),
      };
    }

    if (response.status === 204) {
      return { data: undefined as T, status: response.status };
    }

    const text = await response.text();
    return {
      data: (text ? JSON.parse(text) : undefined) as T,
      status: response.status,
    };
  } catch (error) {
    return {
      status: 0,
      error: {
        status: 0,
        message: error instanceof Error ? error.message : "Supabase REST request failed",
        details: error,
      },
    };
  }
}

function buildConfig(url: string, serviceKey: string, keySource: SupabaseKeySource): SupabaseServerConfig {
  const normalizedUrl = url.replace(/\/$/, "");

  return {
    url: normalizedUrl,
    restBaseUrl: `${normalizedUrl}/rest/v1`,
    serviceKey,
    keySource,
  };
}

async function readRestError(response: Response): Promise<SupabaseRestError> {
  const text = await response.text().catch(() => "");
  if (!text) {
    return {
      status: response.status,
      message: `Supabase REST ${response.status}`,
    };
  }

  try {
    const json = JSON.parse(text) as unknown;
    return {
      status: response.status,
      message: readMessage(json) ?? text,
      details: json,
    };
  } catch {
    return {
      status: response.status,
      message: text,
      details: text,
    };
  }
}

function readMessage(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const message = record.message ?? record.error ?? record.msg;
  return typeof message === "string" ? message : undefined;
}

function safeHost(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
