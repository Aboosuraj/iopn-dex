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
        bg-cyan-500/15
      "
    >
      <ArrowRightLeft
        size={20}
        className="text-cyan-400"
      />
    </div>

    <div className="min-w-0">

      <h2 className="text-xl font-black leading-tight">
        Swap
      </h2>

      <p className="mt-0.5 truncate text-xs text-white/45">
        Best Route • OPN Testnet
      </p>

    </div>

  </div>

</div>

);
}