"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";

import { Config } from "@/lib/wagmi";
import { PAIR_ABI } from "@/lib/pairAbi";

export type MyLiquidityPosition = {
  pair: string;
  lpBalance: string;
  poolShare: string;
  token0Amount: string;
  token1Amount: string;
};

export function useMyLiquidity(pools: any[]) {
  const { address } = useAccount();

  const [positions, setPositions] = useState<MyLiquidityPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!address || pools.length === 0) {
        setPositions([]);
        setLoading(false);
        return;
      }

      try {
        const result: MyLiquidityPosition[] = [];

        for (const pool of pools) {
          const lpBalance = await readContract(Config, {
            address: pool.address as `0x${string}`,
            abi: PAIR_ABI,
            functionName: "balanceOf",
            args: [address],
          });

          if (BigInt(lpBalance.toString()) === 0n) continue;

          const totalSupply = await readContract(Config, {
            address: pool.address as `0x${string}`,
            abi: PAIR_ABI,
            functionName: "totalSupply",
          });

          const reserve0 = BigInt(pool.reserve0);
          const reserve1 = BigInt(pool.reserve1);

          const share =
            Number(lpBalance.toString()) /
            Number(totalSupply.toString());

          result.push({
            pair: `${pool.symbol0} / ${pool.symbol1}`,
            lpBalance: lpBalance.toString(),
            poolShare: (share * 100).toFixed(4) + "%",
            token0Amount: (
              Number(reserve0) * share
            ).toFixed(4),
            token1Amount: (
              Number(reserve1) * share
            ).toFixed(4),
          });
        }

        setPositions(result);
      } catch (error) {
        console.error("My Liquidity Error:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [address, pools]);

  return {
    positions,
    loading,
  };
}