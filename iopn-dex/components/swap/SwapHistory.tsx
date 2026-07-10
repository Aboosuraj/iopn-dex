"use client";

import { getSwapHistory } from "@/lib/history";


export default function SwapHistory(){

  const history = getSwapHistory();


  return (

    <div className="
      mt-6
      rounded-3xl
      border
      border-white/10
      bg-white/5
      p-5
      backdrop-blur-xl
    ">

      <h2 className="
        mb-4
        text-xl
        font-bold
        text-white
      ">
        Swap History
      </h2>


      {
        history.length === 0 ?

        (
          <p className="
            text-sm
            text-white/50
          ">
            No swaps yet
          </p>
        )

        :

        history.map((tx)=>(
          
          <div
            key={tx.hash}
            className="
              mb-3
              rounded-2xl
              bg-black/30
              p-4
            "
          >

            <div className="
              flex
              justify-between
              font-bold
            ">

              <span>
                {tx.tokenIn}
                →
                {tx.tokenOut}
              </span>


              <span className="
                text-green-400
              ">
                Success
              </span>

            </div>


            <p className="
              mt-2
              text-sm
              text-white/60
            ">
              {tx.amountIn}
              {" "}
              {tx.tokenIn}
              {" → "}
              {tx.amountOut}
              {" "}
              {tx.tokenOut}
            </p>


          </div>

        ))

      }


    </div>

  );

}