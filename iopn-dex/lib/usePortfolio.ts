"use client";

import {
  useAccount,
  useBalance,
  useReadContracts,
} from "wagmi";

import {
  ERC20_ABI,
} from "@/lib/erc20";

import {
  TOKENS,
} from "@/lib/tokens";



export function usePortfolio() {


  const {
    address,
    isConnected,
  } = useAccount();



  // Native OPN balance

  const nativeBalance = useBalance({

    address,

    query: {

      enabled:
        !!address,

    },

  });





  // ERC20 token balances

  const tokenContracts =
    TOKENS.map((token)=>({

      address:
        token.address as `0x${string}`,

      abi:
        ERC20_ABI,

      functionName:
        "balanceOf",

      args:
        address
        ?
        [
          address
        ]
        :
        undefined,


    }));





  const tokenBalances =
    useReadContracts({

      contracts:
        tokenContracts,


      query: {

        enabled:
          !!address &&
          isConnected,


        refetchInterval:
          10000,

      },


    });






  return {

    address,

    isConnected,

    nativeBalance,

    tokenBalances,

  };


}