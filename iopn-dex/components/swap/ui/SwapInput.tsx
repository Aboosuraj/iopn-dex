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
    <div className="space-y-4">
      {/* HEADER */}

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/55">
          You Pay
        </span>

        <span className="max-w-[55%] truncate text-xs text-white/40">
          Balance: {balance || "0"}
        </span>
      </div>

      {/* AMOUNT + TOKEN */}

      <div className="flex min-w-0 items-center gap-3">
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
            text-white
            outline-none
            placeholder:text-white/20
          "
        />

        <TokenButton
          symbol={symbol}
          onClick={onSelect}
        />
      </div>

      {/* MAX */}

      <div className="flex justify-end">
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
            text-cyan-400
            transition
            hover:bg-cyan-500/20
          "
        >
          MAX
        </button>
      </div>
    </div>
  );
}