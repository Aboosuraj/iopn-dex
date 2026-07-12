"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import type { Token } from "@/hooks/useTokens";

type Pool = {
  address: string;
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  symbol0: string;
  symbol1: string;
};

export function useLiquidityQuote(
  tokenA: Token | null,
  tokenB: Token | null,
  amountA: string,
  pools: Pool[]
) {
  const [amountB, setAmountB] = useState("");
  const [poolShare, setPoolShare] = useState("--");
  const [lpEstimate, setLpEstimate] = useState("--");

  useEffect(() => {
    if (
      !tokenA ||
      !tokenB ||
      !amountA ||
      Number(amountA) <= 0
    ) {
      setAmountB("");
      setPoolShare("--");
      setLpEstimate("--");
      return;
    }

    const pool = pools.find((p) => {
      return (
        (p.token0.toLowerCase() === tokenA.address.toLowerCase() &&
          p.token1.toLowerCase() === tokenB.address.toLowerCase()) ||
        (p.token0.toLowerCase() === tokenB.address.toLowerCase() &&
          p.token1.toLowerCase() === tokenA.address.toLowerCase())
      );
    });

    if (!pool) {
      setAmountB("");
      setPoolShare("--");
      setLpEstimate("--");
      return;
    }

    const reserveA =
      pool.token0.toLowerCase() === tokenA.address.toLowerCase()
        ? pool.reserve0
        : pool.reserve1;

    const reserveB =
      pool.token0.toLowerCase() === tokenA.address.toLowerCase()
        ? pool.reserve1
        : pool.reserve0;

    const amountABig = parseUnits(
      amountA,
      tokenA.decimals
    );

    const amountBBig =
      (amountABig * reserveB) / reserveA;

    setAmountB(
      formatUnits(
        amountBBig,
        tokenB.decimals
      )
    );

    const share =
      Number(amountABig) /
      Number(reserveA + amountABig);

    setPoolShare(
      (share * 100).toFixed(4) + "%"
    );

    setLpEstimate(
      (share * 1000).toFixed(4)
    );
  }, [
    tokenA,
    tokenB,
    amountA,
    pools,
  ]);

  return {
    amountB,
    poolShare,
    lpEstimate,
  };
}