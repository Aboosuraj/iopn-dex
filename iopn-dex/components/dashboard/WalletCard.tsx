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
        mx-auto
        mt-2
        w-[40%]
        min-w-[260px]
        max-w-[360px]
        overflow-hidden
        rounded-[14px]
        border
        border-white/[0.08]
        bg-[#0A101C]
        shadow-[0_10px_30px_rgba(0,0,0,0.30)]
      "
    >
      {/* CYAN GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-12
          h-32
          w-32
          rounded-full
          bg-cyan-400/[0.08]
          blur-[55px]
        "
      />

      {/* PURPLE GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-12
          -left-10
          h-28
          w-28
          rounded-full
          bg-violet-500/[0.06]
          blur-[50px]
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
          px-2.5
          py-2
        "
      >
        <div className="flex items-center gap-1.5">
          <div
            className="
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-lg
              border
              border-cyan-400/15
              bg-cyan-400/[0.08]
            "
          >
            <Wallet
              size={11}
              className="text-cyan-300"
            />
          </div>

          <div>
            <p
              className="
                text-[6px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-white/30
              "
            >
              Portfolio
            </p>

            <p
              className="
                text-[9px]
                font-bold
                leading-tight
                text-white/80
              "
            >
              Total Balance
            </p>
          </div>
        </div>

        {/* NETWORK */}
        <div
          className="
            flex
            items-center
            gap-1
            rounded-full
            border
            border-emerald-400/10
            bg-emerald-400/[0.06]
            px-2
            py-0.5
          "
        >
          <span
            className="
              h-1
              w-1
              rounded-full
              bg-emerald-400
              shadow-[0_0_5px_rgba(52,211,153,0.8)]
            "
          />

          <span
            className="
              text-[6px]
              font-bold
              tracking-wide
              text-emerald-300
            "
          >
            OPN
          </span>
        </div>
      </div>

      {/* BALANCE AREA */}
      <div
        className="
          relative
          px-2.5
          pb-2.5
          pt-2.5
        "
      >
        <p
          className="
            text-[6px]
            uppercase
            tracking-[0.14em]
            text-white/25
          "
        >
          Available Balance
        </p>

        <div
          className="
            mt-0.5
            flex
            items-baseline
            gap-1
          "
        >
          <h2
            className="
              text-[20px]
              font-black
              leading-none
              tracking-[-0.04em]
              text-white
            "
          >
            {isConnected ? walletBalance : "0.00"}
          </h2>

          <span
            className="
              text-[9px]
              font-black
              text-cyan-300
            "
          >
            OPN
          </span>
        </div>

        {/* MINI VALUE BAR */}
        <div
          className="
            mt-2
            h-[2px]
            overflow-hidden
            rounded-full
            bg-white/[0.06]
          "
        >
          <div
            className="
              h-full
              w-[72%]
              rounded-full
              bg-gradient-to-r
              from-cyan-400
              via-blue-400
              to-violet-400
              shadow-[0_0_7px_rgba(34,211,238,0.40)]
            "
          />
        </div>

        {/* WALLET ROW */}
        <div
          className="
            mt-2
            flex
            items-center
            justify-between
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[5px]
                uppercase
                tracking-[0.12em]
                text-white/20
              "
            >
              Connected Wallet
            </p>

            <p
              className="
                mt-0.5
                truncate
                font-mono
                text-[7px]
                font-medium
                text-white/50
              "
            >
              {isConnected
                ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
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
                ml-2
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-lg
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
              <Copy size={9} />
            </button>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="
            mt-2
            flex
            items-center
            justify-between
            rounded-lg
            border
            border-white/[0.05]
            bg-white/[0.025]
            px-2
            py-1.5
          "
        >
          <div className="flex items-center gap-1.5">
            <span
              className="
                text-[6px]
                text-white/25
              "
            >
              Network
            </span>

            <span
              className="
                text-[6px]
                font-bold
                text-white/55
              "
            >
              IOPn Testnet
            </span>
          </div>

          <ArrowUpRight
            size={9}
            className="text-cyan-400/50"
          />
        </div>
      </div>
    </section>
  );
}