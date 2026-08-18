"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits } from "viem";

import { ERC20_ABI } from "@/lib/erc20";
import { useTokens } from "@/hooks/useTokens";
import { getImportedTokens } from "@/lib/importedTokens";

export type WalletToken = {
  symbol: string;
  address: string;
  decimals: number;
  native: boolean;
  balance: string;
  imported?: boolean;
};

export function useWalletTokens() {
  const { address } = useAccount();

  const publicClient = usePublicClient();

  const { tokens } = useTokens();

  const [walletTokens, setWalletTokens] = useState<WalletToken[]>(
    []
  );

  const [loading, setLoading] = useState(false);

  const loadBalances = useCallback(async () => {
    if (!address || !publicClient) {
      setWalletTokens([]);
      return;
    }

    setLoading(true);

    try {
      /*
       * Combine:
       * 1. Official/listed tokens
       * 2. User imported tokens
       */

      const importedTokens = getImportedTokens();

      const tokenMap = new Map<
        string,
        WalletToken
      >();

      for (const token of tokens) {
        if (token.native) {
          continue;
        }

        tokenMap.set(
          token.address.toLowerCase(),
          {
            symbol: token.symbol,
            address: token.address,
            decimals: token.decimals,
            native: false,
            balance: "0",
            imported: false,
          }
        );
      }

      for (const token of importedTokens) {
        tokenMap.set(
          token.address.toLowerCase(),
          {
            symbol: token.symbol,
            address: token.address,
            decimals: token.decimals,
            native: false,
            balance: "0",
            imported: true,
          }
        );
      }

      const allTokens = Array.from(
        tokenMap.values()
      );

      /*
       * Read every ERC20 balance directly from IOPn.
       */

      const balances = await Promise.all(
        allTokens.map(async (token) => {
          try {
            const rawBalance =
              await publicClient.readContract({
                address: token.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "balanceOf",
                args: [
                  address as `0x${string}`,
                ],
              });

            const formatted = formatUnits(
              rawBalance,
              token.decimals
            );

            return {
              ...token,
              balance: formatted,
            };
          } catch {
            return {
              ...token,
              balance: "0",
            };
          }
        })
      );

      setWalletTokens(balances);
    } catch {
      setWalletTokens([]);
    } finally {
      setLoading(false);
    }
  }, [
    address,
    publicClient,
    tokens,
  ]);

  /*
   * Initial load + wallet/token changes.
   */

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  /*
   * Refresh balances every 10 seconds.
   *
   * This means:
   *
   * BUY  → balance appears
   * SELL → balance decreases/disappears
   * TRANSFER → balance decreases/disappears
   * RECEIVE → balance appears
   */

  useEffect(() => {
    if (!address) {
      return;
    }

    const interval = setInterval(() => {
      loadBalances();
    }, 10_000);

    return () => {
      clearInterval(interval);
    };
  }, [
    address,
    loadBalances,
  ]);

  /*
   * Refresh immediately when a new token
   * is imported from the Market page.
   */

  useEffect(() => {
    const refresh = () => {
      loadBalances();
    };

    window.addEventListener(
      "iopn-imported-tokens-updated",
      refresh
    );

    window.addEventListener(
      "storage",
      refresh
    );

    return () => {
      window.removeEventListener(
        "iopn-imported-tokens-updated",
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );
    };
  }, [loadBalances]);

  return {
    walletTokens,
    loading,
    refresh: loadBalances,
  };
}