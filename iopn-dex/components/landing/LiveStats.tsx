"use client";

import {
  Activity,
  Box,
  Clock3,
  Fuel,
  ArrowUpRight,
  Wallet,
} from "lucide-react";

const EXPLORER_URL = "https://testnet.iopn.tech";

const stats = [
  {
    label: "Total Volume",
    value: "$0",
    description: "Network volume",
    icon: Activity,
    color: "text-cyan-400",
    glow: "bg-cyan-400/10",
  },
  {
    label: "Total Blocks",
    value: "22,538,362",
    description: "Blocks produced",
    icon: Box,
    color: "text-violet-400",
    glow: "bg-violet-400/10",
  },
  {
    label: "Avg. Block Time",
    value: "2s",
    description: "Average block time",
    icon: Clock3,
    color: "text-emerald-400",
    glow: "bg-emerald-400/10",
  },
  {
    label: "Gas Tracker",
    value: "0.01 GWEI",
    description: "Current gas price",
    icon: Fuel,
    color: "text-amber-400",
    glow: "bg-amber-400/10",
  },
  {
    label: "Total Transactions",
    value: "419,138,029",
    description: "Chain transactions",
    icon: Activity,
    color: "text-pink-400",
    glow: "bg-pink-400/10",
  },
  {
    label: "Wallet Addresses",
    value: "35,853,384",
    description: "Chain wallet addresses",
    icon: Wallet,
    color: "text-blue-400",
    glow: "bg-blue-400/10",
  },
];

export default function LiveStats() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      {/* HEADER */}
      <div className="mb-5 flex items-end justify-between">

        <div>
          <div className="flex items-center gap-2">

            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.07]">
              <Activity
                size={14}
                className="text-cyan-400"
              />
            </div>

            <h2 className="text-lg font-black tracking-tight text-white">
              Chain Data
            </h2>

          </div>

          <p className="ml-9 mt-1 text-[9px] text-white/30">
            IOPn Testnet network statistics
          </p>
        </div>

        <a
          href={EXPLORER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex
            items-center
            gap-1
            rounded-lg
            border
            border-cyan-400/10
            bg-cyan-400/[0.05]
            px-2.5
            py-1.5
            text-[9px]
            font-bold
            text-cyan-400
            transition
            hover:border-cyan-400/25
            hover:bg-cyan-400/[0.09]
          "
        >
          Explorer
          <ArrowUpRight size={10} />
        </a>

      </div>

      {/* SIX CARDS */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="
                group
                relative
                overflow-hidden
                rounded-xl
                border
                border-white/[0.07]
                bg-[#0b1020]/80
                p-3
                backdrop-blur-xl
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-cyan-400/20
                hover:bg-[#0e1426]
              "
            >

              {/* GLOW */}
              <div
                className={`
                  pointer-events-none
                  absolute
                  -right-8
                  -top-8
                  h-16
                  w-16
                  rounded-full
                  ${stat.glow}
                  blur-2xl
                `}
              />

              {/* ICON */}
              <div
                className={`
                  relative
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/[0.06]
                  ${stat.glow}
                `}
              >
                <Icon
                  size={13}
                  className={stat.color}
                  strokeWidth={2}
                />
              </div>

              {/* DATA */}
              <div className="relative mt-2.5">

                <p
                  className={`
                    truncate
                    text-base
                    font-black
                    tracking-tight
                    ${stat.color}
                  `}
                >
                  {stat.value}
                </p>

                <p className="mt-1 truncate text-[9px] font-bold text-white/65">
                  {stat.label}
                </p>

                <p className="mt-0.5 truncate text-[7px] text-white/25">
                  {stat.description}
                </p>

              </div>

              {/* LIVE INDICATOR */}
              <div className="absolute right-2.5 top-2.5">
                <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.8)]" />
              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}