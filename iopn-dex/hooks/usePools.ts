"use client";

import { useQuery } from "@tanstack/react-query";

import {
  readContract,
} from "wagmi/actions";

import {
  Config,
} from "@/lib/wagmi";

import {
  FACTORY_ADDRESS,
} from "@/lib/router";

import {
  FACTORY_ABI,
} from "@/lib/factoryAbi";



async function loadPools() {


  const length =
    await readContract(
      Config,
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
    Math.min(
      Number(length),
      15
    );



  const indexes =
    Array.from(
      {
        length: total
      },
      (_, i) => BigInt(i)
    );



  const pairs =
    await Promise.all(

      indexes.map(
        async(index)=>{


          const pair =
            await readContract(
              Config,
              {
                address:
                  FACTORY_ADDRESS as `0x${string}`,

                abi:
                  FACTORY_ABI,

                functionName:
                  "allPairs",

                args:[
                  index
                ],
              }
            );


          return pair as string;


        }
      )

    );



  return pairs;

}





export function usePools(){



  const {
    data:pairs = [],

    isLoading,

    isFetching,

    error,

  } = useQuery({

    queryKey:[
      "iopn-pools"
    ],


    queryFn:
      loadPools,


    staleTime:
      60 * 1000,


    retry:
      2,


  });



  if(error){

    console.error(
      "Pool loading error:",
      error
    );

  }




  return {


    pairs,


    loading:
      isLoading || isFetching,


  };


}