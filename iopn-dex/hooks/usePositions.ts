"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";

export interface LiquidityPosition {
  pair: string;
  lpBalance: string;
  poolShare: string;
  token0Amount: string;
  token1Amount: string;
}

export function usePositions() {
  const { isConnected } = useAccount();

  const positions = useMemo<LiquidityPosition[]>(() => {
    if (!isConnected) return [];

    // TODO:
    // Replace this with real LP positions from the IOPn Factory.
    return [];
  }, [isConnected]);

  return {
    positions,
    hasPositions: positions.length > 0,
  };
}