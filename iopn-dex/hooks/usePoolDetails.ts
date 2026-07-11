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

  address:string;

  token0:string;

  token1:string;

  symbol0:string;

  symbol1:string;

  reserve0:string;

  reserve1:string;

};



export function usePoolDetails(
  pairs:string[]
){


  const [pools,setPools] =
    useState<Pool[]>([]);


  const [loading,setLoading] =
    useState(true);



  async function getSymbol(
    address:string
  ){

    try{

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


    }catch{

      return "TOKEN";

    }

  }





  async function load(){


    try{


      const result:Pool[]=[];



      for(const pair of pairs){


        const token0 =
          await readContract(
            Config,
            {
              address:
                pair as `0x${string}`,

              abi:
                PAIR_ABI,

              functionName:
                "token0",
            }
          );



        const token1 =
          await readContract(
            Config,
            {
              address:
                pair as `0x${string}`,

              abi:
                PAIR_ABI,

              functionName:
                "token1",
            }
          );



        const reserves =
          await readContract(
            Config,
            {
              address:
                pair as `0x${string}`,

              abi:
                PAIR_ABI,

              functionName:
                "getReserves",
            }
          );



        const symbol0 =
          await getSymbol(token0);



        const symbol1 =
          await getSymbol(token1);



        result.push({

          address:pair,

          token0,

          token1,

          symbol0,

          symbol1,

          reserve0:
            reserves[0].toString(),

          reserve1:
            reserves[1].toString(),

        });


      }



      setPools(result);


    }
    catch(error){

      console.error(
        "Pair details error:",
        error
      );

    }
    finally{

      setLoading(false);

    }


  }





  useEffect(()=>{

    if(pairs.length){

      load();

    }

  },[pairs]);





  return {

    pools,

    loading,

  };


}