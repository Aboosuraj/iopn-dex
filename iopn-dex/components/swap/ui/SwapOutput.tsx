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
        border-slate-200
        bg-slate-50
        px-4
        py-4
        dark:border-white/10
        dark:bg-[#111827]
      "
    >
      {/* HEADER */}

      <div className="mb-3">
        <span
          className="
            text-sm
            font-semibold
            text-slate-600
            dark:text-white/55
          "
        >
          You Receive
        </span>
      </div>

      {/* AMOUNT + TOKEN */}

      <div className="flex min-w-0 items-center gap-3">

        {/* OUTPUT AMOUNT */}

        <div className="min-w-0 flex-1 overflow-hidden">

          <div
            className="
              overflow-hidden
              text-4xl
              font-black
              leading-none
              tracking-tight
              text-cyan-600
              dark:text-cyan-400
            "
          >
            <span className="block truncate">
              {amount || "0.0"}
            </span>
          </div>

          <div
            className="
              mt-2
              text-xs
              font-medium
              text-slate-400
              dark:text-white/35
            "
          >
            Estimated Output
          </div>

        </div>

        {/* TOKEN */}

        <div className="shrink-0">
          <TokenButton
            symbol={symbol}
            onClick={onSelect}
          />
        </div>

      </div>
    </div>
  );
}