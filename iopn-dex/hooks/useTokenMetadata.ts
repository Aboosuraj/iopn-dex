"use client";

import { readContract } from "wagmi/actions";
import { Config } from "@/lib/wagmi";

const ERC20_ABI = [
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        type:"string"
      }
    ],
    stateMutability:"view",
    type:"function"
  }
];


export async function getTokenSymbol(
  address:string
){

try{

const symbol =
await readContract(
Config,
{
address:address as `0x${string}`,
abi:ERC20_ABI,
functionName:"symbol"
}
);


return symbol as string;


}catch{

return "TOKEN";

}


}