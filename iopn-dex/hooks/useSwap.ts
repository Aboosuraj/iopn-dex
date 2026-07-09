"use client";

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
  useState,
} from "react";

import {
  ROUTER_ADDRESS,
  WOPN_ADDRESS,
} from "@/lib/router";

import {
  ROUTER_ABI,
} from "@/lib/routerAbi";

import {
  Config,
} from "@/lib/wagmi";

import type { Token } from "./useTokens";

import { toast } from "sonner";


export function useSwap(){

  const { address } = useAccount();


  const {
    writeContractAsync,
    isPending,
  } = useWriteContract();


  const [swapSuccess,setSwapSuccess] = useState(false);



  function getPath(
    tokenIn:Token,
    tokenOut:Token
  ){

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

  }





  async function getQuote(
    amount:string,
    tokenIn:Token,
    tokenOut:Token
  ){

    if(!amount)
      return "0";


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
        Config,
        {

          address:
            ROUTER_ADDRESS as `0x${string}`,

          abi:
            ROUTER_ABI,

          functionName:
            "getAmountsOut",

          args:[
            value,
            path
          ],

        }
      );


    const amounts =
      result as bigint[];


    return formatUnits(
      amounts[amounts.length - 1],
      tokenOut.decimals
    );

  }







  async function waitSuccess(
    hash:`0x${string}`
  ){


    toast.loading(
      "Waiting for confirmation...",
      {
        id:"swap"
      }
    );


    await waitForTransactionReceipt(
      Config,
      {
        hash
      }
    );


    setSwapSuccess(true);


    toast.success(
      "Swap successful ✅",
      {
        id:"swap"
      }
    );


  }







  async function swap(
    amount:string,
    tokenIn:Token,
    tokenOut:Token,
    slippage:number
  ){


    if(!address)
      return;


    try{


      setSwapSuccess(false);



      const path =
        getPath(
          tokenIn,
          tokenOut
        );



      const amountIn =
        parseUnits(
          amount,
          tokenIn.decimals
        );



      const quote =
        await getQuote(
          amount,
          tokenIn,
          tokenOut
        );



      const minimum =
        parseUnits(
          quote,
          tokenOut.decimals
        )
        *
        BigInt(
          100 - slippage
        )
        /
        100n;



      const deadline =
        BigInt(
          Math.floor(
            Date.now()/1000
          )
          +1200
        );





      // OPN -> TOKEN

      if(
        tokenIn.native &&
        !tokenOut.native
      ){


        const hash =
          await writeContractAsync({

            address:
              ROUTER_ADDRESS as `0x${string}`,

            abi:
              ROUTER_ABI,

            functionName:
              "swapExactOPNForTokens",

            args:[
              minimum,
              path,
              address,
              deadline
            ],

            value:
              amountIn,

          });



        await waitSuccess(hash);



        return {

          hash,

          tokenIn,

          tokenOut,

          amountIn:amount,

          amountOut:quote,

        };

      }







      // TOKEN -> OPN

      if(
        !tokenIn.native &&
        tokenOut.native
      ){


        const hash =
          await writeContractAsync({

            address:
              ROUTER_ADDRESS as `0x${string}`,

            abi:
              ROUTER_ABI,

            functionName:
              "swapExactTokensForOPN",

            args:[
              amountIn,
              minimum,
              path,
              address,
              deadline
            ],

          });



        await waitSuccess(hash);



        return {

          hash,

          tokenIn,

          tokenOut,

          amountIn:amount,

          amountOut:quote,

        };

      }







      // TOKEN -> TOKEN


      const hash =
        await writeContractAsync({

          address:
            ROUTER_ADDRESS as `0x${string}`,

          abi:
            ROUTER_ABI,

          functionName:
            "swapExactTokensForTokens",

          args:[
            amountIn,
            minimum,
            path,
            address,
            deadline
          ],

        });



      await waitSuccess(hash);



      return {

        hash,

        tokenIn,

        tokenOut,

        amountIn:amount,

        amountOut:quote,

      };


    }

    catch(error){


      console.error(error);


      toast.error(
        "Swap failed ❌",
        {
          id:"swap"
        }
      );


      return null;

    }


  }






  return {

    getQuote,

    swap,

    isPending,

    swapSuccess,

  };


}