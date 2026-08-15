"use client";

import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import {
  ArrowUpRight,
  Copy,
  Wallet,
} from "lucide-react";

export default function WalletCard() {
  const { address, isConnected } = useAccount();

  const { data: balance } = useBalance({
    address,
  });

  const walletBalance =
    isConnected && balance
      ? Number(formatUnits(balance.value, 18)).toFixed(2)
      : "0.00";

  return (
    <section
      className="
        relative
        mt-4
        overflow-hidden
        rounded-[24px]
        border
        border-white/[0.08]
        bg-[#0A101C]
        shadow-[0_20px_60px_rgba(0,0,0,0.35)]
      "
    >
      {/* CYAN GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-24
          h-64
          w-64
          rounded-full
          bg-cyan-400/[0.10]
          blur-[90px]
        "
      />

      {/* PURPLE GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          -left-20
          h-52
          w-52
          rounded-full
          bg-violet-500/[0.07]
          blur-[80px]
        "
      />

      {/* TOP LINE */}
      <div
        className="
          relative
          flex
          items-center
          justify-between
          border-b
          border-white/[0.06]
          px-4
          py-3
        "
      >
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              border
              border-cyan-400/15
              bg-cyan-400/[0.08]
            "
          >
            <Wallet
              size={15}
              className="text-cyan-300"
            />
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30">
              Portfolio
            </p>

            <p className="text-xs font-bold text-white/80">
              Total Balance
            </p>
          </div>
        </div>

        {/* NETWORK */}
        <div
          className="
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-emerald-400/10
            bg-emerald-400/[0.06]
            px-2.5
            py-1
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-400
              shadow-[0_0_8px_rgba(52,211,153,0.8)]
            "
          />

          <span className="text-[8px] font-bold tracking-wide text-emerald-300">
            OPN
          </span>
        </div>
      </div>

      {/* BALANCE AREA */}
      <div className="relative px-4 pb-4 pt-4">
        <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
          Available Balance
        </p>

        <div className="mt-1 flex items-baseline gap-2">
          <h2 className="text-[34px] font-black leading-none tracking-[-0.04em] text-white">
            {isConnected ? walletBalance : "0.00"}
          </h2>

          <span className="text-sm font-black text-cyan-300">
            OPN
          </span>
        </div>

        {/* MINI VALUE BAR */}
        <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="
              h-full
              w-[72%]
              rounded-full
              bg-gradient-to-r
              from-cyan-400
              via-blue-400
              to-violet-400
              shadow-[0_0_12px_rgba(34,211,238,0.45)]
            "
          />
        </div>

        {/* WALLET ROW */}
        <div className="mt-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.14em] text-white/20">
              Connected Wallet
            </p>

            <p className="mt-1 truncate font-mono text-[10px] font-medium text-white/50">
              {isConnected
                ? `${address?.slice(0, 8)}...${address?.slice(-6)}`
                : "Wallet not connected"}
            </p>
          </div>

          {isConnected && (
            <button
              type="button"
              onClick={() => {
                if (address) {
                  navigator.clipboard.writeText(address);
                }
              }}
              className="
                ml-3
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.035]
                text-white/40
                transition
                hover:border-cyan-400/20
                hover:bg-cyan-400/[0.06]
                hover:text-cyan-300
              "
              aria-label="Copy wallet address"
            >
              <Copy size={12} />
            </button>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-white/[0.05]
            bg-white/[0.025]
            px-3
            py-2
          "
        >
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/25">
              Network
            </span>

            <span className="text-[9px] font-bold text-white/55">
              IOPn Testnet
            </span>
          </div>

          <ArrowUpRight
            size={12}
            className="text-cyan-400/50"
          />
        </div>
      </div>
    </section>
  );
}