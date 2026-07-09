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


  const {
    data: native,
    refetch: refetchNative,
  } = useNativeBalance({
    address,
  });



  const {
    data: erc20,
    refetch: refetchERC20,
  } = useReadContract({

    address:

      !token.native

        ? token.address as `0x${string}`

        : undefined,


    abi: ERC20_ABI,


    functionName: "balanceOf",


    args:

      address && !token.native

        ? [address]

        : undefined,


    query: {

      enabled:

        !!address && !token.native,

    },

  });



  const balance = token.native

    ?

    native?.formatted || "0"


    :

    erc20

      ?

      formatUnits(
        erc20 as bigint,
        token.decimals
      )


      :

      "0";




  async function refetch() {


    if (token.native) {

      await refetchNative();

    }

    else {

      await refetchERC20();

    }

  }




  return {

    balance,

    refetch,

  };


}