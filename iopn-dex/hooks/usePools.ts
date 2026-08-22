"use client";

import { useQuery } from "@tanstack/react-query";

import {
  readContract,
} from "wagmi/actions";

import {
  config,
} from "@/lib/wagmi";

import {
  FACTORY_ADDRESS,
} from "@/lib/router";

import {
  FACTORY_ABI,
} from "@/lib/factoryAbi";

import {
  PAIR_ABI,
} from "@/lib/pairAbi";


export type Pool = {
  pair: string;
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
  hasLiquidity: boolean;
};


async function loadPools(): Promise<Pool[]> {

  const length =
    await readContract(
      config,
      {
        address:
          FACTORY_ADDRESS as `0x${string}`,

        abi:
          FACTORY_ABI,

        functionName:
          "allPairsLength",
      }
    );


  const total =
    Number(length);


  if (
    total <= 0
  ) {
    return [];
  }


  /*
   * Discover EVERY pair.
   *
   * No artificial 15-pair limit.
   */
  const indexes =
    Array.from(
      {
        length: total,
      },
      (_, index) =>
        BigInt(index)
    );


  const pairs =
    await Promise.all(

      indexes.map(
        async (index) => {

          try {

            const pair =
              await readContract(
                config,
                {
                  address:
                    FACTORY_ADDRESS as `0x${string}`,

                  abi:
                    FACTORY_ABI,

                  functionName:
                    "allPairs",

                  args: [
                    index,
                  ],
                }
              );


            return pair as string;

          } catch {

            return null;

          }

        }
      )

    );


  const validPairs =
    pairs.filter(
      (
        pair
      ): pair is string =>
        Boolean(pair)
    );


  /*
   * Read every pair's token addresses,
   * reserves and LP supply.
   */
  const pools =
    await Promise.all(

      validPairs.map(
        async (pair) => {

          try {

            const [
              token0,
              token1,
              reserves,
              totalSupply,
            ] =
              await Promise.all([

                readContract(
                  config,
                  {
                    address:
                      pair as `0x${string}`,

                    abi:
                      PAIR_ABI,

                    functionName:
                      "token0",
                  }
                ),

                readContract(
                  config,
                  {
                    address:
                      pair as `0x${string}`,

                    abi:
                      PAIR_ABI,

                    functionName:
                      "token1",
                  }
                ),

                readContract(
                  config,
                  {
                    address:
                      pair as `0x${string}`,

                    abi:
                      PAIR_ABI,

                    functionName:
                      "getReserves",
                  }
                ),

                readContract(
                  config,
                  {
                    address:
                      pair as `0x${string}`,

                    abi:
                      PAIR_ABI,

                    functionName:
                      "totalSupply",
                  }
                ),

              ]);


            const [
              reserve0,
              reserve1,
            ] =
              reserves as [
                bigint,
                bigint,
                number
              ];


            const liquidity =
              reserve0 > 0n &&
              reserve1 > 0n;


            return {

              pair,

              token0:
                token0 as string,

              token1:
                token1 as string,

              reserve0,

              reserve1,

              totalSupply:
                totalSupply as bigint,

              hasLiquidity:
                liquidity,

            };

          } catch (
            error
          ) {

            console.error(
              "Failed to read pair:",
              pair,
              error
            );

            return null;

          }

        }
      )

    );


  return pools.filter(
    (
      pool
    ): pool is Pool =>
      pool !== null
  );

}


export function usePools() {

  const {
    data: pools = [],

    isLoading,

    isFetching,

    error,

    refetch,

  } =
    useQuery({

      queryKey: [
        "iopn-pools",
      ],

      queryFn:
        loadPools,

      /*
       * Keep data fresh for 1 minute.
       */
      staleTime:
        60 * 1000,

      /*
       * Automatically check for newly
       * created pools every minute.
       */
      refetchInterval:
        60 * 1000,

      retry:
        2,

    });


  if (error) {

    console.error(
      "Pool loading error:",
      error
    );

  }


  const pairs =
    pools.map(
      (pool) =>
        pool.pair
    );


  return {

    pools,

    pairs,

    loading:
      isLoading ||
      isFetching,

    refetch,

  };

}