import type { Metadata } from "next";

import "./globals.css";

import Providers from "@/components/Providers";

import Header from "@/components/layout/Header";

import BottomNav from "@/components/layout/BottomNav";

import { Toaster } from "sonner";



export const metadata: Metadata = {
  title: "IOPn DEX",
  description:
    "Decentralized exchange, swap, pay, stake, add liquidity built for OPN Chain ecosystem",

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],

    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  themeColor: "#050816",
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