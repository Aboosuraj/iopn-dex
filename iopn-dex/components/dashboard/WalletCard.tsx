"use client";

import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

export default function WalletCard() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useBalance({
    address,
  });

  const walletBalance =
    isConnected && balance
      ? Number(formatUnits(balance.value, 18)).toFixed(4)
      : "0.0000";

  return (
    <section className="rounded-3xl border border-cyan-500/10 bg-white/[0.04] p-6 backdrop-blur-xl">

      <p className="text-sm text-white/50">
        Portfolio Value
      </p>

      <h2 className="mt-2 text-5xl font-black text-cyan-400">
        {walletBalance} OPN
      </h2>

      <div className="mt-5 flex items-center justify-between">

        <div>

          <p className="text-xs text-white/40">
            Wallet
          </p>

          <p className="font-semibold">
            {isConnected
              ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
              : "Not Connected"}
          </p>

        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            isConnected
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isConnected ? "Connected" : "Offline"}
        </span>

      </div>

    </section>
  );
}