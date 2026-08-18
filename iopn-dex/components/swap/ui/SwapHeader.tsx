"use client";

import { ArrowRightLeft } from "lucide-react";

export default function SwapHeader() {
  return (
    <div className="mb-4">

      <div className="flex items-center gap-3">

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-cyan-500/10
            text-cyan-500
            dark:bg-cyan-500/15
            dark:text-cyan-400
          "
        >
          <ArrowRightLeft
            size={20}
            className="text-cyan-500 dark:text-cyan-400"
          />
        </div>

        <div className="min-w-0">

          <h2
            className="
              text-xl
              font-black
              leading-tight
              text-slate-950
              dark:text-white
            "
          >
            Swap
          </h2>

          <p
            className="
              mt-0.5
              truncate
              text-xs
              text-slate-500
              dark:text-white/45
            "
          >
            Best Route • OPN Testnet
          </p>

        </div>

      </div>

    </div>
  );
}