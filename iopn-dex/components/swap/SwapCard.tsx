"use client";

import SwapHeader from "./ui/SwapHeader";
import SwapInput from "./ui/SwapInput";
import SwapOutput from "./ui/SwapOutput";
import SwapActionButton from "./ui/SwapActionButton";

type Token = {
  symbol: string;
  address: string;
  decimals: number;
  native: boolean;
};

type Props = {
  amountIn: string;
  setAmountIn: (value: string) => void;

  amountOut: string;

  tokenIn: Token;
  tokenOut: Token;

  onSelectIn: () => void;
  onSelectOut: () => void;

  onFlip: () => void;

  balance: string;

  onSwap: () => void;

  buttonText: string;

  loading: boolean;
};

export default function SwapCard({
  amountIn,
  setAmountIn,
  amountOut,
  tokenIn,
  tokenOut,
  onSelectIn,
  onSelectOut,
  onFlip,
  balance,
  onSwap,
  buttonText,
  loading,
}: Props) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-4
        backdrop-blur-xl
        shadow-[0_0_40px_rgba(6,182,212,.08)]
      "
    >
      <SwapHeader />

      <SwapInput
        amount={amountIn}
        setAmount={setAmountIn}
        symbol={tokenIn.symbol}
        balance={balance}
        onSelect={onSelectIn}
      />

      {/* FLIP */}

      <div className="flex justify-center py-3">
        <button
          type="button"
          onClick={onFlip}
          aria-label="Flip tokens"
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border
            border-cyan-500/30
            bg-[#111827]
            text-xl
            text-cyan-400
            transition
            hover:rotate-180
            hover:border-cyan-400
            hover:bg-cyan-500/10
          "
        >
          ⇅
        </button>
      </div>

      <SwapOutput
        amount={amountOut}
        symbol={tokenOut.symbol}
        onSelect={onSelectOut}
      />

      <SwapActionButton
        buttonText={buttonText}
        loading={loading}
        onSwap={onSwap}
      />
    </div>
  );
}