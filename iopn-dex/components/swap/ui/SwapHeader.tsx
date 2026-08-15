"use client";

import { ArrowRightLeft } from "lucide-react";

export default function SwapHeader() {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-cyan-500/10
            ring-1
            ring-cyan-400/10
          "
        >
          <ArrowRightLeft
            size={20}
            className="text-cyan-400"
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-2xl font-black leading-none text-white">
            Swap
          </h2>

          <p className="mt-1 text-xs font-medium text-white/40">
            Best Route • OPN Testnet
          </p>
        </div>
      </div>
    </div>
  );
}