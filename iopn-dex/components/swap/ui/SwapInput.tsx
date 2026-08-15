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
        border-white/10
        bg-[#111827]
        px-4
        py-4
      "
    >
      {/* TOP ROW */}

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/55">
          You Pay
        </span>

        <span
          className="
            max-w-[58%]
            truncate
            text-right
            text-xs
            text-white/40
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
            placeholder:text-white/15
          "
        />

        <TokenButton
          symbol={symbol}
          onClick={onSelect}
        />
      </div>

      {/* MAX */}

      <button
        type="button"
        onClick={() => setAmount(balance)}
        className="
          mt-4
          rounded-xl
          bg-cyan-500/15
          px-4
          py-2
          text-xs
          font-black
          text-cyan-400
          transition
          hover:bg-cyan-500/25
        "
      >
        MAX
      </button>
    </div>
  );
}