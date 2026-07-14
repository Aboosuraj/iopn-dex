"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits, parseAbiItem } from "viem";

import { TOKENS } from "@/lib/tokens";
import { ERC20_ABI } from "@/lib/erc20";

export type WalletToken = {
  symbol: string;
  address: string;
  decimals: number;
  balance: string;
  rawBalance: bigint;
};

export function useWalletTokens() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [tokens, setTokens] = useState<WalletToken[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadTokens() {
      if (!address || !isConnected || !publicClient) {
        setTokens([]);
        return;
      }

      try {
        setLoading(true);

        const discoveredTokens: WalletToken[] = [];

        // Add native OPN balance
        const nativeBalance = await publicClient.getBalance({
          address,
        });

        discoveredTokens.push({
          symbol: "OPN",
          address: "native",
          decimals: 18,
          balance: formatUnits(nativeBalance, 18),
          rawBalance: nativeBalance,
        });

        // Scan ERC20 Transfer events involving wallet
        const logs = await publicClient.getLogs({
          event: parseAbiItem(
            "event Transfer(address indexed from,address indexed to,uint256 value)"
          ),
          args: {
            to: address,
          },
          fromBlock: BigInt(0),
          toBlock: "latest",
        });

        const tokenAddresses = [
          ...new Set(logs.map((log) => log.address)),
        ];

        // Include your known tokens
        TOKENS.forEach((token) => {
          if (
            !token.native &&
            !tokenAddresses.includes(token.address as `0x${string}`)
          ) {
            tokenAddresses.push(token.address as `0x${string}`);
          }
        });

        for (const tokenAddress of tokenAddresses) {
          try {
            const symbol = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "symbol",
            });

            const decimals = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "decimals",
            });

            const balance = await publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            });

            if (balance > 0n) {
              discoveredTokens.push({
                symbol,
                address: tokenAddress,
                decimals,
                balance: formatUnits(balance, decimals),
                rawBalance: balance,
              });
            }
          } catch (error) {
            console.log(
              "Skipping invalid token:",
              tokenAddress
            );
          }
        }

        setTokens(discoveredTokens);
      } catch (error) {
        console.error(
          "Failed loading wallet tokens:",
          error
        );
        setTokens([]);
      } finally {
        setLoading(false);
      }
    }

    loadTokens();
  }, [address, isConnected, publicClient]);

  return {
    tokens,
    loading,
    address,
  };
}