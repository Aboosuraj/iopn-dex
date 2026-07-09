"use client";

import { useState } from "react";
import { TOKENS } from "@/lib/tokens";


export type Token = {

symbol:string;

address:string;

decimals:number;

native:boolean;

};


export function useTokens(){


const [tokens,setTokens] = useState<Token[]>(

TOKENS as unknown as Token[]

);



function addToken(token:Token){


const exists =
tokens.some(

(t)=>
t.address.toLowerCase()
===
token.address.toLowerCase()

);



if(!exists){

setTokens([
...tokens,
token
]);

}


}



return {

tokens,

addToken

};


}