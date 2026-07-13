"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  formatUnits,
  parseUnits,
} from "viem";

import type { Token } from "@/hooks/useTokens";


type Pool = {

  address: string;

  token0: string;

  token1: string;

  reserve0: string | bigint;

  reserve1: string | bigint;

  symbol0: string;

  symbol1: string;

};



export function useLiquidityQuote(
  tokenA: Token | null,
  tokenB: Token | null,
  amountA: string,
  pools: Pool[],
  selectedPool?: Pool | null
)

{
  const [
    amountB,
    setAmountB
  ] = useState("");


  const [
    poolShare,
    setPoolShare
  ] = useState("--");


  const [
    lpEstimate,
    setLpEstimate
  ] = useState("--");




  useEffect(()=>{


    if(

      !tokenA ||

      !tokenB ||

      !amountA ||

      Number(amountA)<=0

    ){

      setAmountB("");

      setPoolShare("--");

      setLpEstimate("--");

      return;

    }





    const pool =
  selectedPool ||
  pools.find((p) => {

    return (
      (
        p.token0.toLowerCase() === tokenA.address.toLowerCase()
        &&
        p.token1.toLowerCase() === tokenB.address.toLowerCase()
      )
      ||
      (
        p.token0.toLowerCase() === tokenB.address.toLowerCase()
        &&
        p.token1.toLowerCase() === tokenA.address.toLowerCase()
      )
    );

  });





    if(!pool){


      console.log(
        "No liquidity pool found",
        tokenA.symbol,
        tokenB.symbol
      );


      setAmountB("");

      setPoolShare("--");

      setLpEstimate("--");

      return;

    }






    try{


      const reserve0 =
        BigInt(pool.reserve0);



      const reserve1 =
        BigInt(pool.reserve1);





      const tokenAIs0 =

        pool.token0.toLowerCase()

        ===

        tokenA.address.toLowerCase();




      const reserveA =
  tokenAIs0
  ?
  reserve0
  :
  reserve1;


const reserveB =
  tokenAIs0
  ?
  reserve1
  :
  reserve0;




      if(reserveA===0n){

        return;

      }






      const amountABig =

        parseUnits(

          amountA,

          tokenA.decimals

        );





      const amountBBig =

        (

          amountABig *

          reserveB

        )

        /

        reserveA;







      const formattedB =

        formatUnits(

          amountBBig,

          tokenB.decimals

        );





      setAmountB(
        formattedB
      );








      const totalPool =

        reserveA + amountABig;





      const share =

        Number(amountABig)

        /

        Number(totalPool);






      setPoolShare(

        (

          share * 100

        )

        .toFixed(4)

        +

        "%"

      );





      setLpEstimate(

        (

          share * 1000

        )

        .toFixed(4)

      );



    }

    catch(error){


      console.error(
        "Liquidity quote error:",
        error
      );


      setAmountB("");

      setPoolShare("--");

      setLpEstimate("--");


    }




  },[

    tokenA,

    tokenB,

    amountA,

    pools

  ]);





  return {

    amountB,

    poolShare,

    lpEstimate,

  };


}