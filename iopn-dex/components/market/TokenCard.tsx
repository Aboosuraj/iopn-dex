"use client";

import Link from "next/link";

interface TokenCardProps {
  token: {
    name: string;
    symbol: string;
    address: string;
  };
}

export default function TokenCard({
  token,
}: TokenCardProps) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-6
        backdrop-blur-xl
        transition
        duration-300
        hover:-translate-y-1
        hover:border-cyan-400/30
      "
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-xl font-black text-cyan-400">
            {token.symbol.charAt(0)}
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h3 className="font-black">
                {token.symbol}
              </h3>

              <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">
                ✓ Verified
              </span>

            </div>

            <p className="text-sm text-white/50">
              {token.name}
            </p>

          </div>

        </div>

        <span className="rounded-full bg-green-500/15 px-3 py-1 text-sm font-bold text-green-400">
          +2.35%
        </span>

      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div>
          <p className="text-xs text-white/40">
            Price
          </p>

          <p className="font-bold">
            $1.00
          </p>
        </div>

        <div>
          <p className="text-xs text-white/40">
            Liquidity
          </p>

          <p className="font-bold">
            $250K
          </p>
        </div>

        <div>
          <p className="text-xs text-white/40">
            Volume
          </p>

          <p className="font-bold">
            $42K
          </p>
        </div>

        <div>
          <p className="text-xs text-white/40">
            Holders
          </p>

          <p className="font-bold">
            532
          </p>
        </div>

      </div>

      <div className="mt-6 flex gap-3">

        <Link
          href={`/swap?token=${token.address}`}
          className="
            flex-1
            rounded-xl
            bg-cyan-500
            py-3
            text-center
            font-bold
            text-black
            transition
            hover:bg-cyan-400
          "
        >
          Swap
        </Link>

        <Link
          href={`/market/${token.address}`}
          className="
            rounded-xl
            border
            border-white/10
            px-5
            py-3
            font-bold
            hover:border-cyan-400/30
          "
        >
          Info
        </Link>

      </div>
    </div>
  );
}