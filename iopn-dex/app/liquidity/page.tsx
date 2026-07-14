"use client";

import { useState } from "react";

import { useAccount } from "wagmi";

import AddLiquidityModal from "@/components/liquidity/AddLiquidityModal";

import RemoveLiquidityModal from "@/components/liquidity/RemoveLiquidityModal";

import { useTokens } from "@/hooks/useTokens";

import { usePools } from "@/hooks/usePools";

import { usePoolDetails } from "@/hooks/usePoolDetails";

import { useLiquidity } from "@/hooks/useLiquidity";

import { useMyLiquidity } from "@/hooks/useMyLiquidity";

import { useRemoveLiquidity } from "@/hooks/useRemoveLiquidity";


export default function LiquidityPage() {


  const {
    isConnected
  } = useAccount();



  const {
    addLiquidity,
    isPending
  } = useLiquidity();



  const {
    removeLiquidity,
    isPending: removing
  } = useRemoveLiquidity();



  const [
    showModal,
    setShowModal
  ] = useState(false);


  const [
selectedPool,
setSelectedPool
] = useState<any>(null);



  const [
    showRemoveModal,
    setShowRemoveModal
  ] = useState(false);



  const [
    selectedPosition,
    setSelectedPosition
  ] = useState<any>(null);



  // New UI states only

  const [
    activeTab,
    setActiveTab
  ] = useState<
    "pools" | "liquidity" | "stake"
  >("pools");



  const [
    search,
    setSearch
  ] = useState("");



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


{/* HERO */}

<div className="
rounded-3xl
p-8
bg-gradient-to-r
from-yellow-400
via-orange-500
to-yellow-600
text-black
shadow-xl
">


<h1 className="
text-3xl
font-black
">

💧 IOPn Liquidity

</h1>


<p className="
mt-3
font-medium
">

Provide liquidity, stake liquid assets $USDT $USDC and earn in OPN.

</p>


</div>





{/* STATS */}

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


<p className="
text-sm
text-zinc-400
">

Total TVL

</p>


<h2 className="
mt-2
text-2xl
font-black
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


<p className="
text-sm
text-zinc-400
">

Pools

</p>


<h2 className="
mt-2
text-2xl
font-black
">

{pools?.length ?? 0}

</h2>


</div>


</div>






{/* TABS */}

<div className="
mt-8
flex
gap-2
rounded-3xl
bg-white/5
border
border-white/10
p-2
">


<button

onClick={()=>setActiveTab("pools")}

className={`
flex-1
rounded-2xl
py-3
font-bold
transition

${
activeTab==="pools"

?

"bg-yellow-400 text-black"

:

"text-white"

}

`}

>

Liquidity Pools

</button>





<button

onClick={()=>setActiveTab("liquidity")}

className={`
flex-1
rounded-2xl
py-3
font-bold
transition

${
activeTab==="liquidity"

?

"bg-yellow-400 text-black"

:

"text-white"

}

`}

>

My Liquidity

</button>





<button

onClick={()=>setActiveTab("stake")}

className={`
flex-1
rounded-2xl
py-3
font-bold
transition

${
activeTab==="stake"

?

"bg-yellow-400 text-black"

:

"text-white"

}

`}

>

Stake liquid

</button>


</div>
{/* LIQUIDITY POOLS TAB */}

{
activeTab === "pools" && (

<section className="mt-8">


<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="🔍 Search pool..."

className="
w-full
rounded-2xl
bg-white/5
border
border-white/10
p-4
text-white
outline-none
placeholder:text-zinc-500
"

/>



<div className="
mt-6
flex
items-center
justify-between
">


<h2 className="
text-xl
font-black
">

All Pools

</h2>


<span className="
text-sm
text-zinc-400
">

{pools?.length ?? 0} pools

</span>


</div>


{
(poolsLoading || detailsLoading) && (

<div className="
mb-5
rounded-2xl
border
border-yellow-500/20
bg-yellow-500/10
p-5
">

<div className="flex items-center gap-3">

<div
className="
h-6
w-6
animate-spin
rounded-full
border-4
border-yellow-400
border-t-transparent
"
/>

<div>

<p className="
font-bold
text-yellow-400
">

Loading Liquidity Pools...

</p>

<p className="
mt-1
text-sm
text-zinc-300
">

Fetching pools from the IOPn blockchain.

</p>

</div>

</div>

<div className="
mt-4
h-2
w-full
overflow-hidden
rounded-full
bg-white/10
">

<div
className="
h-full
w-1/2
animate-pulse
rounded-full
bg-yellow-400
"
/>

</div>

</div>

)
}


{(poolsLoading || detailsLoading) && (

<div className="mt-5 space-y-4">

{[1,2,3].map((item)=>(

<div
key={item}
className="
rounded-3xl
border
border-white/10
bg-white/5
p-5
animate-pulse
"
>

<div className="h-6 w-40 rounded bg-white/10" />

<div className="mt-5 h-4 w-full rounded bg-white/10" />

<div className="mt-3 h-4 w-3/4 rounded bg-white/10" />

<div className="mt-3 h-4 w-1/2 rounded bg-white/10" />

<div className="mt-6 h-12 w-full rounded-2xl bg-white/10" />

</div>

))}

</div>

)}



<div className="
mt-5
space-y-4
">


{

  !(poolsLoading || detailsLoading) &&

  pools
  ?.filter((pool)=>{
    
const name =
`${pool.symbol0} ${pool.symbol1}`
.toLowerCase();


return name.includes(
search.toLowerCase()
);

})

.map((pool)=>(


<div

key={pool.address}

className="
rounded-3xl
bg-white/5
border
border-white/10
p-5
shadow-lg
"

>



<div className="
flex
items-center
justify-between
">


<div>

<h3 className="
text-lg
font-black
">

💧 {pool.symbol0} / {pool.symbol1}

</h3>


<p className="
text-xs
text-zinc-400
mt-1
">

Active Pool

</p>


</div>




<span className="
rounded-full
bg-green-500/20
px-3
py-1
text-xs
font-bold
text-green-400
">

LIVE

</span>


</div>







<div className="
mt-5
rounded-2xl
bg-black/20
p-4
space-y-3
text-sm
text-zinc-300
">


<div className="
flex
justify-between
">

<span>
Pair
</span>

<span>
{pool.address.slice(0,8)}
...
{pool.address.slice(-6)}
</span>

</div>



<div className="
flex
justify-between
">

<span>
Reserve 0
</span>

<span>
{pool.reserve0}
</span>

</div>




<div className="
flex
justify-between
">

<span>
Reserve 1
</span>

<span>
{pool.reserve1}
</span>

</div>



</div>








<button

onClick={()=>{
  setSelectedPool(pool);
    setShowModal(true);
    }}

className="
mt-5
w-full
rounded-2xl
bg-yellow-400
py-4
font-black
text-black
hover:brightness-110
transition
"

>

Add Liquidity

</button>



</div>


))


}


</div>


</section>

)

}
{/* MY LIQUIDITY TAB */}

{
activeTab === "liquidity" && (

<section className="
mt-8
rounded-3xl
bg-white/5
border
border-white/10
p-6
">


<div className="
flex
items-center
justify-between
">

<h2 className="
text-xl
font-black
">

💧 Your Positions

</h2>


<span className="
text-sm
text-zinc-400
">

LP

</span>


</div>





{

!isConnected ? (

<div className="
mt-6
rounded-2xl
bg-black/20
p-5
text-zinc-300
">

Connect wallet to view your liquidity positions.

</div>


)

:

positionsLoading ? (


<div className="
mt-6
rounded-2xl
bg-black/20
p-5
text-zinc-300
">

Loading your liquidity...

</div>


)

:

positions.length === 0 ? (


<div className="
mt-6
rounded-2xl
bg-black/20
p-5
text-zinc-300
">

No liquidity positions found.

<br />

Add liquidity to start earning.

</div>


)

:


(


<div className="
mt-6
space-y-4
">


{

positions.map((position)=>(


<div

key={position.pair}

className="
rounded-3xl
bg-black/20
border
border-white/10
p-5
"

>



<div className="
flex
items-center
justify-between
">


<h3 className="
text-lg
font-black
">

{position.pair}

</h3>


<span className="
rounded-full
bg-yellow-400/20
px-3
py-1
text-xs
font-bold
text-yellow-400
">

LP

</span>


</div>






<div className="
mt-5
space-y-3
text-sm
text-zinc-300
">



<div className="
flex
justify-between
">

<span>
LP Balance
</span>

<span className="font-bold">

{position.lpBalance}

</span>

</div>




<div className="
flex
justify-between
">

<span>
Pool Share
</span>

<span className="font-bold">

{position.poolShare}

</span>

</div>




<div className="
flex
justify-between
">

<span>
Token 0
</span>

<span className="font-bold">

{position.token0Amount}

</span>

</div>




<div className="
flex
justify-between
">

<span>
Token 1
</span>

<span className="font-bold">

{position.token1Amount}

</span>

</div>



</div>








<div className="
mt-6
flex
gap-3
">


<button

onClick={()=>setShowModal(true)}

className="
flex-1
rounded-2xl
bg-yellow-400
py-3
font-black
text-black
"

>

Add More

</button>





<button

disabled={removing}

onClick={()=>{

setSelectedPosition(position);

setShowRemoveModal(true);

}}

className="
flex-1
rounded-2xl
bg-red-500
py-3
font-black
text-white
disabled:opacity-50
"

>

{

removing

?

"Removing..."

:

"Remove"

}

</button>



</div>



</div>


))


}


</div>


)


}



</section>


)

}
{/* STAKE TAB */}

{
activeTab === "stake" && (

<section className="
mt-8
space-y-5
">


<div className="
rounded-3xl
bg-white/5
border
border-white/10
p-6
">


<div className="
flex
items-center
justify-between
">


<h2 className="
text-xl
font-black
">

🌱 Stake Liquid Tokens

</h2>


<span className="
rounded-full
bg-yellow-400/20
px-3
py-1
text-xs
font-bold
text-yellow-400
">

Coming Soon

</span>


</div>





<p className="
mt-4
text-zinc-300
">

Stake liquid assets and earn rewards in OPN .

</p>



</div>








<div className="
rounded-3xl
bg-black/20
border
border-white/10
p-6
">


<h3 className="
text-lg
font-black
">

Select Stake Position

</h3>



<div className="
mt-5
rounded-2xl
bg-white/5
p-5
">


<p className="
text-sm
text-zinc-400
">

Stake Token

</p>


<h4 className="
mt-2
text-xl
font-black
">

USDT / OPNT 

</h4>



<div className="
mt-5
space-y-3
text-sm
text-zinc-300
">


<div className="
flex
justify-between
">

<span>
Stake Balance
</span>

<span>
--

</span>

</div>



<div className="
flex
justify-between
">

<span>
APR

</span>

<span className="
text-green-400
font-bold
">

--

</span>

</div>



<div className="
flex
justify-between
">

<span>
Pending Rewards

</span>

<span>
0 OPN
</span>

</div>



</div>





<button

className="
mt-6
w-full
rounded-2xl
bg-yellow-400
py-4
font-black
text-black
"

>

Stake

</button>



</div>



</div>








<div className="
rounded-3xl
bg-purple-900/30
border
border-purple-500/20
p-6
">


<h3 className="
text-xl
font-black
">

🎁 Rewards

</h3>



<div className="
mt-5
space-y-3
text-zinc-300
">


<div className="
flex
justify-between
">

<span>
Staked asset

</span>

<span>
--

</span>

</div>




<div className="
flex
justify-between
">

<span>
Earned OPN

</span>

<span>
0.00 OPN
</span>

</div>




<div className="
flex
gap-3
mt-5
">


<button

className="
flex-1
rounded-2xl
bg-green-500
py-3
font-black
text-white
"

>

Claim

</button>



<button

className="
flex-1
rounded-2xl
bg-white/10
py-3
font-black
text-white
"

>

Unstake

</button>



</div>



</div>


</div>




</section>

)

}
{/* MODALS */}


<AddLiquidityModal

open={showModal}

selectedPool={selectedPool}

onClose={()=>setShowModal(false)}

tokens={tokens}

pools={pools}

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





<RemoveLiquidityModal

open={showRemoveModal}

onClose={()=>{

setShowRemoveModal(false);

}}

position={selectedPosition}

loading={removing}

onRemove={async(percent)=>{


console.log(

"Remove percentage:",

percent,

selectedPosition

);


}}


/>






</div>


</main>


);


}