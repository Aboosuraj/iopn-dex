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


import {
  useEffect,
  useState,
} from "react";



export function usePools(){


  const [pairs,setPairs] = useState<string[]>([]);

  const [loading,setLoading] = useState(true);



  async function loadPools(){


    try{


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



      const indexes = Array.from(
  {
    length: total
  },
  (_,i)=>BigInt(i)
);



const list = await Promise.all(

indexes.map(async(index)=>{


const pair = await readContract(

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
]

}

);


return pair;


})

);



setPairs(list);


    }
    catch(error){

      console.error(
        "Pool loading error:",
        error
      );

    }
    finally{

      setLoading(false);

    }


  }




  const {
      data,
        isLoading,
        } = useQuery({
          queryKey: ["iopn-pools"],
            queryFn: loadPools,
              staleTime: 60 * 1000,
              });


  return {

    pairs,

    loading,

  };


}