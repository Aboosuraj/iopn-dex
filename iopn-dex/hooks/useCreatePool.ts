"use client";

import { useCallback } from "react";

import {
  useAccount,
  useWriteContract,
} from "wagmi";

import {
  readContract,
  waitForTransactionReceipt,
} from "wagmi/actions";

import {
  toast,
} from "sonner";

import {
  ROUTER_ADDRESS,
  FACTORY_ADDRESS,
  WOPN_ADDRESS,
} from "@/lib/router";

import {
  FACTORY_ABI,
} from "@/lib/factoryAbi";

import {
  ROUTER_ABI,
} from "@/lib/routerAbi";

import {
  config,
} from "@/lib/wagmi";

import type {
  Token,
} from "@/hooks/useTokens";


export function useCreatePool() {

  const {
    address,
  } = useAccount();

  const {
    writeContractAsync,
    isPending,
  } = useWriteContract();


  /*
   * Get the existing OPN/token pair.
   *
   * The Factory stores the wrapped native token,
   * so OPN is converted to WOPN for pair lookup.
   */

  const getPool = useCallback(
    async (
      token: Token
    ) => {

      if (token.native) {
        return null;
      }

      const pair =
        await readContract(
          config,
          {
            address:
              FACTORY_ADDRESS,

            abi:
              FACTORY_ABI,

            functionName:
              "getPair",

            args: [
              WOPN_ADDRESS,
              token.address as `0x${string}`,
            ],
          }
        );

      const pairAddress =
        pair as `0x${string}`;

      if (
        pairAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        return null;
      }

      return pairAddress;
    },
    []
  );


  /*
   * Create the OPN/token pool.
   *
   * This creates the pair only.
   * Liquidity is added separately.
   */

  const createPool = useCallback(
    async (
      token: Token
    ) => {

      if (!address) {

        toast.error(
          "Connect wallet first"
        );

        return null;
      }

      if (token.native) {

        toast.error(
          "OPN cannot create a pool with itself"
        );

        return null;
      }


      try {

        /*
         * Check whether the pool already exists.
         */

        const existingPool =
          await getPool(token);


        if (existingPool) {

          toast.success(
            "Pool already exists"
          );

          return existingPool;
        }


        toast.loading(
          `Creating OPN/${token.symbol} pool...`,
          {
            id: "create-pool",
          }
        );


        /*
         * Create Factory pair.
         */

        const hash =
          await writeContractAsync({

            address:
              FACTORY_ADDRESS,

            abi:
              FACTORY_ABI,

            functionName:
              "createPair",

            args: [

              WOPN_ADDRESS,

              token.address as `0x${string}`,

            ],

          });


        toast.loading(
          "Waiting for pool creation...",
          {
            id: "create-pool",
          }
        );


        await waitForTransactionReceipt(
          config,
          {
            hash,
          }
        );


        /*
         * Read the pair again after confirmation.
         */

        const pair =
          await getPool(token);


        if (!pair) {

          throw new Error(
            "Pool was created but pair address could not be found."
          );
        }


        toast.success(
          `OPN/${token.symbol} pool created successfully ✅`,
          {
            id: "create-pool",
          }
        );


        return pair;

      } catch (error: any) {

        console.error(
          "Create Pool Error:",
          error
        );


        toast.error(
          error?.shortMessage ||
          error?.message ||
          "Pool creation failed",
          {
            id: "create-pool",
          }
        );


        return null;
      }

    },
    [
      address,
      getPool,
      writeContractAsync,
    ]
  );


  return {

    getPool,

    createPool,

    isPending,

  };
}