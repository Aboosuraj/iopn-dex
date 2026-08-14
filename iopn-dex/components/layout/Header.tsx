"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";

export default function Header() {
  const { address, isConnected } = useAccount();

  return (
    <header
      className="
      fixed
      top-0
      left-0
      right-0
      z-50
      border-b
      border-white/10
      bg-[#050816]/80
      backdrop-blur-xl
      "
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

        <Link
          href="/app"
          className="flex items-center gap-3"
        >
          <img
            src="/logo.png"
            alt="IOPn DEX"
            className="h-10 w-10"
          />

          <div>

            <h1 className="font-black">
              IOPn DEX
            </h1>

            <p className="text-xs text-cyan-400">
              OPN Testnet
            </p>

          </div>

        </Link>

        <div
          className="
          flex
          items-center
          gap-3
          rounded-full
          border
          border-white/10
          bg-white/[0.04]
          px-4
          py-2
          "
        >

          <Wallet
            size={18}
            className="text-cyan-400"
          />

          <span className="text-sm font-semibold">

            {isConnected
              ? `${address?.slice(0,6)}...${address?.slice(-4)}`
              : "Connect"}

          </span>

        </div>

      </div>
    </header>
  );
}