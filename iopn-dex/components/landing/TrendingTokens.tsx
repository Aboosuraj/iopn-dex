"use client";

import Link from "next/link";
import { TOKENS } from "@/lib/tokens";

export default function TrendingTokens() {
  const trending = TOKENS.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">

      <div className="flex items-end justify-between">

        <div>

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            Trending
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Trending Tokens
          </h2>

          <p className="mt-4 max-w-xl text-white/60">
            Popular assets currently available on the IOPn ecosystem.
          </p>

        </div>

        <Link
          href="/market"
          className="hidden rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:border-cyan-400/30 hover:bg-white/10 md:block"
        >
          View Market →
        </Link>

      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {trending.map((token) => (

          <Link
            key={token.address}
            href={`/market/${token.address}`}
            className="
              group
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-6
              transition
              duration-300
              hover:-translate-y-1
              hover:border-cyan-400/30
              hover:bg-white/[0.08]
            "
          >

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-xl font-black text-cyan-300">
                {token.symbol[0]}
              </div>

              <div>

                <h3 className="font-black">
                  {token.symbol}
                </h3>

                <p className="text-sm text-white/50">
                  {token.name}
                </p>

              </div>

            </div>

            <div className="mt-6 flex items-center justify-between">

              <div>

                <p className="text-xs text-white/40">
                  Network
                </p>

                <p className="font-bold">
                  IOPn Testnet
                </p>

              </div>

              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-bold text-cyan-300">
                Trending
              </span>

            </div>

          </Link>

        ))}

      </div>

    </section>
  );
}