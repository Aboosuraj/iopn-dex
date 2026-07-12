"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;

  position: any;

  onRemove: (
    percentage: number
  ) => Promise<void>;

  loading: boolean;
};


export default function RemoveLiquidityModal({

  open,
  onClose,
  position,
  onRemove,
  loading,

}: Props) {


  const [
    percentage,
    setPercentage
  ] = useState(100);



  if(!open) return null;



  async function handleRemove(){

    await onRemove(
      percentage
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
bg-zinc-950
border
border-white/10
p-6
"
>


<div className="
flex
justify-between
items-center
"
>

<h2 className="
text-2xl
font-black
text-white
">

🗑 Remove Liquidity

</h2>


<button

onClick={onClose}

className="
rounded-full
bg-white/10
px-3
py-1
"

>

✕

</button>


</div>





<div className="
mt-6
rounded-2xl
bg-white/5
p-4
">


<p className="
text-zinc-400
text-sm
">

Pool

</p>


<h3 className="
text-xl
font-bold
mt-1
">

{position?.pair}

</h3>



<p className="
mt-3
text-zinc-300
">

LP Balance:

{" "}

{position?.lpBalance}

</p>


</div>







<div className="
mt-6
grid
grid-cols-4
gap-2
">


{
[25,50,75,100].map((value)=>(


<button

key={value}

onClick={()=>setPercentage(value)}

className={`
rounded-xl
py-3
font-bold

${
percentage === value

?

"bg-yellow-400 text-black"

:

"bg-white/10 text-white"

}

`}

>

{value}%

</button>


))
}



</div>







<div className="
mt-6
rounded-2xl
bg-white/5
p-4
text-sm
text-zinc-300
">


<p>

You are removing:

{" "}

<span className="text-yellow-400 font-bold">

{percentage}%

</span>

</p>


<p className="mt-2">

Estimated receive:

Coming soon

</p>


</div>







<button

disabled={loading}

onClick={handleRemove}

className="
mt-6
w-full
rounded-2xl
bg-red-500
py-4
font-black
text-white
disabled:opacity-50
"

>


{

loading

?

"Removing..."

:

"Remove Liquidity"

}


</button>






<button

onClick={onClose}

className="
mt-3
w-full
rounded-2xl
bg-white/10
py-3
font-bold
"

>

Cancel

</button>




</div>


</div>


);


}