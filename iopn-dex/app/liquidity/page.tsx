"use client";


import { useState } from "react";

import { useAccount } from "wagmi";

import AddLiquidityModal from "@/components/liquidity/AddLiquidityModal";

import { useTokens } from "@/hooks/useTokens";

import { usePools } from "@/hooks/usePools";

import { usePoolDetails } from "@/hooks/usePoolDetails";

import { useLiquidity } from "@/hooks/useLiquidity";

import { useMyLiquidity } from "@/hooks/useMyLiquidity";



export default function LiquidityPage() {


  const {
    isConnected
  } = useAccount();




  const {
    addLiquidity,
    isPending
  } = useLiquidity();



  const [
    showModal,
    setShowModal
  ] = useState(false);



  const {
    tokens
  } = useTokens();




  const {
    pairs,
    loading:poolsLoading

  } = usePools();




  const {
    pools,
    loading:detailsLoading

  } = usePoolDetails(
    pairs
  );




  const {
    positions,
    loading:positionsLoading

  } = useMyLiquidity(
    pools
  );




  return (

<main className="

min-h-screen

pb-24

bg-gradient-to-b

from-yellow-950

via-black

to-purple-950

text-white

">


<div className="p-5">


<div className="

rounded-3xl

p-8

bg-gradient-to-r

from-yellow-500

to-orange-500

text-black

">


<h1 className="

text-3xl

font-extrabold

">

💧 IOPn Liquidity

</h1>


<p className="

mt-3

font-medium

">

Provide liquidity, earn trading fees,

and support the OPN ecosystem.

</p>


</div>


<div className="

mt-6

grid

grid-cols-2

gap-4

">


<div className="

rounded-3xl

bg-white/5

border

border-white/10

p-5

">


<p className="text-sm text-zinc-400">

Total TVL

</p>


<h2 className="

mt-2

text-2xl

font-bold

">

Coming Soon

</h2>


</div>


<div className="

rounded-3xl

bg-white/5

border

border-white/10

p-5

">


<p className="text-sm text-zinc-400">

Pools

</p>


<h2 className="

mt-2

text-2xl

font-bold

">

{pools.length}

</h2>


</div>


</div>
</div>


<section className="mt-8">


<h2 className="

mb-4

text-xl

font-bold

">

Liquidity Pools

</h2>




{
(poolsLoading || detailsLoading)

&&

<p className="text-zinc-400">

Loading pools...

</p>

}




<div className="space-y-4">


{

pools.map((pool)=>(


<div

key={pool.address}

className="

rounded-3xl

bg-white/5

border

border-white/10

p-5

"

>


<div className="

flex

justify-between

">


<h3 className="

text-lg

font-bold

">

💧 {pool.symbol0} / {pool.symbol1}

</h3>



<span className="

text-green-400

font-bold

">

Active

</span>


</div>





<div className="

mt-4

text-sm

text-zinc-300

space-y-2

">


<p>

Pair Address:

{" "}

{pool.address.slice(0,8)}

...

{pool.address.slice(-6)}

</p>



<p>

Reserve 0:

{" "}

{pool.reserve0}

</p>



<p>

Reserve 1:

{" "}

{pool.reserve1}

</p>


</div>





<button

onClick={()=>setShowModal(true)}

className="

mt-5

w-full

rounded-2xl

bg-yellow-400

py-3

font-black

text-black

"

>

Add Liquidity

</button>



</div>


))


}


</div>


</section>





<section className="

mt-8

rounded-3xl

bg-white/5

border

border-white/10

p-6

">


<h2 className="

text-xl

font-bold

">

My Liquidity

</h2>



{

!isConnected ? (

<p className="mt-4 text-zinc-300">

Connect wallet to view your positions.

</p>


) : positionsLoading ? (


<p className="mt-4 text-zinc-300">

Loading your liquidity...

</p>


) : positions.length === 0 ? (


<p className="mt-4 text-zinc-300">

No liquidity positions found.

</p>


) : (


<div className="space-y-4 mt-4">


{
positions.map((position)=>(


<div

key={position.pair}

className="

rounded-2xl

border

border-white/10

bg-white/5

p-4

"

>


<h3 className="font-bold text-lg">

{position.pair}

</h3>



<p className="text-sm text-zinc-300 mt-2">

LP Balance:

{" "}

{position.lpBalance}

</p>



<p className="text-sm text-zinc-300">

Pool Share:

{" "}

{position.poolShare}

</p>



<p className="text-sm text-zinc-300">

Token 0:

{" "}

{position.token0Amount}

</p>



<p className="text-sm text-zinc-300">

Token 1:

{" "}

{position.token1Amount}

</p>



</div>


))

}


</div>


)


}


</section>
<section className="

mt-8

rounded-3xl

bg-purple-900/30

border

border-purple-500/20

p-6

">


<h2 className="

text-xl

font-bold

">

🌱 Farming & Rewards

</h2>



<p className="

mt-3

text-zinc-300

">

Stake LP tokens, earn OPN rewards,

and participate in future liquidity mining.

</p>


</section>







<AddLiquidityModal


open={showModal}


onClose={()=>setShowModal(false)}


tokens={tokens}


loading={isPending}


onSupply={async(

tokenA,

tokenB,

amountA,

amountB

)=>{


await addLiquidity(

tokenA,

tokenB,

amountA,

amountB

);



setShowModal(false);


}}


/>



</div>


</main>


);


}