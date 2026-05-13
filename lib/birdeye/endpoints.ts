export const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";
export const BIRDEYE_CHAIN = "solana";

export const BIRDEYE_ENDPOINTS = {
  newListings: "/defi/v2/tokens/new_listing",
  tokenOverview: "/defi/token_overview",
  tokenSecurity: "/defi/token_security",
  ohlcv: "/defi/v3/ohlcv",
  tokenTxs: "/defi/v3/token/txs",
  tokenHolders: "/defi/v3/token/holder",
  holderPositions: "/token/v1/holder-positions",
} as const;

export type BirdeyeEndpoint = typeof BIRDEYE_ENDPOINTS[keyof typeof BIRDEYE_ENDPOINTS];

export const BIRDEYE_CASE_ENDPOINTS: BirdeyeEndpoint[] = [
  BIRDEYE_ENDPOINTS.tokenOverview,
  BIRDEYE_ENDPOINTS.tokenSecurity,
  BIRDEYE_ENDPOINTS.ohlcv,
  BIRDEYE_ENDPOINTS.tokenTxs,
  BIRDEYE_ENDPOINTS.tokenHolders,
  BIRDEYE_ENDPOINTS.holderPositions,
];

export function buildBirdeyeUrl(
  endpoint: BirdeyeEndpoint,
  params: Record<string, string | number | boolean | undefined>,
) {
  const url = new URL(endpoint, BIRDEYE_BASE_URL);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}
