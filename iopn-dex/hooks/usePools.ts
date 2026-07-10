"use client";


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
        Number(length);



      const list:string[] = [];



      for(
        let i = 0;
        i < total;
        i++
      ){


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
                BigInt(i)
              ],

            }
          );



        list.push(pair);

      }



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




  useEffect(()=>{

    loadPools();

  },[]);



  return {

    pairs,

    loading,

  };


}