"use client";

import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { toast } from "sonner";

import { ROUTER_ABI } from "@/lib/routerAbi";
import { ROUTER_ADDRESS } from "@/lib/router";
import { Config } from "@/lib/wagmi";

export function useRemoveLiquidity() {
  const { address } = useAccount();

  const {
    writeContractAsync,
    isPending,
  } = useWriteContract();

  async function removeLiquidity(
    tokenA: `0x${string}`,
    tokenB: `0x${string}`,
    liquidity: bigint
  ) {
    if (!address) {
      toast.error("Connect wallet first");
      return null;
    }

    try {
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + 1200
      );

      toast.loading("Removing liquidity...", {
        id: "remove-liquidity",
      });

      const hash = await writeContractAsync({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "removeLiquidity",
        args: [
          tokenA,
          tokenB,
          liquidity,
          0n,
          0n,
          address,
          deadline,
        ],
      });

      await waitForTransactionReceipt(Config, {
        hash,
      });

      toast.success("Liquidity removed successfully ✅", {
        id: "remove-liquidity",
      });

      return hash;
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.shortMessage ??
          error?.message ??
          "Failed to remove liquidity",
        {
          id: "remove-liquidity",
        }
      );

      return null;
    }
  }

  return {
    removeLiquidity,
    isPending,
  };
}