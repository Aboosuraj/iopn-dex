"use client";

import { useState } from "react";
import type { Token } from "@/hooks/useTokens";
import { useApprove } from "@/hooks/useApprove";
import { ROUTER_ADDRESS } from "@/lib/router";
import { useLiquidityQuote } from "@/hooks/useLiquidityQuote";

type Props = {
  open: boolean;
  onClose: () => void;
  tokens: Token[];
  pools: any[];
  onSupply: (
    tokenA: Token,
    tokenB: Token,
    amountA: string,
    amountB: string
  ) => Promise<void>;
  loading: boolean;
};

export default function AddLiquidityModal({
  open,
  onClose,
  tokens,
  pools,
  onSupply,
  loading,
}: Props) {
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const {
  amountB: quotedAmountB,
  poolShare,
  lpEstimate,
} = useLiquidityQuote(
  tokenA,
  tokenB,
  amountA,
  pools
);

  const approveA = useApprove(
  tokenA?.address as `0x${string}` | undefined,
  ROUTER_ADDRESS as `0x${string}`
);

const approveB = useApprove(
  tokenB?.address as `0x${string}` | undefined,
  ROUTER_ADDRESS as `0x${string}`
);

  if (!open) return null;

  async function handleSupply() {

  if (!tokenA || !tokenB) return;

  if (
    !tokenA.native &&
    approveA.needsApproval(
      amountA,
      tokenA.decimals
    )
  ) {

    await approveA.approve(
      amountA,
      tokenA.decimals
    );

    return;

  }

  if (
    !tokenB.native &&
    approveB.needsApproval(
      amountB,
      tokenB.decimals
    )
  ) {

    await approveB.approve(
      amountB,
      tokenB.decimals
    );

    return;

  }

  await onSupply(
    tokenA,
    tokenB,
    amountA,
    amountB
  );

  onClose();

}

  return (
    <div
      className="
      fixed
      inset-0
      z-[100]
      flex
      items-center
      justify-center
      bg-black/70
      backdrop-blur-sm
    "
    >
      <div
        className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-white/10
        bg-zinc-950
        p-6
        shadow-2xl
      "
      >
        <div className="flex items-center justify-between">

          <h2
            className="
            text-2xl
            font-black
            text-white
          "
          >
            💧 Add Liquidity
          </h2>

          <button
            onClick={onClose}
            className="
            rounded-full
            bg-white/10
            px-3
            py-1
            text-white
          "
          >
            ✕
          </button>

        </div>
                {/* TOKEN A */}

        <div className="
          mt-6
          rounded-2xl
          bg-white/5
          p-4
        ">

          <p className="
            text-sm
            text-zinc-400
          ">
            Token A
          </p>


          <select
            value={tokenA?.symbol || ""}
            onChange={(e)=>{

              const selected =
                tokens.find(
                  (t)=>
                  t.symbol === e.target.value
                );

              setTokenA(
                selected || null
              );

            }}
            className="
              mt-3
              w-full
              rounded-xl
              bg-black
              border
              border-white/10
              p-3
              text-white
              outline-none
            "
          >

            <option value="">
              Select Token
            </option>


            {
              tokens.map((token)=>(

                <option
                  key={token.address}
                  value={token.symbol}
                >
                  {token.symbol}
                </option>

              ))
            }


          </select>



          <input
            type="number"
            placeholder="0.0"
            value={amountA}
            onChange={(e)=>
              setAmountA(
                e.target.value
              )
            }
            className="
              mt-3
              w-full
              rounded-xl
              bg-black
              border
              border-white/10
              p-4
              text-xl
              text-white
              outline-none
            "
          />


        </div>






        {/* PLUS */}

        <div className="
          flex
          justify-center
          py-4
          text-2xl
          text-yellow-400
        ">
          +
        </div>






        {/* TOKEN B */}


        <div className="
          rounded-2xl
          bg-white/5
          p-4
        ">


          <p className="
            text-sm
            text-zinc-400
          ">
            Token B
          </p>




          <select
            value={tokenB?.symbol || ""}
            onChange={(e)=>{

              const selected =
                tokens.find(
                  (t)=>
                  t.symbol === e.target.value
                );


              setTokenB(
                selected || null
              );


            }}
            className="
              mt-3
              w-full
              rounded-xl
              bg-black
              border
              border-white/10
              p-3
              text-white
              outline-none
            "
          >

            <option value="">
              Select Token
            </option>


            {
              tokens.map((token)=>(

                <option
                  key={token.address}
                  value={token.symbol}
                >
                  {token.symbol}
                </option>

              ))
            }


          </select>




          <input
            type="number"
            placeholder="0.0"
            value={quotedAmountB || amountB}
            onChange={(e)=>
              setAmountB(
                e.target.value
              )
            }
            className="
              mt-3
              w-full
              rounded-xl
              bg-black
              border
              border-white/10
              p-4
              text-xl
              text-white
              outline-none
            "
          />



        </div>







        {/* INFO */}


        <div className="
          mt-5
          rounded-2xl
          bg-white/5
          p-4
          text-sm
          text-zinc-300
        ">


          <div className="
            flex
            justify-between
          ">

            <span>
              Pool Share
            </span>

             <span>
  Pool Share
</span>

          </div>



          <div className="
            mt-3
            flex
            justify-between
          ">

            <span>
              LP Tokens
            </span>

            <span>
  {lpEstimate}
</span>

          </div>


        </div>
                {/* ACTIONS */}

        <div className="
          mt-6
          space-y-3
        ">


          <button
  disabled={
    loading ||
    !tokenA ||
    !tokenB
  }
            className="
              w-full
              rounded-2xl
              border
              border-yellow-400/40
              bg-yellow-400/10
              py-3
              font-bold
              text-yellow-400
              transition
              hover:bg-yellow-400/20
              disabled:opacity-50
            "
          >
            {
  approveA.isPending ||
  approveB.isPending
    ? "Approving..."
    : "Approve Tokens"
}
          </button>




          <button
            onClick={handleSupply}
            disabled={
              loading ||
              !tokenA ||
              !tokenB ||
              !amountA ||
              !amountB
            }
            className="
              w-full
              rounded-2xl
              bg-yellow-400
              py-4
              font-black
              text-black
              transition
              hover:brightness-110
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {
              loading
              ?
              "Supplying..."
              :
              "Supply Liquidity"
            }

          </button>





          <button
            onClick={onClose}
            className="
              w-full
              rounded-2xl
              bg-white/10
              py-3
              font-bold
              text-white
              transition
              hover:bg-white/20
            "
          >
            Cancel
          </button>



        </div>



      </div>


    </div>

  );


}