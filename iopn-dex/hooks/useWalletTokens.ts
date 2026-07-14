"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useAccount,
} from "wagmi";

import {
  readContract,
  getLogs,
} from "wagmi/actions";

import {
  Config,
} from "@/lib/wagmi";

import {
  TOKENS,
} from "@/lib/tokens";

import {
  ERC20_ABI,
} from "@/lib/erc20";

import {
  parseAbiItem,
  formatUnits,
} from "viem";



type WalletToken = {

  address:`0x${string}`;

  symbol:string;

  decimals:number;

  balance:string;

};




const TRANSFER_EVENT =
parseAbiItem(
"event Transfer(address indexed from,address indexed to,uint256 value)"
);





export function useWalletTokens(){


const {
 address
}=useAccount();



const [
 tokens,
 setTokens
]=useState<WalletToken[]>([]);



const [
 loading,
 setLoading
]=useState(false);






async function loadTokens(){


if(!address)
return;



try{


setLoading(true);





// Start with known tokens

const discovered =
new Map<string,WalletToken>();





for(const token of TOKENS){


if(token.native)
continue;



const balance =
await readContract(
Config,
{

address:
token.address,

abi:
ERC20_ABI,

functionName:
"balanceOf",

args:[
address
]

}

);



if(balance > 0n){


discovered.set(
token.address.toLowerCase(),
{

address:
token.address,

symbol:
token.symbol,

decimals:
token.decimals,

balance:
formatUnits(
balance,
token.decimals
)

}

);


}


}







// Scan Transfer events

const logs =
await getLogs(
Config,
{

event:
TRANSFER_EVENT,

args:{

to:
address,

},

fromBlock:
"earliest",

toBlock:
"latest",

}

);







for(const log of logs){


const tokenAddress =
log.address;



if(
discovered.has(
tokenAddress.toLowerCase()
)
)
continue;





try{


const symbol =
await readContract(
Config,
{

address:
tokenAddress,

abi:
ERC20_ABI,

functionName:
"symbol",

}

);



const decimals =
await readContract(
Config,
{

address:
tokenAddress,

abi:
ERC20_ABI,

functionName:
"decimals",

}

);





const balance =
await readContract(
Config,
{

address:
tokenAddress,

abi:
ERC20_ABI,

functionName:
"balanceOf",

args:[
address
]

}

);





if(balance > 0n){


discovered.set(
tokenAddress.toLowerCase(),

{

address:
tokenAddress,

symbol:
symbol as string,

decimals:
Number(decimals),

balance:
formatUnits(
balance,
Number(decimals)
)

}

);


}


}catch(error){

console.log(
"Skipping token",
tokenAddress
);

}



}






setTokens(
Array.from(
discovered.values()
)
);



}
catch(error){

console.error(
"Wallet token scan failed:",
error
);


}
finally{

setLoading(false);

}


}






useEffect(()=>{


loadTokens();


},[
address
]);







return {

tokens,

loading,

refresh:
loadTokens,

};


}