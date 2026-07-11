"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


const navItems = [

{
name:"Home",
icon:"🏠",
path:"/"
},

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
path:"/liquidity"
},

];



export default function BottomNav(){


const pathname = usePathname();



return (

<nav className="
fixed
bottom-0
left-0
right-0
z-40
border-t
border-white/10
bg-black/80
backdrop-blur-xl
">


<div className="
mx-auto
flex
max-w-md
items-center
justify-around
px-2
py-3
">


{

navItems.map((item)=>(


<Link

key={item.path}

href={item.path}

className={`
flex
flex-col
items-center
gap-1
rounded-2xl
px-3
py-2
text-xs
transition

${
pathname===item.path

?

"bg-green-400 text-black"

:

"text-white/60 hover:text-white"

}

`}

>


<span className="text-xl">

{item.icon}

</span>


<span className="font-semibold">

{item.name}

</span>


</Link>


))


}


</div>


</nav>

);


}