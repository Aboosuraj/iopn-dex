"use client";

import { ArrowRightLeft } from "lucide-react";

export default function SwapHeader() {
  return (
    <div className="mb-8">

      <div className="flex items-center gap-3">

        <div
          className="
            rounded-2xl
            bg-cyan-500/15
            p-3
          "
        >
          <ArrowRightLeft
            size={22}
            className="text-cyan-400"
          />
        </div>

        <div>

          <h2 className="text-3xl font-black">
            Swap
          </h2>

          <p className="text-sm text-white/50">
            Best Route • OPN Testnet
          </p>

        </div>

      </div>

    </div>
  );
}