"use client";

import { useState } from "react";

import WalletButton from "@/components/wallet/WalletButton";

import ProfileMenu from "./ProfileMenu";


export default function Header(){


const [open,setOpen]=useState(false);


return (

<header className="
fixed
top-0
left-0
right-0
z-50
border-b
border-white/10
bg-black/70
backdrop-blur-xl
">


<div className="
mx-auto
flex
h-20
max-w-md
items-center
justify-between
px-5
">


{/* BRAND */}

<div>


<h1 className="
text-xl
font-bold
text-white
">

IOPn DEX

</h1>


<div className="
text-xs
text-green-400
">

● OPN Testnet

</div>


</div>





{/* RIGHT */}

<div className="
flex
items-center
gap-3
">


<WalletButton />



<button

onClick={()=>setOpen(!open)}

className="
flex
h-10
w-10
items-center
justify-center
rounded-full
border
border-white/20
bg-white/10
text-xl
"

>

👤

</button>


</div>


</div>



{

open &&

<ProfileMenu />

}



</header>


);


}