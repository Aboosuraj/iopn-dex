"use client";

import Link from "next/link";
import { TOKENS } from "@/lib/tokens";

export default function MarketsPreview() {
  const tokens = TOKENS.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">

      {/* Header */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            Markets
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Explore IOPn Assets
          </h2>

          <p className="mt-4 max-w-2xl text-white/60">
            Discover tokens supported by IOPn DEX and explore their
            market information before trading.
          </p>

        </div>

        <Link
          href="/market"
          className="inline-flex w-fit rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold transition hover:border-cyan-400/30 hover:bg-white/10"
        >
          View All Markets →
        </Link>

      </div>


      {/* Token List */}

      <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">

        {/* Desktop Header */}

        <div className="hidden grid-cols-[2fr_1fr_1fr] gap-4 border-b border-white/10 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 md:grid">
          <span>Asset</span>
          <span>Network</span>
          <span className="text-right">Action</span>
        </div>


        {tokens.length === 0 ? (

          <div className="px-6 py-12 text-center text-white/50">
            No listed tokens available yet.
          </div>

        ) : (

          tokens.map((token) => (

            <div
              key={token.address}
              className="grid gap-4 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[2fr_1fr_1fr] md:items-center md:px-6"
            >

              {/* Token */}

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-cyan-400/10 text-sm font-black text-cyan-300">
                  {token.symbol?.slice(0, 1) || "?"}
                </div>

                <div className="min-w-0">

                  <p className="font-bold">
                    {token.symbol}
                  </p>

                  <p className="truncate text-sm text-white/45">
                    {token.name}
                  </p>

                </div>

              </div>


              {/* Network */}

              <div className="text-sm text-white/50">
                IOPn Testnet
              </div>


              {/* Action */}

              <div className="flex justify-start md:justify-end">

                <Link
                  href={`/trade?token=${token.address}`}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-cyan-400"
                >
                  Swap
                </Link>

              </div>

            </div>

          ))

        )}

      </div>

    </section>
  );
}