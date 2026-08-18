"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "@/lib/wagmi";
import { ThemeProvider } from "@/components/ThemeProvider";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}