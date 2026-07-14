"use client";

import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { parseUnits } from "viem";

import { ERC20_ABI } from "@/lib/erc20";

export function useApprove(
  token?: `0x${string}`,
  router?: `0x${string}`
) {
  const { address } = useAccount();

  const {
    data: allowance,
    refetch,
  } = useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      token && router && address
        ? [address, router]
        : undefined,
    query: {
      enabled:
        !!token &&
        !!router &&
        !!address,
    },
  });

  const {
    writeContractAsync,
    data: hash,
    isPending,
    error,
  } = useWriteContract();

  const {
    isLoading: confirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  async function approve(
    amount: string,
    decimals: number
  ) {
    if (!token || !router) return;

    await writeContractAsync({
      address: token,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [
        router,
        parseUnits(amount, decimals),
      ],
    });
  }

  const needsApproval = (
    amount: string,
    decimals: number
  ) => {
    if (!allowance) return true;

    return (
      allowance <
      parseUnits(
        amount,
        decimals
      )
    );
  };

  // Refresh allowance automatically
  // after approval is confirmed
  if (isSuccess) {
    refetch();
  }

  return {
    approve,
    needsApproval,
    allowance,
    refetch,
    hash,
    error,

    isPending,
    confirming,

    approving:
      isPending ||
      confirming,

    approved:
      isSuccess,
  };
}