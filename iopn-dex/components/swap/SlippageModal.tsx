"use client";

import { useState } from "react";


type Props = {

open:boolean;

onClose:()=>void;

slippage:number;

setSlippage:(value:number)=>void;

};



export default function SlippageModal({

open,

onClose,

slippage,

setSlippage,

}:Props){


const [custom,setCustom]=useState("");



if(!open)
return null;



function save(){

const value =
Number(custom);


if(value>0){

setSlippage(value);

}


onClose();

}



return (

<div className="
fixed
inset-0
z-[100]
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
border
border-white/10
bg-zinc-900
p-6
text-white
">


<div className="
mb-5
flex
items-center
justify-between
">

<h2 className="
text-2xl
font-bold
">

Slippage

</h2>


<button

onClick={onClose}

>

✕

</button>


</div>





<div className="
grid
grid-cols-3
gap-3
">


{

[0.1,0.5,1].map(value=>(


<button

key={value}

onClick={()=>{

setSlippage(value);

onClose();

}}

className={`
rounded-xl
p-3
font-bold
${
slippage===value

?

"bg-green-400 text-black"

:

"bg-white/10"

}
`}

>

{value}%

</button>


))

}


</div>




<div className="mt-5">


<p className="
mb-2
text-sm
text-white/60
">

Custom %

</p>



<input

type="number"

placeholder="0.5"

value={custom}

onChange={(e)=>setCustom(e.target.value)}

className="
w-full
rounded-xl
bg-white/10
p-4
outline-none
"

/>



</div>





<button

onClick={save}

className="
mt-5
w-full
rounded-xl
bg-green-400
py-3
font-bold
text-black
"

>

Save

</button>



</div>


</div>

);

}