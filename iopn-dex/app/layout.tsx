import type { Metadata } from "next";

import "./globals.css";

import Providers from "@/components/Providers";

import Header from "@/components/layout/Header";

import BottomNav from "@/components/layout/BottomNav";

import { Toaster } from "sonner";



export const metadata: Metadata = {

title: "IOPn DEX",

description:
"Decentralized exchange , swap , pay , stake , add liquidity and its built for OPN Chain ecosystem",

};



export default function RootLayout({

children,

}: Readonly<{

children: React.ReactNode;

}>) {


return (

<html lang="en">


<body className="
bg-black
text-white
antialiased
">


<Providers>


<div className="
min-h-screen
">




<Header />



<main className="
pb-24
pt-20
">

{children}


</main>



<BottomNav />


</div>


</Providers>


<Toaster position="top-center" />


</body>


</html>

);


}