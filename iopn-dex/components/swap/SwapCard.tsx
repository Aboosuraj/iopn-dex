"use client";

type Token = {
  symbol:string;
  address:string;
  decimals:number;
  native:boolean;
};


type Props = {

amountIn:string;
setAmountIn:(value:string)=>void;

amountOut:string;

tokenIn:Token;
tokenOut:Token;

onSelectIn:()=>void;
onSelectOut:()=>void;

onFlip:()=>void;

balance:string;

onSwap:()=>void;

buttonText:string;

loading:boolean;

};


export default function SwapCard({

amountIn,
setAmountIn,

amountOut,

tokenIn,
tokenOut,

onSelectIn,
onSelectOut,

onFlip,

balance,

onSwap,

buttonText,

loading,

}:Props){


return (

<div className="
w-full
max-w-md
rounded-3xl
border
border-white/10
bg-white/5
p-5
backdrop-blur-xl
shadow-2xl
">


<h1 className="
mb-6
text-center
text-3xl
font-black
text-white
">

IOPn Swap

</h1>



{/* INPUT */}

<div className="
rounded-3xl
bg-black/30
p-4
">


<div className="
flex
justify-between
text-sm
text-white/60
">

<span>
You Pay
</span>


<span>
Balance: {balance}
</span>


</div>



<div className="
mt-3
flex
items-center
gap-3
">

<div className="flex justify-between text-xs text-white/50 mb-2">

<span>
Balance: {
balance
?
balance.toString()
:
"0"
}
</span>


<button
className="text-green-400 font-bold"
onClick={()=>{
if(balance)
setAmountIn(balance.toString())
}}
>
MAX
</button>


</div>

<input

type="number"

value={amountIn}

onChange={(e)=>setAmountIn(e.target.value)}

placeholder="0.0"

className="
w-full
bg-transparent
text-4xl
font-bold
text-white
outline-none
"

/>



<button

onClick={onSelectIn}

className="
rounded-2xl
bg-green-400
px-4
py-3
font-bold
text-black
"

>

{tokenIn.symbol}

</button>


</div>


</div>





{/* FLIP */}

<div className="flex justify-center py-4">


<button

onClick={onFlip}

className="
h-12
w-12
rounded-full
bg-green-400
text-xl
font-bold
text-black
"

>

⇅

</button>


</div>





{/* OUTPUT */}


<div className="
rounded-3xl
bg-black/30
p-4
">


<div className="
text-sm
text-white/60
">

You Receive

</div>



<div className="
mt-3
flex
items-center
gap-3
">


<div className="
flex-1
text-4xl
font-bold
text-green-400
">

{amountOut || "0.0"}

</div>



<button

onClick={onSelectOut}

className="
rounded-2xl
bg-green-400
px-4
py-3
font-bold
text-black
"

>

{tokenOut.symbol}

</button>


</div>


</div>





<button

onClick={onSwap}

disabled={loading}

className="
mt-6
w-full
rounded-2xl
bg-green-400
py-4
text-lg
font-black
text-black
disabled:opacity-50
"

>


{
loading
?
"Processing..."
:
buttonText
}


</button>



</div>


);

}