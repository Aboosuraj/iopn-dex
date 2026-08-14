"use client";

import TokenButton from "./TokenButton";

interface Props {
  amount: string;
  symbol: string;
  onSelect: () => void;
}

export default function SwapOutput({
  amount,
  symbol,
  onSelect,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-5">

      <div className="mb-4">

        <span className="text-sm text-white/50">
          You Receive
        </span>

      </div>

      <div className="flex items-center justify-between gap-4">

        <div className="overflow-hidden">

          <div className="truncate text-5xl font-black text-cyan-400">
            {amount || "0.0"}
          </div>

          <div className="mt-2 text-sm text-white/40">
            Estimated Output
          </div>

        </div>

        <TokenButton
          symbol={symbol}
          onClick={onSelect}
        />

      </div>

    </div>
  );
}