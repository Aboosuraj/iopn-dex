"use client";


type Token = {

symbol:string;

address:string;

decimals:number;

native:boolean;

};


type Props={

open:boolean;

tokens:Token[];

onClose:()=>void;

onSelect:(token:Token)=>void;

};


export default function TokenSelector({

open,
tokens,
onClose,
onSelect

}:Props){


if(!open)
return null;



return (

<div className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/70
px-4
">


<div className="
w-full
max-w-md
rounded-3xl
bg-zinc-900
p-5
text-white
">


<div className="
mb-5
flex
justify-between
">

<h2 className="text-xl font-bold">
Select Token
</h2>


<button onClick={onClose}>
✕
</button>


</div>




<div className="space-y-3">


{

tokens.map(token=>(


<button

key={token.address}

onClick={()=>onSelect(token)}

className="
flex
w-full
justify-between
rounded-2xl
bg-white/10
p-4
"

>


<span>
{token.symbol}
</span>


<span className="text-white/50">
Select
</span>


</button>


))

}


</div>


</div>


</div>

);

}