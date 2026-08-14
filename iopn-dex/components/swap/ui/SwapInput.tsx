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
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-5">

      <div className="mb-4 flex items-center justify-between">

        <span className="text-sm text-white/50">
          You Pay
        </span>

        <span className="text-xs text-white/40">
          Balance: {balance || "0"}
        </span>

      </div>

      <div className="flex items-center justify-between gap-4">

        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="
            w-full
            bg-transparent
            text-5xl
            font-black
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

      <button
        onClick={() => setAmount(balance)}
        className="
          mt-5
          rounded-xl
          bg-cyan-500/15
          px-4
          py-2
          text-sm
          font-bold
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