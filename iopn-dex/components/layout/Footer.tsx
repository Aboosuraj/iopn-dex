"use client";

import Link from "next/link";

export default function Footer(){

return (

<footer
className="
mt-10
rounded-3xl
border
border-white/10
bg-white/5
p-6
text-white
backdrop-blur-xl
"
>

<h2
className="
text-xl
font-black
"
>
IOPn DEX
</h2>


<p
className="
mt-2
text-sm
text-white/60
"
>
Built on OPN Chain Testnet
</p>



<div
className="
mt-5
grid
grid-cols-2
gap-3
"
>


<a
href="https://x.com/iopndex_xyz"
target="_blank"
className="
rounded-xl
bg-white/10
p-3
text-center
font-bold
hover:bg-white/20
"
>
𝕏 IOPn X
</a>



<a
href="https://testnet.iopn.tech/faucet"
target="_blank"
className="
rounded-xl
bg-white/10
p-3
text-center
font-bold
hover:bg-white/20
"
>
💧 Faucet
</a>



<a
href="https://testnet.iopn.tech"
target="_blank"
className="
rounded-xl
bg-white/10
p-3
text-center
font-bold
hover:bg-white/20
"
>
🔎 Explorer
</a>



<Link
href="/swap"
className="
rounded-xl
bg-green-400
p-3
text-center
font-bold
text-black
"
>
🚀 Trade
</Link>


</div>



<p
className="
mt-6
text-center
text-xs
text-white/40
"
>
© 2026 IOPn DEX. All rights reserved.
</p>


</footer>

);

}