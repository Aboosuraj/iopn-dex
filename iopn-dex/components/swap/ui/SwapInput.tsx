"use client";

import TokenButton from "./TokenButton";

interface Props {
  amount: string;
  setAmount: (value: string) => void;
  symbol: string;
  balance: string;
  onSelect: () => void;
}

export default function SwapInput({
  amount,
  setAmount,
  symbol,
  balance,
  onSelect,
}: Props) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-4
        py-4
        shadow-sm
        transition-colors
        dark:border-white/10
        dark:bg-[#111827]
        dark:shadow-none
      "
    >
      {/* HEADER */}

      <div className="mb-3 flex items-center justify-between">
        <span
          className="
            text-sm
            font-semibold
            text-slate-600
            dark:text-white/55
          "
        >
          You Pay
        </span>

        <span
          className="
            max-w-[55%]
            truncate
            text-xs
            text-slate-500
            dark:text-white/40
          "
        >
          Balance: {balance || "0"}
        </span>
      </div>

      {/* AMOUNT + TOKEN */}

      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="
            min-w-0
            flex-1
            bg-transparent
            text-[42px]
            font-black
            leading-none
            tracking-tight
            text-slate-900
            outline-none
            placeholder:text-slate-300
            dark:text-white
            dark:placeholder:text-white/20
          "
        />

        <TokenButton
          symbol={symbol}
          onClick={onSelect}
        />
      </div>

      {/* MAX */}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setAmount(balance)}
          className="
            rounded-lg
            bg-cyan-500/10
            px-3
            py-1.5
            text-xs
            font-bold
            text-cyan-600
            transition
            hover:bg-cyan-500/20
            dark:text-cyan-400
          "
        >
          MAX
        </button>
      </div>
    </div>
  );
}