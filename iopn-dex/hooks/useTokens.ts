"use client";

import { useCallback, useEffect, useState } from "react";

import { TOKENS } from "@/lib/tokens";
import {
  getImportedTokens,
  saveImportedToken,
} from "@/lib/importedTokens";

export type Token = {
  symbol: string;
  name?: string;
  address: string;
  decimals: number;
  native: boolean;
  imported?: boolean;
  verified?: boolean;
  logo?: string;
  price?: number;
  change24h?: number;
};

function normalizeToken(token: Token): Token {
  return {
    ...token,
    address: token.address,
    symbol: token.symbol,
    decimals: Number(token.decimals),
    native: Boolean(token.native),
  };
}

function mergeTokens(
  listedTokens: Token[],
  importedTokens: Token[]
): Token[] {
  const map = new Map<string, Token>();

  for (const token of listedTokens) {
    map.set(
      token.address.toLowerCase(),
      normalizeToken(token)
    );
  }

  for (const token of importedTokens) {
    const key = token.address.toLowerCase();

    /*
     * Imported token replaces an existing item with
     * the same address only when it is not already listed.
     */
    if (!map.has(key)) {
      map.set(
        key,
        normalizeToken({
          ...token,
          imported: true,
        })
      );
    }
  }

  return Array.from(map.values());
}

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>(() =>
    (TOKENS as unknown as Token[]).map(normalizeToken)
  );

  /*
   * Load imported tokens from localStorage after the
   * component mounts in the browser.
   */
  useEffect(() => {
    function loadTokens() {
      const importedTokens =
        getImportedTokens();

      setTokens(
        mergeTokens(
          TOKENS as unknown as Token[],
          importedTokens
        )
      );
    }

    loadTokens();

    /*
     * Listen for imports made by TokenImport or
     * TokenSelector.
     */
    const handleUpdate = () => {
      loadTokens();
    };

    window.addEventListener(
      "iopn-imported-tokens-updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "iopn-imported-tokens-updated",
        handleUpdate
      );
    };
  }, []);

  const addToken = useCallback(
    (token: Token) => {
      const normalized = normalizeToken({
        ...token,
        imported:
          token.imported ?? true,
      });

      /*
       * Save imported tokens permanently.
       */
      if (!normalized.native) {
        saveImportedToken({
          symbol: normalized.symbol,
          name:
            normalized.name ??
            normalized.symbol,
          address: normalized.address,
          decimals: normalized.decimals,
          native: false,
          imported: true,
        });
      }

      setTokens((current) => {
        const exists = current.some(
          (item) =>
            item.address.toLowerCase() ===
            normalized.address.toLowerCase()
        );

        if (exists) {
          /*
           * Update the existing token rather than
           * creating a duplicate.
           */
          return current.map((item) =>
            item.address.toLowerCase() ===
            normalized.address.toLowerCase()
              ? {
                  ...item,
                  ...normalized,
                }
              : item
          );
        }

        return [
          ...current,
          normalized,
        ];
      });
    },
    []
  );

  return {
    tokens,
    addToken,
  };
}