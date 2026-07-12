"use client";


import {
  useAccount,
  useWriteContract,
} from "wagmi";


import {
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";


import {
  parseUnits,
} from "viem";


import {
  toast,
} from "sonner";


import {
  ROUTER_ADDRESS,
} from "@/lib/router";


import {
  ROUTER_ABI,
} from "@/lib/routerAbi";


import {
  Config,
} from "@/lib/wagmi";


import type {
  Token
} from "@/hooks/useTokens";

import { applySlippage } from "@/lib/slippage";



export function useLiquidity(){


const {
  address
}=useAccount();



const {
  writeContractAsync,
  isPending
}=useWriteContract();





async function approveToken(

token:Token,

amount:bigint

){


if(token.native)
return;



await writeContractAsync({

address:
token.address as `0x${string}`,

abi:[

{

type:"function",

name:"approve",

stateMutability:"nonpayable",

inputs:[

{
name:"spender",
type:"address"
},

{
name:"amount",
type:"uint256"
}

],

outputs:[

{
type:"bool"
}

]

}

],

functionName:"approve",

args:[

ROUTER_ADDRESS as `0x${string}`,

amount

]

});


}







async function addLiquidity(

tokenA:Token,

tokenB:Token,

amountA:string,

amountB:string

){



if(!address){

toast.error(
"Connect wallet first"
);

return;

}




try{


const amountADesired =
parseUnits(
amountA,
tokenA.decimals
);



const amountBDesired =
parseUnits(
amountB,
tokenB.decimals
);


const amountAMin = applySlippage(amountADesired);

const amountBMin = applySlippage(amountBDesired);



// Approve ERC20 tokens

await approveToken(
tokenA,
amountADesired
);



await approveToken(
tokenB,
amountBDesired
);






const deadline =
BigInt(
Math.floor(
Date.now()/1000
)+1200
);







let hash:`0x${string}`;





// OPN + TOKEN


if(
tokenA.native ||
tokenB.native
){


const token =
tokenA.native
?
tokenB
:
tokenA;



const amountToken =
tokenA.native
?
amountBDesired
:
amountADesired;



hash =
await writeContractAsync({

address:
ROUTER_ADDRESS as `0x${string}`,

abi:
ROUTER_ABI,

functionName:
"addLiquidityOPN",

args:[

token.address as `0x${string}`,

amountToken,

amountToken === amountADesired
  ? amountAMin
  : amountBMin,

tokenA.native
  ? amountBMin
  : amountAMin,

address,

deadline

],

value:

tokenA.native
?
amountADesired
:
amountBDesired

});



}






// TOKEN + TOKEN


else{


hash =
await writeContractAsync({

address:
ROUTER_ADDRESS as `0x${string}`,

abi:
ROUTER_ABI,

functionName:
"addLiquidity",

args:[

tokenA.address as `0x${string}`,

tokenB.address as `0x${string}`,

amountADesired,
amountBDesired,

amountAMin,
amountBMin,

address,

deadline

]

});



}






toast.loading(
"Adding liquidity...",
{
id:"liquidity"
}
);




await waitForTransactionReceipt(

Config,

{
hash
}

);




toast.success(

"Liquidity added successfully ✅",

{
id:"liquidity"
}

);



return hash;



}

catch(error:any){


console.error(
error
);



toast.error(

error?.shortMessage ||

error?.message ||

"Liquidity failed"

,

{
id:"liquidity"
}

);


return null;


}


}






return {

addLiquidity,

isPending

};


}