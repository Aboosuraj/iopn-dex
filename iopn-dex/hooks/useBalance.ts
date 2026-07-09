"use client";


import {

useAccount,

useBalance as useNativeBalance,

useReadContract

} from "wagmi";


import {ERC20_ABI} from "@/lib/erc20";

import {formatUnits} from "viem";

import type {Token} from "./useTokens";



export function useTokenBalance(token:Token){


const {address}=useAccount();



const {

data:native

}=useNativeBalance({

address,

});


const {

data:erc20

}=useReadContract({

address:

!token.native

?

token.address as `0x${string}`

:

undefined,


abi:ERC20_ABI,


functionName:"balanceOf",


args:

address && !token.native

?

[address]

:

undefined,


query:{

enabled:

!!address && !token.native

}

});





if(token.native){

return native?.formatted || "0";

}



if(erc20){

return formatUnits(

erc20 as bigint,

token.decimals

);

}



return "0";


}