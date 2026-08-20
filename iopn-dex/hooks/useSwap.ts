"use client";

import {
  useCallback,
  useState,
} from "react";

import {
  useWriteContract,
  useAccount,
} from "wagmi";

import {
  readContract,
  waitForTransactionReceipt,
} from "wagmi/actions";

import {
  parseUnits,
  formatUnits,
} from "viem";

import {
  ROUTER_ADDRESS,
  WOPN_ADDRESS,
} from "@/lib/router";

import {
  ROUTER_ABI,
} from "@/lib/routerAbi";

import {
  config,
} from "@/lib/wagmi";

import type { Token } from "./useTokens";

import { toast } from "sonner";

import { saveSwap } from "@/lib/history";


export function useSwap() {

  const { address } = useAccount();

  const {
    writeContractAsync,
    isPending,
  } = useWriteContract();

  const [
    swapSuccess,
    setSwapSuccess,
  ] = useState(false);


  /* =========================================================
     GET PATH
  ========================================================= */

  const getPath = useCallback(
    (
      tokenIn: Token,
      tokenOut: Token
    ) => {

      const input =
        tokenIn.native
          ? WOPN_ADDRESS
          : tokenIn.address;

      const output =
        tokenOut.native
          ? WOPN_ADDRESS
          : tokenOut.address;

      return [
        input as `0x${string}`,
        output as `0x${string}`,
      ];

    },
    []
  );


  /* =========================================================
     GET QUOTE
     
     IMPORTANT:
     useCallback keeps this function stable.
     This prevents SwapPage from requesting
     a new quote on every render.
  ========================================================= */

  const getQuote = useCallback(
    async (
      amount: string,
      tokenIn: Token,
      tokenOut: Token
    ) => {

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        return "0";
      }

      const path =
        getPath(
          tokenIn,
          tokenOut
        );

      const value =
        parseUnits(
          amount,
          tokenIn.decimals
        );

      const result =
        await readContract(
          config,
          {
            address:
              ROUTER_ADDRESS as `0x${string}`,

            abi:
              ROUTER_ABI,

            functionName:
              "getAmountsOut",

            args: [
              value,
              path,
            ],
          }
        );

      const amounts =
        result as bigint[];

      if (
        !amounts ||
        amounts.length === 0
      ) {
        return "0";
      }

      return formatUnits(
        amounts[
          amounts.length - 1
        ],
        tokenOut.decimals
      );

    },
    [getPath]
  );


  /* =========================================================
     WAIT FOR SUCCESS
  ========================================================= */

  const waitSuccess = useCallback(
    async (
      hash: `0x${string}`
    ) => {

      toast.loading(
        "Waiting for confirmation...",
        {
          id: "swap",
        }
      );

      await waitForTransactionReceipt(
        config,
        {
          hash,
        }
      );

      setSwapSuccess(true);

      toast.success(
        "Swap successful ✅",
        {
          id: "swap",
        }
      );

    },
    []
  );


  /* =========================================================
     SWAP
  ========================================================= */

  const swap = useCallback(
    async (
      amount: string,
      tokenIn: Token,
      tokenOut: Token,
      slippage: number
    ) => {

      if (!address) {

        toast.error(
          "Connect wallet first"
        );

        return null;
      }


      try {

        setSwapSuccess(false);


        /* PATH */

        const path =
          getPath(
            tokenIn,
            tokenOut
          );


        /* AMOUNT IN */

        const amountIn =
          parseUnits(
            amount,
            tokenIn.decimals
          );


        /* GET FRESH QUOTE */

        const quote =
          await getQuote(
            amount,
            tokenIn,
            tokenOut
          );


        if (
          !quote ||
          quote === "0"
        ) {

          toast.error(
            "No swap route available"
          );

          return null;
        }


        /* MINIMUM RECEIVED */

        const quoteValue =
          parseUnits(
            quote,
            tokenOut.decimals
          );


        const slippagePercent =
          BigInt(
            Math.floor(
              100 - slippage
            )
          );


        const minimum =
          (
            quoteValue *
            slippagePercent
          ) /
          100n;


        /* DEADLINE */

        const deadline =
          BigInt(
            Math.floor(
              Date.now() / 1000
            ) + 1200
          );


        let hash:
          `0x${string}`;


        /* =====================================================
           OPN -> TOKEN
        ===================================================== */

        if (
          tokenIn.native &&
          !tokenOut.native
        ) {

          hash =
            await writeContractAsync({

              address:
                ROUTER_ADDRESS as `0x${string}`,

              abi:
                ROUTER_ABI,

              functionName:
                "swapExactOPNForTokens",

              args: [
                minimum,
                path,
                address,
                deadline,
              ],

              value:
                amountIn,

            });

        }


        /* =====================================================
           TOKEN -> OPN
        ===================================================== */

        else if (
          !tokenIn.native &&
          tokenOut.native
        ) {

          hash =
            await writeContractAsync({

              address:
                ROUTER_ADDRESS as `0x${string}`,

              abi:
                ROUTER_ABI,

              functionName:
                "swapExactTokensForOPN",

              args: [
                amountIn,
                minimum,
                path,
                address,
                deadline,
              ],

            });

        }


        /* =====================================================
           TOKEN -> TOKEN
        ===================================================== */

        else {

          hash =
            await writeContractAsync({

              address:
                ROUTER_ADDRESS as `0x${string}`,

              abi:
                ROUTER_ABI,

              functionName:
                "swapExactTokensForTokens",

              args: [
                amountIn,
                minimum,
                path,
                address,
                deadline,
              ],

            });

        }


        /* =====================================================
           WAIT ONCE
           
           IMPORTANT:
           Previously this was called twice.
        ===================================================== */

        await waitSuccess(hash);


        /* =====================================================
           SAVE HISTORY
        ===================================================== */

        saveSwap({
          hash,

          tokenIn:
            tokenIn.symbol,

          tokenOut:
            tokenOut.symbol,

          amountIn:
            amount,

          amountOut:
            quote,

          timestamp:
            Date.now(),
        });


        return {

          hash,

          tokenIn,

          tokenOut,

          amountIn:
            amount,

          amountOut:
            quote,

        };

      }

      catch (error: any) {

        console.error(
          "Swap Error:",
          error
        );

        toast.error(

          error?.shortMessage ||

          error?.message ||

          "Swap failed ❌",

          {
            id: "swap",
          }

        );

        return null;
      }

    },
    [
      address,
      getPath,
      getQuote,
      waitSuccess,
      writeContractAsync,
    ]
  );


  /* =========================================================
     RETURN
  ========================================================= */

  return {

    getQuote,

    swap,

    isPending,

    swapSuccess,

  };

}