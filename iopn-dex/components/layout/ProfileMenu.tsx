"use client";

import Link from "next/link";
import { useState } from "react";


export default function ProfileMenu(){


const [dark,setDark]=useState(true);



return (

<div className="
absolute
right-5
top-16
w-72
rounded-3xl
border
border-white/10
bg-zinc-950/95
p-4
shadow-2xl
backdrop-blur-xl
">


{/* USER */}

<div className="
mb-4
rounded-2xl
bg-white/5
p-4
">


<div className="
text-sm
text-white/50
">

Network

</div>


<div className="
mt-1
font-bold
text-green-400
">

OPN Testnet

</div>


<div className="
text-xs
text-white/40
">

Chain ID: 984

</div>


</div>





{/* MENU */}

<div className="
space-y-2
">



<Link

href="/settings"

className="
block
rounded-2xl
bg-white/5
p-4
text-white
hover:bg-white/10
"

>

⚙️ Settings

</Link>





<Link

href="/settings"

className="
block
rounded-2xl
bg-white/5
p-4
text-white
hover:bg-white/10
"

>

ℹ️ About IOPn DEX

</Link>





<Link

href="/settings"

className="
block
rounded-2xl
bg-white/5
p-4
text-white
hover:bg-white/10
"

>

🔒 Privacy

</Link>







<button

onClick={()=>setDark(!dark)}

className="
flex
w-full
items-center
justify-between
rounded-2xl
bg-white/5
p-4
text-white
"


>


<span>

🌙 Dark Mode

</span>


<span className="
text-green-400
">

{
dark
?
"ON"
:
"OFF"
}

</span>


</button>



</div>


</div>

);


}