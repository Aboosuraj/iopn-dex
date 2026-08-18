import type { Metadata } from "next";

import "./globals.css";

import Providers from "@/components/Providers";
import BottomNav from "@/components/layout/BottomNav";

import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className="
          bg-white
          text-slate-900
          antialiased
          transition-colors
          duration-300

          dark:bg-[#02050B]
          dark:text-white
        "
      >
        <ThemeProvider>
          <Providers>

            {/* PAGE CONTENT */}

            <main className="pb-24">
              {children}
            </main>

            {/* MOBILE BOTTOM NAVIGATION */}

            <BottomNav />

          </Providers>
        </ThemeProvider>

        <Toaster position="top-center" />
      </body>
    </html>
  );
}