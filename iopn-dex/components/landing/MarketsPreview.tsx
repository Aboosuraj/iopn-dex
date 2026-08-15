"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  CircleDot,
} from "lucide-react";

import { TOKENS } from "@/lib/tokens";

export default function MarketsPreview() {
  const tokens = TOKENS.slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">

      {/* HEADER */}

      <div className="flex items-end justify-between gap-4">

        <div>

          <div className="flex items-center gap-2">

            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                border
                border-cyan-400/15
                bg-cyan-400/[0.07]
              "
            >
              <BarChart3
                size={13}
                className="text-cyan-400"
              />
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Markets
            </p>

          </div>

          <h2 className="mt-2 text-xl font-black tracking-tight text-white md:text-2xl">
            Explore IOPn Assets
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-white/40">
            Discover supported assets and trade instantly on IOPn DEX.
          </p>

        </div>

        <Link
          href="/market"
          className="
            group
            flex
            shrink-0
            items-center
            gap-1
            rounded-lg
            border
            border-white/[0.08]
            bg-white/[0.035]
            px-2.5
            py-1.5
            text-[9px]
            font-bold
            text-white/60
            transition-all
            hover:border-cyan-400/25
            hover:bg-cyan-400/[0.07]
            hover:text-cyan-300
          "
        >
          View All

          <ChevronRight
            size={11}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>

      </div>


      {/* MARKET TERMINAL */}

      <div
        className="
          relative
          mt-5
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.08]
          bg-[#080d1a]/90
          shadow-[0_18px_60px_rgba(0,0,0,0.28)]
          backdrop-blur-2xl
        "
      >

        {/* TOP GLOW */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[-80px]
            h-40
            w-72
            -translate-x-1/2
            rounded-full
            bg-cyan-400/[0.05]
            blur-3xl
          "
        />

        {/* HEADER */}

        <div
          className="
            relative
            hidden
            grid-cols-[1.8fr_1fr_1fr_70px]
            items-center
            border-b
            border-white/[0.06]
            px-4
            py-2.5
            text-[8px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-white/25
            md:grid
          "
        >
          <span>Asset</span>
          <span>Network</span>
          <span>Status</span>
          <span className="text-right">Trade</span>
        </div>


        {/* TOKENS */}

        {tokens.length === 0 ? (

          <div className="px-4 py-8 text-center text-[10px] text-white/35">
            No listed tokens available yet.
          </div>

        ) : (

          tokens.map((token, index) => (

            <div
              key={token.address}
              className="
                group
                relative
                border-b
                border-white/[0.055]
                px-3
                py-2.5
                last:border-b-0
                transition-all
                duration-200
                hover:bg-white/[0.025]
              "
            >

              {/* MOBILE / DESKTOP ROW */}

              <div
                className="
                  grid
                  grid-cols-[1fr_auto]
                  items-center
                  gap-3
                  md:grid-cols-[1.8fr_1fr_1fr_70px]
                "
              >

                {/* ASSET */}

                <Link
                  href="/market"
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-2.5
                  "
                >

                  {/* RANK */}

                  <span className="hidden w-4 text-[8px] font-bold text-white/15 sm:block">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* TOKEN ICON */}

                  <div
                    className="
                      relative
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-xl
                      border
                      border-cyan-400/15
                      bg-gradient-to-br
                      from-cyan-400/[0.12]
                      to-violet-500/[0.08]
                      shadow-[0_0_18px_rgba(34,211,238,0.05)]
                      transition-all
                      duration-200
                      group-hover:border-cyan-400/30
                      group-hover:shadow-[0_0_22px_rgba(34,211,238,0.10)]
                    "
                  >

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-br
                        from-cyan-400/[0.06]
                        to-transparent
                      "
                    />

                    <span className="relative text-[10px] font-black text-cyan-300">
                      {token.symbol?.slice(0, 1) || "?"}
                    </span>

                  </div>


                  {/* NAME */}

                  <div className="min-w-0">

                    <div className="flex items-center gap-1.5">

                      <p className="truncate text-[10px] font-black text-white">
                        {token.symbol}
                      </p>

                      <span className="hidden rounded-full bg-cyan-400/[0.07] px-1.5 py-0.5 text-[7px] font-bold text-cyan-300 sm:inline">
                        OPN
                      </span>

                    </div>

                    <p className="truncate text-[8px] text-white/30">
                      {token.name}
                    </p>

                  </div>

                </Link>


                {/* NETWORK */}

                <div className="hidden items-center gap-1.5 md:flex">

                  <CircleDot
                    size={9}
                    className="text-cyan-400"
                  />

                  <span className="text-[8px] font-medium text-white/35">
                    IOPn Testnet
                  </span>

                </div>


                {/* STATUS */}

                <div className="hidden items-center gap-1.5 md:flex">

                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_7px_rgba(52,211,153,0.8)]
                    "
                  />

                  <span className="text-[8px] font-bold text-emerald-400">
                    Live
                  </span>

                </div>


                {/* MOBILE STATUS */}

                <div className="flex items-center gap-2 md:hidden">

                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_7px_rgba(52,211,153,0.8)]
                    "
                  />

                  <Link
                    href={`/trade?token=${token.address}`}
                    className="
                      flex
                      h-7
                      items-center
                      gap-1
                      rounded-lg
                      border
                      border-cyan-400/15
                      bg-cyan-400/[0.07]
                      px-2.5
                      text-[8px]
                      font-black
                      text-cyan-300
                      transition
                      hover:border-cyan-400/30
                      hover:bg-cyan-400/[0.13]
                      active:scale-95
                    "
                  >
                    Swap
                    <ArrowUpRight size={10} />
                  </Link>

                </div>


                {/* DESKTOP ACTION */}

                <div className="hidden justify-end md:flex">

                  <Link
                    href={`/trade?token=${token.address}`}
                    className="
                      flex
                      h-7
                      items-center
                      gap-1
                      rounded-lg
                      border
                      border-cyan-400/15
                      bg-cyan-400/[0.07]
                      px-2.5
                      text-[8px]
                      font-black
                      text-cyan-300
                      transition-all
                      hover:border-cyan-400/30
                      hover:bg-cyan-400/[0.13]
                      hover:shadow-[0_0_15px_rgba(34,211,238,0.08)]
                      active:scale-95
                    "
                  >
                    Swap
                    <ArrowUpRight size={10} />
                  </Link>

                </div>

              </div>

            </div>

          ))

        )}

        {/* BOTTOM */}

        {tokens.length > 0 && (
          <div
            className="
              flex
              items-center
              justify-between
              border-t
              border-white/[0.05]
              bg-white/[0.015]
              px-4
              py-2
            "
          >

            <span className="text-[8px] text-white/25">
              {tokens.length} supported assets
            </span>

            <Link
              href="/market"
              className="
                text-[8px]
                font-bold
                text-cyan-400/70
                transition
                hover:text-cyan-300
              "
            >
              Explore market →
            </Link>

          </div>
        )}

      </div>

    </section>
  );
}