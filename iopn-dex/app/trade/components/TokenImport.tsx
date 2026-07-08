"use client";

import { useState } from "react";


type Token = {

symbol:string;

address:string;

decimals:number;

native:boolean;

};



type Props = {

open:boolean;

onClose:()=>void;

onImport:(token:Token)=>void;

};



export default function TokenImport({

open,

onClose,

onImport,

}:Props){


const [address,setAddress]=useState("");



if(!open) return null;



function handleImport(){


if(!address.startsWith("0x")){

return;

}



const token:Token={

symbol:"CUSTOM",

address,

decimals:18,

native:false,

};



onImport(token);


setAddress("");

onClose();


}



return (

<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">


<div className="w-full max-w-md rounded-3xl bg-zinc-900 p-6 text-white shadow-2xl">


<h2 className="mb-4 text-2xl font-bold">

Import Token

</h2>



<input

value={address}

onChange={(e)=>setAddress(e.target.value)}

placeholder="Token contract address"

className="w-full rounded-xl bg-white/10 p-4 outline-none"

/>




<button

type="button"

onClick={handleImport}

className="mt-4 w-full rounded-xl bg-green-400 py-3 font-bold text-black"

>

Import

</button>




<button

type="button"

onClick={onClose}

className="mt-3 w-full rounded-xl border border-white/20 py-3"

>

Cancel

</button>



</div>


</div>

);


}