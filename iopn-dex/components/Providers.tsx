"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  RainbowKitProvider,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";

import {
  WagmiProvider,
} from "wagmi";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { iopnTestnet } from "@/lib/chains";

import { useState } from "react";


const config = getDefaultConfig({

appName: "IOPn DEX",

projectId:
"2f556cee5880c8a19600fcfc8238056d",

chains:[
iopnTestnet
],

ssr:true,

});



export default function Providers({

children

}:{

children:React.ReactNode

}){


const [queryClient] =
useState(
()=>new QueryClient()
);



return (

<WagmiProvider config={config}>


<QueryClientProvider client={queryClient}>


<RainbowKitProvider>


{children}


</RainbowKitProvider>


</QueryClientProvider>


</WagmiProvider>


);


}