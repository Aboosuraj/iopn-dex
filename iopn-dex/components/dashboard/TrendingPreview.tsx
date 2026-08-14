"use client";

import Link from "next/link";
import { TOKENS } from "@/lib/tokens";

export default function TrendingPreview() {
  return (
    <section className="mt-10">

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-2xl font-black">
          Trending Tokens
        </h2>

        <Link
          href="/market"
          className="text-cyan-400 font-bold"
        >
          View All →
        </Link>

      </div>

      <div className="space-y-3">

        {TOKENS.slice(0, 5).map((token) => (

          <Link
            key={token.address}
            href={`/market/${token.address}`}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-400/30"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 font-black text-cyan-400">
                {token.symbol[0]}
              </div>

              <div>

                <h3 className="font-bold">
                  {token.symbol}
                </h3>

                <p className="text-sm text-white/50">
                  {token.name}
                </p>

              </div>

            </div>

            <button className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black hover:bg-cyan-400">
              Swap
            </button>

          </Link>

        ))}

      </div>

    </section>
  );
}