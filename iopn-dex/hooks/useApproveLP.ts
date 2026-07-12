"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ERC20_ABI } from "@/lib/erc20";

export function useApproveLP() {
  const {
    writeContract,
    data: hash,
    isPending,
  } = useWriteContract();

  const {
    isLoading: confirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  function approveLP(
    lpToken: `0x${string}`,
    router: `0x${string}`,
    amount: bigint
  ) {
    writeContract({
      address: lpToken,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [
        router,
        amount,
      ],
    });
  }

  return {
    approveLP,
    hash,
    isPending,
    confirming,
    isSuccess,
  };
}