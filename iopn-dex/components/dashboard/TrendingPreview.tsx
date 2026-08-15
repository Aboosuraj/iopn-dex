"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { TOKENS } from "@/lib/tokens";

export default function TrendingPreview() {
  const trendingTokens = TOKENS.slice(0, 5);

  return (
    <section className="mt-8">

      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">

        <div>
          <div className="flex items-center gap-2">

            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                border
                border-cyan-400/10
                bg-cyan-400/[0.08]
              "
            >
              <TrendingUp
                size={16}
                className="text-cyan-400"
              />
            </div>

            <h2
              className="
                text-xl
                font-black
                tracking-tight
                text-white
              "
            >
              Trending
            </h2>

          </div>

          <p
            className="
              mt-1
              ml-10
              text-[10px]
              font-medium
              text-white/30
            "
          >
            Popular tokens on IOPn
          </p>
        </div>


        {/* VIEW ALL → MARKETS */}
        <Link
          href="/markets"
          className="
            group
            flex
            items-center
            gap-1
            rounded-xl
            border
            border-cyan-400/10
            bg-cyan-400/[0.05]
            px-3
            py-2
            text-[11px]
            font-bold
            text-cyan-400
            transition
            hover:border-cyan-400/20
            hover:bg-cyan-400/[0.09]
            active:scale-95
          "
        >
          View All

          <ChevronRight
            size={13}
            className="
              transition-transform
              group-hover:translate-x-0.5
            "
          />
        </Link>

      </div>


      {/* TRENDING LIST */}
      <div className="space-y-2.5">

        {trendingTokens.map((token, index) => (

          <div
            key={token.address}
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.035]
              p-3
              backdrop-blur-xl
              transition-all
              duration-200
              hover:-translate-y-[1px]
              hover:border-cyan-400/20
              hover:bg-white/[0.05]
            "
          >

            {/* SUBTLE GLOW */}
            <div
              className="
                pointer-events-none
                absolute
                right-[-35px]
                top-[-35px]
                h-20
                w-20
                rounded-full
                bg-cyan-400/[0.05]
                blur-2xl
              "
            />


            <div
              className="
                relative
                flex
                items-center
                justify-between
              "
            >

              {/* TOKEN INFO */}
              <Link
                href="/markets"
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  gap-3
                "
              >

                {/* RANK */}
                <span
                  className="
                    w-4
                    text-center
                    text-[10px]
                    font-bold
                    text-white/20
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </span>


                {/* TOKEN ICON */}
                <div
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-cyan-400/10
                    bg-gradient-to-br
                    from-cyan-400/10
                    to-violet-500/10
                    shadow-[0_0_18px_rgba(34,211,238,0.06)]
                  "
                >

                  <div
                    className="
                      absolute
                      inset-0
                      bg-cyan-400/[0.03]
                    "
                  />

                  <span
                    className="
                      relative
                      text-sm
                      font-black
                      text-cyan-300
                    "
                  >
                    {token.symbol?.slice(0, 1)}
                  </span>

                </div>


                {/* TOKEN NAME */}
                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <h3
                      className="
                        truncate
                        text-sm
                        font-black
                        text-white
                      "
                    >
                      {token.symbol}
                    </h3>

                    <span
                      className="
                        rounded-md
                        bg-emerald-400/[0.08]
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-emerald-400
                      "
                    >
                      Live
                    </span>

                  </div>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[10px]
                      text-white/35
                    "
                  >
                    {token.name}
                  </p>

                </div>

              </Link>


              {/* RIGHT SIDE */}
              <div
                className="
                  ml-3
                  flex
                  shrink-0
                  items-center
                  gap-2
                "
              >

                {/* MARKET STATUS */}
                <div className="hidden text-right sm:block">

                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-wider
                      text-white/20
                    "
                  >
                    Market
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      font-bold
                      text-emerald-400
                    "
                  >
                    Active
                  </p>

                </div>


                {/* SWAP → SWAP INTERFACE */}
                <Link
                  href="/swap"
                  className="
                    flex
                    h-9
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-cyan-400/10
                    bg-cyan-400/[0.08]
                    px-3
                    text-[10px]
                    font-black
                    text-cyan-300
                    transition-all
                    hover:border-cyan-400/25
                    hover:bg-cyan-400/[0.14]
                    hover:text-cyan-200
                    active:scale-95
                  "
                >
                  Swap

                  <ArrowUpRight size={12} />
                </Link>

              </div>

            </div>

          </div>

        ))}

      </div>


      {/* EMPTY STATE */}
      {trendingTokens.length === 0 && (

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

          <p
            className="
              text-sm
              font-bold
              text-white/50
            "
          >
            No trending tokens
          </p>

          <p
            className="
              mt-1
              text-[10px]
              text-white/25
            "
          >
            Token data will appear here when available.
          </p>

        </div>

      )}

    </section>
  );
}