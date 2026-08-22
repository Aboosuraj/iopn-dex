"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  readContract,
} from "wagmi/actions";

import {
  config,
} from "@/lib/wagmi";

import {
  FACTORY_ADDRESS,
  WOPN_ADDRESS,
} from "@/lib/router";

import {
  FACTORY_ABI,
} from "@/lib/factoryAbi";

import {
  PAIR_ABI,
} from "@/lib/pairAbi";

import {
  TOKENS,
} from "@/lib/tokens";

import {
  getImportedTokens,
  saveImportedToken,
} from "@/lib/importedTokens";


export type Token = {

  symbol: string;

  name?: string;

  address: string;

  decimals: number;

  native: boolean;

  imported?: boolean;

  verified?: boolean;

  logo?: string;

  price?: number;

  change24h?: number;

};


const ERC20_METADATA_ABI = [

  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "string",
      },
    ],
  },

  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "string",
      },
    ],
  },

  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "uint8",
      },
    ],
  },

] as const;


function normalizeToken(
  token: Token
): Token {

  return {

    ...token,

    address:
      token.address,

    symbol:
      token.symbol,

    decimals:
      Number(
        token.decimals
      ),

    native:
      Boolean(
        token.native
      ),

  };

}


function mergeTokens(
  listedTokens: Token[],
  importedTokens: Token[],
  discoveredTokens: Token[]
): Token[] {

  const map =
    new Map<
      string,
      Token
    >();


  /*
   * Official/listed tokens.
   */
  for (
    const token of listedTokens
  ) {

    map.set(
      token.address.toLowerCase(),
      normalizeToken(
        token
      )
    );

  }


  /*
   * Factory-discovered tokens.
   */
  for (
    const token of discoveredTokens
  ) {

    const key =
      token.address.toLowerCase();


    if (
      !map.has(key)
    ) {

      map.set(
        key,
        normalizeToken(
          token
        )
      );

    }

  }


  /*
   * User imported tokens.
   */
  for (
    const token of importedTokens
  ) {

    const key =
      token.address.toLowerCase();


    if (
      !map.has(key)
    ) {

      map.set(
        key,
        normalizeToken({
          ...token,
          imported: true,
        })
      );

    }

  }


  return Array.from(
    map.values()
  );

}


async function discoverFactoryTokens(): Promise<Token[]> {

  try {

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


    const indexes =
      Array.from(
        {
          length: total,
        },
        (_, index) =>
          BigInt(index)
      );


    /*
     * Discover all pair addresses.
     */
    const pairAddresses =
      await Promise.all(

        indexes.map(
          async (index) => {

            try {

              return await readContract(
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
              ) as string;

            } catch {

              return null;

            }

          }
        )

      );


    const validPairs =
      pairAddresses.filter(
        (
          pair
        ): pair is string =>
          Boolean(pair)
      );


    /*
     * Collect token addresses.
     */
    const tokenAddresses =
      new Set<string>();


    /*
     * Always include WOPN.
     */
    tokenAddresses.add(
      WOPN_ADDRESS.toLowerCase()
    );


    for (
      const pair of validPairs
    ) {

      try {

        const [
          token0,
          token1,
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

          ]);


        tokenAddresses.add(
          (
            token0 as string
          ).toLowerCase()
        );


        tokenAddresses.add(
          (
            token1 as string
          ).toLowerCase()
        );

      } catch {

        /*
         * Ignore invalid pairs.
         */

      }

    }


    /*
     * Remove WOPN because it already exists
     * in the official token list.
     */
    tokenAddresses.delete(
      WOPN_ADDRESS.toLowerCase()
    );


    /*
     * Read metadata from discovered ERC20s.
     *
     * Some contracts may fail metadata calls,
     * therefore each result can be Token or null.
     */
    const discovered: Array<Token | null> =
      await Promise.all(

        Array.from(
          tokenAddresses
        ).map(
          async (address): Promise<Token | null> => {

            try {

              const [
                symbol,
                name,
                decimals,
              ] =
                await Promise.all([

                  readContract(
                    config,
                    {
                      address:
                        address as `0x${string}`,

                      abi:
                        ERC20_METADATA_ABI,

                      functionName:
                        "symbol",
                    }
                  ),

                  readContract(
                    config,
                    {
                      address:
                        address as `0x${string}`,

                      abi:
                        ERC20_METADATA_ABI,

                      functionName:
                        "name",
                    }
                  ),

                  readContract(
                    config,
                    {
                      address:
                        address as `0x${string}`,

                      abi:
                        ERC20_METADATA_ABI,

                      functionName:
                        "decimals",
                    }
                  ),

                ]);


              return {

                symbol:
                  String(symbol),

                name:
                  String(name),

                address,

                decimals:
                  Number(decimals),

                native:
                  false,

                imported:
                  false,

                verified:
                  false,

              };

            } catch (
              error
            ) {

              console.warn(
                "Token metadata failed:",
                address,
                error
              );

              return null;

            }

          }
        )

      );


    /*
     * Remove failed/null metadata results.
     *
     * Explicitly build a Token[] so TypeScript
     * cannot infer the result as (Token | null)[].
     */
    const validTokens: Token[] =
      discovered.filter(
        (
          token
        ): token is Token =>
          token !== null
      );


    return validTokens;

  } catch (
    error
  ) {

    console.error(
      "Factory token discovery failed:",
      error
    );

    return [];

  }

}


export function useTokens() {

  const [
    tokens,
    setTokens,
  ] =
    useState<Token[]>(() =>
      (
        TOKENS as unknown as Token[]
      ).map(
        normalizeToken
      )
    );


  const [
    discovering,
    setDiscovering,
  ] =
    useState(false);


  const loadTokens =
    useCallback(
      async () => {

        setDiscovering(
          true
        );


        try {

          const importedTokens =
            getImportedTokens();


          const discoveredTokens =
            await discoverFactoryTokens();


          setTokens(
            mergeTokens(
              TOKENS as unknown as Token[],
              importedTokens,
              discoveredTokens
            )
          );

        } finally {

          setDiscovering(
            false
          );

        }

      },
      []
    );


  useEffect(() => {

    loadTokens();


    /*
     * Check Factory for new pools/tokens
     * every minute.
     */
    const interval =
      window.setInterval(
        loadTokens,
        60 * 1000
      );


    const handleUpdate =
      () => {
        loadTokens();
      };


    window.addEventListener(
      "iopn-imported-tokens-updated",
      handleUpdate
    );


    return () => {

      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "iopn-imported-tokens-updated",
        handleUpdate
      );

    };

  }, [
    loadTokens,
  ]);


  const addToken =
    useCallback(
      (token: Token) => {

        const normalized =
          normalizeToken({

            ...token,

            imported:
              token.imported ??
              true,

          });


        if (
          !normalized.native
        ) {

          saveImportedToken({

            symbol:
              normalized.symbol,

            name:
              normalized.name ??
              normalized.symbol,

            address:
              normalized.address,

            decimals:
              normalized.decimals,

            native:
              false,

            imported:
              true,

          });

        }


        setTokens(
          current => {

            const exists =
              current.some(
                item =>
                  item.address.toLowerCase() ===
                  normalized.address.toLowerCase()
              );


            if (
              exists
            ) {

              return current.map(
                item =>
                  item.address.toLowerCase() ===
                  normalized.address.toLowerCase()
                    ? {
                        ...item,
                        ...normalized,
                      }
                    : item
              );

            }


            return [
              ...current,
              normalized,
            ];

          }
        );

      },
      []
    );


  return {

    tokens,

    addToken,

    discovering,

    refreshTokens:
      loadTokens,

  };

}