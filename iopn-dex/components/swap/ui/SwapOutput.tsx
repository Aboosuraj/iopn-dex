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
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-[#111827]
        px-4
        py-4
      "
    >
      {/* HEADER */}

      <div className="mb-3">
        <span className="text-sm font-semibold text-white/55">
          You Receive
        </span>
      </div>

      {/* AMOUNT + TOKEN */}

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div
            className="
              truncate
              text-[42px]
              font-black
              leading-none
              tracking-tight
              text-cyan-400
            "
          >
            {amount || "0.0"}
          </div>

          <div className="mt-2 text-xs text-white/35">
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