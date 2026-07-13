"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  readContract,
} from "wagmi/actions";

import {
  Config,
} from "@/lib/wagmi";

import {
  PAIR_ABI,
} from "@/lib/pairAbi";


const ERC20_ABI = [
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];


type Pool = {

  address: string;

  token0: string;

  token1: string;

  symbol0: string;

  symbol1: string;

  reserve0: bigint;

  reserve1: bigint;

};



export function usePoolDetails(
  pairs: string[]
) {


  const [
    pools,
    setPools
  ] = useState<Pool[]>([]);



  const [
    loading,
    setLoading
  ] = useState(true);



  async function getSymbol(
    address: string
  ) {

    try {

      const symbol =
        await readContract(
          Config,
          {

            address:
              address as `0x${string}`,

            abi:
              ERC20_ABI,

            functionName:
              "symbol",

          }
        );


      return symbol as string;


    } catch {

      return "TOKEN";

    }

  }


async function getPoolDetails(
  pair: string
): Promise<Pool | null> {

  try {

    const [
      token0,
      token1,
      reserves
    ] = await Promise.all([

      readContract(
        Config,
        {
          address: pair as `0x${string}`,
          abi: PAIR_ABI,
          functionName: "token0",
        }
      ),

      readContract(
        Config,
        {
          address: pair as `0x${string}`,
          abi: PAIR_ABI,
          functionName: "token1",
        }
      ),

      readContract(
        Config,
        {
          address: pair as `0x${string}`,
          abi: PAIR_ABI,
          functionName: "getReserves",
        }
      ),

    ]);


    const [
      symbol0,
      symbol1
    ] = await Promise.all([

      getSymbol(token0),

      getSymbol(token1),

    ]);


    return {

      address: pair,

      token0,

      token1,

      symbol0,

      symbol1,

      reserve0: reserves[0],

      reserve1: reserves[1],

    };


  } catch(error) {

    console.error(
      "Pair details error:",
      pair,
      error
    );

    return null;

  }

}


  async function load() {

    try {

      setLoading(true);


      const result = await Promise.all(

        pairs.map((pair) =>
          getPoolDetails(pair)
        )

      );


      setPools(

        result.filter(
          (pool): pool is Pool =>
            pool !== null
        )

      );

    } catch (error) {

      console.error(
        "Pool loading error:",
        error
      );

    } finally {

      setLoading(false);

    }

  }





  useEffect(() => {

    if (!pairs.length) {

      setPools([]);

      setLoading(false);

      return;

    }

    load();

  }, [pairs]);





  return {

    pools,

    loading,

  };

}