import type { Metadata } from "next";

import "./globals.css";

import Providers from "@/components/Providers";

import Header from "@/components/layout/Header";

import BottomNav from "@/components/layout/BottomNav";



export const metadata: Metadata = {

title: "IOPn DEX",

description:
"Decentralized exchange built on OPN Chain",

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


</body>


</html>

);


}