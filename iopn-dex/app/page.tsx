"use client";

import Link from "next/link";

import {
  useAccount,
  useBalance,
} from "wagmi";

import {
  formatUnits
} from "viem";

import Footer from "@/components/layout/Footer";

export default function Home(){


const {
address,
isConnected

}=useAccount();



const {
data:balance

}=useBalance({

address,

});



const quickActions=[

{
name:"Swap",
icon:"🔄",
path:"/swap"
},

{
name:"Pay",
icon:"💳",
path:"/pay"
},

{
name:"Portfolio",
icon:"📊",
path:"/portfolio"
},

{
name:"Liquidity",
icon:"💧",
path:"/staking"
},

];




return (

<main className="
min-h-screen
bg-gradient-to-br
from-black
via-[#06261a]
to-black
px-5
py-8
text-white
">



{/* HERO */}


<section className="
rounded-3xl
border
border-white/10
bg-white/5
p-6
backdrop-blur-xl
">


<p className="
text-sm
text-white/50
">

Welcome to

</p>



<h1 className="
mt-2
text-4xl
font-black
">

IOPn DEX

</h1>



<p className="
mt-2
text-white/60
">

Trade, swap, pay and manage assets on OPN Chain

</p>



</section>







{/* BALANCE */}


<section className="
mt-5
rounded-3xl
bg-green-400
p-6
text-black
">


<p className="
text-sm
font-semibold
opacity-70
">

Wallet Balance

</p>


<h2 className="
mt-2
text-4xl
font-black
">

{

isConnected && balance

?

Number(
formatUnits(
balance.value,
18
)
).toFixed(4)

:

"0.0000"

}

 OPN

</h2>



{

address &&

<p className="
mt-3
text-xs
font-bold
opacity-60
">

{address.slice(0,6)}
...
{address.slice(-4)}

</p>

}


</section>








{/* ACTIONS */}


<section className="
mt-6
grid
grid-cols-2
gap-4
">


{

quickActions.map((item)=>(


<Link

key={item.path}

href={item.path}

className="
rounded-3xl
border
border-white/10
bg-white/5
p-5
text-center
transition
hover:bg-white/10
"


>


<div className="
text-3xl
">

{item.icon}

</div>


<div className="
mt-2
font-bold
">

{item.name}

</div>


</Link>


))


}


</section>









{/* MARKETS */}

<section className="
mt-8
">

<h2 className="
mb-4
text-xl
font-bold
">
Live Markets
</h2>


<div className="
space-y-3
">

{

[
["OPN / tUSDT","1.00","+2.4%"],

["OPNT / OPN","0.45","+5.8%"],

["IDEX / OPN","0.12","-1.2%"],

["WOPN / OPN","1.00","+0.1%"],

["tBNB / OPN","25.40","+3.6%"],

["tUSDT / OPN","1.01","+0.4%"]

].map((pair)=>(


<div

key={pair[0]}

className="
rounded-2xl
border
border-white/10
bg-white/5
p-4
"

>

<div className="
flex
justify-between
"
>

<span className="font-bold">
{pair[0]}
</span>


<span className="text-green-400 font-bold">
{pair[1]}
</span>

</div>


<p className="
mt-2
text-sm
text-green-400
"
>
{pair[2]}
</p>


</div>


))


}


</div>

</section>


<Footer />


</main>

);

}