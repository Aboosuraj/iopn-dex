export type ImportedToken = {
  symbol: string;
  address: string;
  decimals: number;
  native: false;
  imported: true;
};

export const IMPORTED_TOKENS_KEY = "iopn-imported-tokens";

function normalizeAddress(address: string) {
  return address.toLowerCase();
}

export function getImportedTokens(): ImportedToken[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(IMPORTED_TOKENS_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function saveImportedToken(token: ImportedToken) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = getImportedTokens();

  const alreadyExists = existing.some(
    (item) =>
      normalizeAddress(item.address) ===
      normalizeAddress(token.address)
  );

  if (alreadyExists) {
    return;
  }

  localStorage.setItem(
    IMPORTED_TOKENS_KEY,
    JSON.stringify([
      ...existing,
      token,
    ])
  );

  window.dispatchEvent(
    new Event("iopn-imported-tokens-updated")
  );
}