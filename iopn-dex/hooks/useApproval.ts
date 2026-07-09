"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { maxUint256, parseUnits } from "viem";

import { ERC20_ABI } from "@/lib/erc20";
import { ROUTER_ADDRESS } from "@/lib/router";

import type { Token } from "./useTokens";

import { toast } from "sonner";

export function useApproval(
  token: Token | null,
  amount: string
) {
  const { address } = useAccount();

  const {
  writeContractAsync,
  isPending
}=useWriteContract();

  const {
    data: allowance,
    refetch,
  } = useReadContract({
    abi: ERC20_ABI,
    address: token?.address as `0x${string}` | undefined,
    functionName: "allowance",
    args:
      token && address
        ? [address, ROUTER_ADDRESS as `0x${string}`]
        : undefined,
    query: {
      enabled: !!token && !!address && !token.native,
    },
  });

  const needsApproval = useMemo(() => {
    if (!token) return false;

    if (token.native) return false;

    if (!amount) return false;

    if (allowance === undefined) return true;

    try {
      const required = parseUnits(amount, token.decimals);

      return allowance < required;
    } catch {
      return true;
    }
  }, [allowance, amount, token]);

  async function approve(){

try{

if(!token || token.native) return;

await writeContractAsync({

address: token.address as `0x${string}`,

abi: ERC20_ABI,

functionName:"approve",

args:[
ROUTER_ADDRESS as `0x${string}`,
maxUint256
]

});


toast.success("Approval successful", {
id:"approve"
});


}

catch(error){

console.error(error);


toast.error("Approval failed", {
id:"approve"
});


}

}

  return {
    allowance,
    needsApproval,
    approve,
    refetch,
    isPending,
  };
}