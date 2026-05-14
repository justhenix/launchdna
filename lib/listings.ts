import type { NewListingFeedItem } from "@/types/launch-case";

type ListingKey = {
  addressKey?: string;
  fallbackKey?: string;
};

const READABLE_TOKEN_RE = /^[A-Za-z0-9 $_.-]+$/;

function buildListingKey(listing: NewListingFeedItem): ListingKey {
  const addressKey = listing.address?.trim();
  const symbolKey = listing.symbol?.trim().toLowerCase();
  const nameKey = listing.name?.trim().toLowerCase();
  const fallbackKey = symbolKey && nameKey ? `${symbolKey}::${nameKey}` : undefined;

  return {
    addressKey: addressKey && addressKey.length > 0 ? addressKey : undefined,
    fallbackKey,
  };
}

export function dedupeListings(listings: NewListingFeedItem[]) {
  const seenAddress = new Set<string>();
  const seenFallback = new Set<string>();
  const deduped: NewListingFeedItem[] = [];

  for (const listing of listings) {
    const { addressKey, fallbackKey } = buildListingKey(listing);

    if (addressKey) {
      if (seenAddress.has(addressKey)) {
        continue;
      }
      seenAddress.add(addressKey);
      if (fallbackKey) {
        seenFallback.add(fallbackKey);
      }
      deduped.push(listing);
      continue;
    }

    if (!fallbackKey || seenFallback.has(fallbackKey)) {
      continue;
    }

    seenFallback.add(fallbackKey);
    deduped.push(listing);
  }

  return deduped;
}

export function isReadableTokenText(text?: string): text is string {
  if (!text) {
    return false;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  return READABLE_TOKEN_RE.test(trimmed);
}

function deriveSymbolFromName(name: string) {
  const normalized = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalized) {
    return "";
  }

  if (normalized.length >= 3) {
    return normalized.slice(0, 6);
  }

  return normalized.padEnd(3, "X").slice(0, 6);
}

export function sanitizeTokenName(name?: string, symbol?: string, _address?: string) {
  void _address;
  const safeName = isReadableTokenText(name) ? name.trim() : undefined;
  if (safeName) {
    return safeName;
  }

  const safeSymbol = isReadableTokenText(symbol) ? symbol.trim() : undefined;
  if (safeSymbol) {
    return safeSymbol;
  }

  return "Unlabeled Token";
}

export function sanitizeTokenSymbol(symbol?: string, name?: string, _address?: string) {
  void _address;
  const safeSymbol = isReadableTokenText(symbol) ? symbol.trim() : undefined;
  if (safeSymbol) {
    return safeSymbol;
  }

  const safeName = isReadableTokenText(name) ? name.trim() : undefined;
  if (safeName) {
    const derived = deriveSymbolFromName(safeName);
    return derived || "TOKEN";
  }

  return "TOKEN";
}
