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

import type {
  Token,
} from "./useTokens";

import {
  toast,
} from "sonner";

import {
  saveSwap,
} from "@/lib/history";


export function useSwap() {

  const {
    address,
  } =
    useAccount();


  const {
    writeContractAsync,
    isPending,
  } =
    useWriteContract();


  const [
    swapSuccess,
    setSwapSuccess,
  ] =
    useState(false);


  /*
   * =========================================================
   * TOKEN ADDRESS
   * =========================================================
   */

  const getAddress =
    useCallback(
      (
        token: Token
      ) => {

        return (
          token.native
            ? WOPN_ADDRESS
            : token.address
        ) as `0x${string}`;

      },
      []
    );


  /*
   * =========================================================
   * BUILD POSSIBLE PATHS
   * =========================================================
   *
   * Direct:
   *
   * A → B
   *
   * WOPN:
   *
   * A → WOPN → B
   *
   * Native OPN is represented by WOPN
   * internally.
   */

  const getPossiblePaths =
    useCallback(
      (
        tokenIn: Token,
        tokenOut: Token
      ) => {

        const input =
          getAddress(
            tokenIn
          );


        const output =
          getAddress(
            tokenOut
          );


        const paths:
          `0x${string}`[][] =
          [];


        /*
         * Direct route.
         */
        if (
          input.toLowerCase() !==
          output.toLowerCase()
        ) {

          paths.push([
            input,
            output,
          ]);

        }


        /*
         * WOPN intermediary route.
         */
        const inputIsWOPN =
          input.toLowerCase() ===
          WOPN_ADDRESS.toLowerCase();


        const outputIsWOPN =
          output.toLowerCase() ===
          WOPN_ADDRESS.toLowerCase();


        if (
          !inputIsWOPN &&
          !outputIsWOPN
        ) {

          paths.push([

            input,

            WOPN_ADDRESS as `0x${string}`,

            output,

          ]);

        }


        return paths;

      },
      [
        getAddress,
      ]
    );


  /*
   * =========================================================
   * FIND BEST ROUTE
   * =========================================================
   *
   * We don't assume a pool exists.
   *
   * We ask the deployed Router.
   *
   * If getAmountsOut works and returns > 0,
   * the route is usable.
   */

  const findBestRoute =
    useCallback(
      async (
        amount: string,
        tokenIn: Token,
        tokenOut: Token
      ) => {

        if (
          !amount ||
          Number(amount) <= 0
        ) {

          return null;

        }


        const value =
          parseUnits(
            amount,
            tokenIn.decimals
          );


        const paths =
          getPossiblePaths(
            tokenIn,
            tokenOut
          );


        let best:
          {
            path: `0x${string}`[];
            amountOut: bigint;
          } | null =
          null;


        for (
          const path of paths
        ) {

          try {

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

              continue;

            }


            const output =
              amounts[
                amounts.length - 1
              ];


            if (
              output <= 0n
            ) {

              continue;

            }


            if (
              !best ||
              output >
                best.amountOut
            ) {

              best = {

                path,

                amountOut:
                  output,

              };

            }

          } catch {

            /*
             * This route doesn't exist
             * or doesn't have liquidity.
             */
          }

        }


        return best;

      },
      [
        getPossiblePaths,
      ]
    );


  /*
   * =========================================================
   * GET QUOTE
   * =========================================================
   */

  const getQuote =
    useCallback(
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


        if (
          tokenIn.address.toLowerCase() ===
          tokenOut.address.toLowerCase()
        ) {

          return "0";

        }


        const route =
          await findBestRoute(
            amount,
            tokenIn,
            tokenOut
          );


        if (
          !route
        ) {

          return "0";

        }


        return formatUnits(
          route.amountOut,
          tokenOut.decimals
        );

      },
      [
        findBestRoute,
      ]
    );


  /*
   * =========================================================
   * WAIT FOR SUCCESS
   * =========================================================
   */

  const waitSuccess =
    useCallback(
      async (
        hash: `0x${string}`
      ) => {

        toast.loading(
          "Waiting for confirmation...",
          {
            id:
              "swap",
          }
        );


        await waitForTransactionReceipt(
          config,
          {
            hash,
          }
        );


        setSwapSuccess(
          true
        );


        toast.success(
          "Swap successful ✅",
          {
            id:
              "swap",
          }
        );

      },
      []
    );


  /*
   * =========================================================
   * SWAP
   * =========================================================
   */

  const swap =
    useCallback(
      async (
        amount: string,
        tokenIn: Token,
        tokenOut: Token,
        slippage: number
      ) => {

        if (
          !address
        ) {

          toast.error(
            "Connect wallet first"
          );

          return null;

        }


        try {

          setSwapSuccess(
            false
          );


          /*
           * Find the actual usable route.
           */
          const route =
            await findBestRoute(
              amount,
              tokenIn,
              tokenOut
            );


          if (
            !route
          ) {

            toast.error(
              "No swap route available"
            );

            return null;

          }


          const path =
            route.path;


          const amountIn =
            parseUnits(
              amount,
              tokenIn.decimals
            );


          const quoteValue =
            route.amountOut;


          /*
           * Calculate minimum received.
           *
           * Example:
           *
           * quote = 100
           * slippage = 0.5%
           *
           * minimum = 99.5
           */
          const slippageBps =
            BigInt(
              Math.round(
                slippage * 100
              )
            );


          const minimum =
            (
              quoteValue *
              (
                10000n -
                slippageBps
              )
            ) /
            10000n;


          const deadline =
            BigInt(
              Math.floor(
                Date.now() / 1000
              ) + 1200
            );


          let hash:
            `0x${string}`;


          /*
           * =====================================================
           * OPN → TOKEN
           * =====================================================
           */

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


          /*
           * =====================================================
           * TOKEN → OPN
           * =====================================================
           */

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


          /*
           * =====================================================
           * TOKEN → TOKEN
           * =====================================================
           */

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


          /*
           * Wait for confirmation once.
           */
          await waitSuccess(
            hash
          );


          const quote =
            formatUnits(
              quoteValue,
              tokenOut.decimals
            );


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

        catch (
          error: any
        ) {

          console.error(
            "Swap Error:",
            error
          );


          toast.error(

            error?.shortMessage ||

            error?.message ||

            "Swap failed ❌",

            {
              id:
                "swap",
            }

          );


          return null;

        }

      },
      [
        address,
        findBestRoute,
        waitSuccess,
        writeContractAsync,
      ]
    );


  return {

    getQuote,

    swap,

    findBestRoute,

    isPending,

    swapSuccess,

  };

}