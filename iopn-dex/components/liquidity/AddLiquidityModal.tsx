"use client";

import { useState, useEffect } from "react";

import { useAccount } from "wagmi";

import type { Token } from "@/hooks/useTokens";

import { useApprove } from "@/hooks/useApprove";

import { ROUTER_ADDRESS } from "@/lib/router";

import { useLiquidityQuote } from "@/hooks/useLiquidityQuote";

import { useTokenBalance } from "@/hooks/useTokenBalance";

type Props = {

  open: boolean;

  onClose: () => void;

  tokens: Token[];

  pools: any[];

  selectedPool?: any;

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

  selectedPool,

  onSupply,

  loading,

}: Props)
{

  const { address } = useAccount();

  const [tokenA, setTokenA] =
    useState<Token | null>(null);

  const [tokenB, setTokenB] =
    useState<Token | null>(null);


    const balanceA = useTokenBalance({
        owner: address,
          token: tokenA?.address as `0x${string}` | undefined,
            native: tokenA?.native,
            });

            const balanceB = useTokenBalance({
              owner: address,
                token: tokenB?.address as `0x${string}` | undefined,
                  native: tokenB?.native,
                  });

    useEffect(()=>{

if(!selectedPool || tokens.length === 0)
return;


const first = tokens.find(
(t)=>
t.address.toLowerCase()
===
selectedPool.token0.toLowerCase()
);


const second = tokens.find(
(t)=>
t.address.toLowerCase()
===
selectedPool.token1.toLowerCase()
);


if(first)
setTokenA(first);


if(second)
setTokenB(second);


},[
selectedPool,
tokens
]);

  const [amountA, setAmountA] =
    useState("");

  const [amountB, setAmountB] =
    useState("");

  const {
  amountB: quotedAmountB,
  poolShare,
  lpEstimate,
} = useLiquidityQuote(
  tokenA,
  tokenB,
  amountA,
  pools,
  selectedPool
);

  useEffect(() => {

    if (quotedAmountB) {

      setAmountB(quotedAmountB);

    }

  }, [quotedAmountB]);

  const approveA = useApprove(

    tokenA?.address as `0x${string}` | undefined,

    ROUTER_ADDRESS as `0x${string}`

  );

  const approveB = useApprove(

    tokenB?.address as `0x${string}` | undefined,

    ROUTER_ADDRESS as `0x${string}`

  );

  async function handleApprove() {

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

    }

  }

  async function handleSupply() {

    if (!tokenA || !tokenB) return;

    await onSupply(

      tokenA,

      tokenB,

      amountA,

      amountB

    );

    onClose();

  }

  if (!open) return null;
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

<div
className="
mt-6
rounded-2xl
bg-white/5
p-4
"
>

<p className="text-sm text-zinc-400">

Token A

</p>

<select

value={tokenA?.symbol || ""}

onChange={(e)=>{

const selected =
tokens.find(
(t)=>
t.symbol===e.target.value
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

<p className="mt-2 text-xs text-zinc-400">
  Balance: {balanceA.loading ? "Loading..." : `${balanceA.balance} ${tokenA?.symbol ?? ""}`}
  </p>

</div>



<div
className="
flex
justify-center
py-4
text-2xl
text-yellow-400
"
>

+

</div>



{/* TOKEN B */}

<div
className="
rounded-2xl
bg-white/5
p-4
"
>

<p className="text-sm text-zinc-400">

Token B

</p>

<select

value={tokenB?.symbol || ""}

onChange={(e)=>{

const selected =
tokens.find(
(t)=>
t.symbol===e.target.value
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

value={amountB}

readOnly

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

<p className="mt-2 text-xs text-zinc-400">
    Balance: {balanceB.loading ? "Loading..." : `${balanceB.balance} ${tokenB?.symbol ?? ""}`}
    </p>

</div>


{/* INFO */}

<div
className="
mt-5
rounded-2xl
bg-white/5
p-4
text-sm
text-zinc-300
"
>

<div
className="
flex
justify-between
"
>

<span>
Pool Share
</span>

<span className="font-bold text-yellow-400">
{poolShare}
</span>

</div>



<div
className="
mt-3
flex
justify-between
"
>

<span>
LP Tokens Estimated
</span>

<span className="font-bold text-white">
{lpEstimate}
</span>

</div>


<div
className="
mt-3
flex
justify-between
"
>

<span>
Quote Amount
</span>

<span className="font-bold text-green-400">
{amountB || "0"}
</span>

</div>


</div>





{/* ACTION BUTTONS */}

<div
className="
mt-6
space-y-3
"
>

<button

onClick={handleApprove}

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

?

"Approving..."

:

"Approve Tokens"

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