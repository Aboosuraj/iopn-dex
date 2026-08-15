"use client";

import {
  useAccount,
  useBalance as useNativeBalance,
  useReadContract,
} from "wagmi";

import { ERC20_ABI } from "@/lib/erc20";
import { formatUnits } from "viem";

import type { Token } from "./useTokens";

export function useTokenBalance(token: Token) {
  const { address } = useAccount();

  /*
   * Native OPN balance
   */
  const {
    data: native,
    refetch: refetchNative,
  } = useNativeBalance({
    address,
    query: {
      enabled: !!address && token.native,
    },
  });

  /*
   * ERC-20 balance
   *
   * The token address is part of the query configuration,
   * so changing the selected token loads that token's balance.
   */
  const {
    data: erc20,
    refetch: refetchERC20,
  } = useReadContract({
    address:
      address && !token.native
        ? (token.address as `0x${string}`)
        : undefined,

    abi: ERC20_ABI,

    functionName: "balanceOf",

    args:
      address && !token.native
        ? [address]
        : undefined,

    query: {
      enabled: !!address && !token.native,
      staleTime: 0,
    },
  });

  /*
   * Return the balance belonging to the CURRENTLY selected token.
   */
  let balance = "0";

  if (token.native) {
    balance = native?.formatted ?? "0";
  } else if (erc20 !== undefined) {
    balance = formatUnits(
      erc20 as bigint,
      token.decimals
    );
  }

  /*
   * Manual refresh used after a successful swap.
   */
  async function refetch() {
    if (token.native) {
      await refetchNative();
    } else {
      await refetchERC20();
    }
  }

  return {
    balance,
    refetch,
  };
}