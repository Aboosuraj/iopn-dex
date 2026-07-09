"use client";

import {useState,useEffect} from "react";

import SwapCard from "@/components/swap/SwapCard";
import TokenSelector from "@/components/swap/TokenSelector";
import TokenImport from "@/components/swap/TokenImport";
import SlippageModal from "@/components/swap/SlippageModal";

import {useTokens,Token} from "@/hooks/useTokens";
import {useSwap} from "@/hooks/useSwap";
import {useTokenBalance} from "@/hooks/useBalance";

import {useAccount} from "wagmi";

function formatAmount(value:string | number){

const number = Number(value);


if(!number) return "0";


return number.toLocaleString(
"en-US",
{
maximumFractionDigits:6
}
);

}



export default function SwapPage(){


const {isConnected}=useAccount();



const {

tokens,
addToken

}=useTokens();



const [tokenIn,setTokenIn]=useState<Token>(tokens[0]);

const [tokenOut,setTokenOut]=useState<Token>(tokens[3]);



const [amountIn,setAmountIn]=useState("");

const [amountOut,setAmountOut]=useState("");
const [route,setRoute]=useState<string[]>([]);
const [rate,setRate]=useState("");



const [selector,setSelector]=useState<
"in"|"out"|null
>(null);



const [importOpen,setImportOpen]=useState(false);


const [slippage,setSlippage]=useState(0.5);


const [slippageOpen,setSlippageOpen]=useState(false);



const {

getQuote,

swap,

isPending

}=useSwap();




const balance=

useTokenBalance(tokenIn);







useEffect(()=>{


const timer=setTimeout(async()=>{


if(amountIn){


try{


const quote =

await getQuote(

amountIn,

tokenIn,

tokenOut

);



const formattedQuote = formatAmount(quote);


setAmountOut(formattedQuote);



setRate(
`1 ${tokenIn.symbol} = ${formattedQuote} ${tokenOut.symbol}`
);



setRoute([

tokenIn.symbol,

"WOPN",

tokenOut.symbol

]);


}

catch{


setAmountOut("");

}


}


},500);



return()=>clearTimeout(timer);



},[

amountIn,

tokenIn,

tokenOut

]);








function flip(){


const old=tokenIn;


setTokenIn(tokenOut);

setTokenOut(old);


setAmountOut("");


}






function select(token:Token){


if(selector==="in"){

setTokenIn(token);

}


if(selector==="out"){

setTokenOut(token);

}


setSelector(null);

}








return (

<main className="min-h-screen bg-gradient-to-br from-black via-[#06251a] to-black px-4 pt-6 pb-24 text-white">



<div className="mx-auto max-w-md">



<div className="
mb-6
flex
items-center
justify-between
">


<div>

<h1 className="
text-3xl
font-black
">

IOPn DEX

</h1>


<p className="
text-sm
text-white/60
">

Swap tokens on OPN Chain

</p>


</div>





</div>





<SwapCard


amountIn={amountIn}

setAmountIn={setAmountIn}


amountOut={amountOut}



tokenIn={tokenIn}

tokenOut={tokenOut}



onSelectIn={()=>setSelector("in")}

onSelectOut={()=>setSelector("out")}



onFlip={flip}



balance={balance}



onSwap={()=>swap(

amountIn,

tokenIn,

tokenOut,

slippage

)}



buttonText={

!isConnected

?

"Connect Wallet"

:

"Swap"

}



loading={isPending}


/>


<div className="
mt-4
rounded-3xl
border
border-white/10
bg-white/5
p-5
text-sm
">


<h2 className="
mb-4
text-lg
font-bold
">

Swap Details

</h2>



<div className="
space-y-3
">


<div className="
flex
justify-between
">

<span className="text-white/50">
Rate
</span>

<span>
{rate || "--"}
</span>

</div>




<div className="
flex
justify-between
">

<span className="text-white/50">
Minimum received
</span>

<span>
{
amountOut
?
Number(amountOut)
*
0.995
:
"--"
}
</span>

</div>




<div className="
flex
justify-between
">

<span className="text-white/50">
Slippage
</span>

<span>
{slippage}%
</span>

</div>




<div className="
flex
justify-between
">

<span className="text-white/50">
Route
</span>


<span className="text-green-400">

{
route.length
?
route.join(" → ")
:
"--"
}

</span>


</div>




<div className="
flex
justify-between
">

<span className="text-white/50">
Network
</span>

<span>
OPN Testnet
</span>

</div>


</div>


</div>



<div className="
mt-4
flex
gap-3
">


<button

onClick={()=>setImportOpen(true)}

className="
flex-1
rounded-2xl
border
border-green-400
py-3
font-bold
text-green-400
"

>

+ Import Token

</button>



<button

onClick={()=>setSlippageOpen(true)}

className="
rounded-2xl
bg-white/10
px-5
"

>

⚙️

</button>


</div>





</div>





<TokenSelector


open={selector!==null}


tokens={tokens}


onClose={()=>setSelector(null)}


onSelect={select}


/>





<TokenImport


open={importOpen}


onClose={()=>setImportOpen(false)}


onImport={(token)=>{

addToken(token);

setTokenOut(token);

}}


/>





<SlippageModal


open={slippageOpen}


onClose={()=>setSlippageOpen(false)}


slippage={slippage}


setSlippage={setSlippage}


/>



</main>

);


}