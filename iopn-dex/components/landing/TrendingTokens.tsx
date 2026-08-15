"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { TOKENS } from "@/lib/tokens";

export default function TrendingTokens() {
  const trending = TOKENS.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">

      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              border-cyan-400/15
              bg-cyan-400/[0.07]
              shadow-[0_0_20px_rgba(34,211,238,0.06)]
            "
          >
            <TrendingUp
              size={17}
              className="text-cyan-400"
              strokeWidth={2.3}
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-400/80">
              Market Pulse
            </p>

            <h2 className="text-xl font-black tracking-tight text-white">
              Trending
            </h2>
          </div>

        </div>

        {/* VIEW ALL */}
        <Link
          href="/market"
          className="
            group
            flex
            items-center
            gap-1
            rounded-xl
            border
            border-white/[0.08]
            bg-white/[0.035]
            px-3
            py-2
            text-[10px]
            font-bold
            text-white/60
            transition-all
            hover:border-cyan-400/20
            hover:bg-cyan-400/[0.06]
            hover:text-cyan-400
            active:scale-95
          "
        >
          View All

          <ChevronRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>

      </div>


      {/* TRENDING CARDS */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">

        {trending.map((token, index) => (

          <Link
            key={token.address}
            href="/market"
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#0b1020]
              px-3.5
              py-3
              shadow-[0_8px_30px_rgba(0,0,0,0.18)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-cyan-400/20
              hover:bg-[#0d1426]
              hover:shadow-[0_8px_35px_rgba(0,200,255,0.06)]
              active:scale-[0.985]
            "
          >

            {/* CARD GLOW */}
            <div
              className="
                pointer-events-none
                absolute
                -right-10
                -top-10
                h-24
                w-24
                rounded-full
                bg-cyan-400/[0.06]
                blur-3xl
                transition-all
                duration-300
                group-hover:bg-cyan-400/[0.1]
              "
            />

            <div className="relative">

              {/* TOP */}
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-1.5">

                  <span className="text-[8px] font-bold text-white/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.7)]" />

                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400/80">
                    Live
                  </span>

                </div>

                <ArrowUpRight
                  size={14}
                  className="
                    text-white/20
                    transition-all
                    duration-200
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-cyan-400
                  "
                />

              </div>


              {/* TOKEN INFO */}
              <div className="mt-3 flex items-center gap-3">

                {/* TOKEN ICON */}
                <div
                  className="
                    relative
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-cyan-400/10
                    bg-gradient-to-br
                    from-cyan-400/[0.12]
                    via-white/[0.03]
                    to-violet-500/[0.08]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                  "
                >

                  <div
                    className="
                      absolute
                      inset-0
                      bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_55%)]
                    "
                  />

                  <span className="relative text-base font-black text-cyan-300">
                    {token.symbol?.slice(0, 1)}
                  </span>

                </div>


                {/* NAME */}
                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-1.5">

                    <h3 className="truncate text-sm font-black text-white">
                      {token.symbol}
                    </h3>

                    <span className="rounded-md bg-cyan-400/[0.07] px-1.5 py-0.5 text-[7px] font-bold text-cyan-400">
                      OPN
                    </span>

                  </div>

                  <p className="mt-0.5 truncate text-[9px] text-white/30">
                    {token.name}
                  </p>

                </div>

              </div>


              {/* BOTTOM INFO */}
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.055] pt-2.5">

                <div>
                  <p className="text-[7px] font-medium uppercase tracking-wider text-white/20">
                    Network
                  </p>

                  <p className="mt-0.5 text-[9px] font-bold text-white/45">
                    IOPn Testnet
                  </p>
                </div>


                <div
                  className="
                    rounded-lg
                    border
                    border-cyan-400/10
                    bg-cyan-400/[0.05]
                    px-2.5
                    py-1.5
                    text-[9px]
                    font-black
                    text-cyan-400
                    transition-all
                    group-hover:border-cyan-400/20
                    group-hover:bg-cyan-400/[0.09]
                  "
                >
                  Explore
                </div>

              </div>

            </div>

          </Link>

        ))}

      </div>


      {/* EMPTY STATE */}
      {trending.length === 0 && (
        <div
          className="
            rounded-2xl
            border
            border-white/[0.07]
            bg-white/[0.025]
            p-6
            text-center
          "
        >
          <p className="text-sm font-bold text-white/50">
            No trending tokens
          </p>

          <p className="mt-1 text-[10px] text-white/25">
            Token data will appear here when available.
          </p>
        </div>
      )}

    </section>
  );
}