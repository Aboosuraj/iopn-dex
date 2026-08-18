"use client";

import SwapHeader from "./ui/SwapHeader";
import SwapInput from "./ui/SwapInput";
import SwapOutput from "./ui/SwapOutput";
import SwapActionButton from "./ui/SwapActionButton";

import { useTheme } from "@/components/ThemeProvider";

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
  const { darkMode } = useTheme();

  return (
    <div
      className={`
        rounded-3xl
        border
        p-4
        backdrop-blur-xl
        transition-colors
        duration-300
        ${
          darkMode
            ? `
              border-white/10
              bg-white/[0.04]
              shadow-[0_0_40px_rgba(6,182,212,.08)]
            `
            : `
              border-slate-200
              bg-white
              shadow-[0_10px_40px_rgba(15,23,42,0.08)]
            `
        }
      `}
    >
      {/* HEADER */}

      <SwapHeader />

      {/* YOU PAY */}

      <SwapInput
        amount={amountIn}
        setAmount={setAmountIn}
        symbol={tokenIn.symbol}
        balance={balance}
        onSelect={onSelectIn}
      />

      {/* FLIP */}

      <div className="flex justify-center py-2.5">
        <button
          type="button"
          onClick={onFlip}
          aria-label="Flip tokens"
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            text-lg
            transition
            duration-200
            hover:rotate-180
            ${
              darkMode
                ? `
                  border-cyan-500/30
                  bg-[#111827]
                  text-cyan-400
                  hover:border-cyan-400
                  hover:bg-cyan-500/10
                `
                : `
                  border-cyan-200
                  bg-cyan-50
                  text-cyan-600
                  hover:border-cyan-400
                  hover:bg-cyan-100
                `
            }
          `}
        >
          ⇅
        </button>
      </div>

      {/* YOU RECEIVE */}

      <SwapOutput
        amount={amountOut}
        symbol={tokenOut.symbol}
        onSelect={onSelectOut}
      />

      {/* ACTION */}

      <SwapActionButton
        buttonText={buttonText}
        loading={loading}
        onSwap={onSwap}
      />
    </div>
  );
}