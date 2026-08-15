"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

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
        rounded-2xl
        border
        border-white/10
        bg-white/[0.035]
        p-4
        backdrop-blur-xl
        transition-all
        duration-200
        hover:border-cyan-400/25
        hover:bg-white/[0.05]
      "
    >
      {/* HEADER */}

      <div className="flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-cyan-400/10
              text-base
              font-black
              text-cyan-400
            "
          >
            {token.symbol.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <h3 className="truncate text-base font-black">
                {token.symbol}
              </h3>

              <span
                className="
                  shrink-0
                  rounded-full
                  bg-emerald-400/10
                  px-1.5
                  py-0.5
                  text-[9px]
                  font-bold
                  text-emerald-400
                "
              >
                ✓
              </span>

            </div>

            <p className="truncate text-xs text-white/35">
              {token.name}
            </p>

          </div>

        </div>

        {/* CHANGE */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1
            rounded-full
            bg-emerald-400/10
            px-2
            py-1
            text-xs
            font-bold
            text-emerald-400
          "
        >
          <TrendingUp size={12} />

          +2.35%
        </div>

      </div>


      {/* MARKET DATA */}

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-x-4
          gap-y-3
          border-t
          border-white/5
          pt-3
        "
      >

        <div>
          <p className="text-[10px] text-white/30">
            Price
          </p>

          <p className="mt-0.5 text-sm font-bold">
            $1.00
          </p>
        </div>


        <div>
          <p className="text-[10px] text-white/30">
            Liquidity
          </p>

          <p className="mt-0.5 text-sm font-bold">
            $250K
          </p>
        </div>


        <div>
          <p className="text-[10px] text-white/30">
            Volume
          </p>

          <p className="mt-0.5 text-sm font-bold">
            $42K
          </p>
        </div>


        <div>
          <p className="text-[10px] text-white/30">
            Holders
          </p>

          <p className="mt-0.5 text-sm font-bold">
            532
          </p>
        </div>

      </div>


      {/* ACTIONS */}

      <div className="mt-4 flex gap-2">

        <Link
          href={`/swap?token=${token.address}`}
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-1.5
            rounded-xl
            bg-cyan-500
            py-2.5
            text-sm
            font-black
            text-black
            transition
            hover:bg-cyan-400
            active:scale-[0.98]
          "
        >
          Swap
        </Link>

        <Link
          href={`/market/${token.address}`}
          className="
            flex
            items-center
            justify-center
            gap-1
            rounded-xl
            border
            border-white/10
            px-4
            py-2.5
            text-sm
            font-bold
            text-white/70
            transition
            hover:border-cyan-400/30
            hover:bg-cyan-400/5
            hover:text-cyan-400
          "
        >
          Info

          <ArrowUpRight size={14} />

        </Link>

      </div>

    </div>
  );
}