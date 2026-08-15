"use client";

import { useState, useEffect } from "react";

import SwapCard from "@/components/swap/SwapCard";
import TokenSelector from "@/components/swap/TokenSelector";
import TokenImport from "@/components/swap/TokenImport";
import SlippageModal from "@/components/swap/SlippageModal";
import SwapHistory from "@/components/swap/SwapHistory";

import { useTokens, Token } from "@/hooks/useTokens";
import { useSwap } from "@/hooks/useSwap";
import { useTokenBalance } from "@/hooks/useBalance";
import { useApproval } from "@/hooks/useApproval";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";

import { useAccount } from "wagmi";

import {
  Settings2,
  ArrowDownUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

function formatAmount(value: string | number) {
  const number = Number(value);

  if (!number) {
    return "0";
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 6,
  });
}

export default function SwapPage() {
  const { isConnected } = useAccount();

  const {
    tokens,
    addToken,
  } = useTokens();

  const {
    addTransaction,
  } = useTransactionHistory();

  const [tokenIn, setTokenIn] = useState<Token>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<Token>(tokens[3]);

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");

  const {
    needsApproval,
    approve,
    isPending: approving,
  } = useApproval(tokenIn, amountIn);

  const [route, setRoute] = useState<string[]>([]);
  const [rate, setRate] = useState("");

  const [selector, setSelector] = useState<
    "in" | "out" | null
  >(null);

  const [importOpen, setImportOpen] = useState(false);

  const [slippage, setSlippage] = useState(0.5);

  const [slippageOpen, setSlippageOpen] = useState(false);

  const {
    getQuote,
    swap,
    isPending,
    swapSuccess,
  } = useSwap();

  const {
    balance,
    refetch: refetchBalance,
  } = useTokenBalance(tokenIn);

  useEffect(() => {
    if (swapSuccess) {
      refetchBalance();
    }
  }, [swapSuccess, refetchBalance]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!amountIn) {
        setAmountOut("");
        setRate("");
        setRoute([]);
        return;
      }

      try {
        const quote = await getQuote(
          amountIn,
          tokenIn,
          tokenOut
        );

        const formattedQuote = formatAmount(quote);

        setAmountOut(formattedQuote);

        setRate(
          `1 ${tokenIn.symbol} = ${formattedQuote} ${tokenOut.symbol}`
        );

        setRoute([
          tokenIn.symbol,
          "WOPN",
          tokenOut.symbol,
        ]);
      } catch {
        setAmountOut("");
        setRate("");
        setRoute([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    amountIn,
    tokenIn,
    tokenOut,
    getQuote,
  ]);

  function flip() {
    const old = tokenIn;

    setTokenIn(tokenOut);
    setTokenOut(old);

    setAmountOut("");
    setRate("");
    setRoute([]);
  }

  function select(token: Token) {
    if (selector === "in") {
      setTokenIn(token);
    }

    if (selector === "out") {
      setTokenOut(token);
    }

    setSelector(null);
  }

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-[#050816]
        px-4
        pb-28
        pt-2
        text-white
      "
    >
      {/* BACKGROUND GLOW */}

      <div
        className="
          pointer-events-none
          fixed
          left-1/2
          top-16
          -z-0
          h-64
          w-64
          -translate-x-1/2
          rounded-full
          bg-cyan-500/10
          blur-[90px]
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          bottom-20
          right-0
          -z-0
          h-56
          w-56
          rounded-full
          bg-purple-500/10
          blur-[90px]
        "
      />

      <div className="relative z-10 mx-auto w-full max-w-md">

        {/* PAGE HEADER */}

        <div className="mb-4 flex items-center justify-between">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/10
                  text-cyan-400
                "
              >
                <ArrowDownUp size={18} />
              </div>

              <h1 className="text-2xl font-black tracking-tight">
                Swap
              </h1>

            </div>

            <p className="mt-1 text-sm text-white/40">
              Trade tokens instantly on IOPn Chain
            </p>

          </div>

          {/* SETTINGS */}

          <button
            type="button"
            onClick={() => setSlippageOpen(true)}
            className="
              ml-3
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              text-white/50
              transition
              hover:border-cyan-400/30
              hover:bg-cyan-400/10
              hover:text-cyan-400
            "
          >
            <Settings2 size={18} />
          </button>

        </div>

        {/* NETWORK STATUS */}

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-emerald-400/10
            bg-emerald-400/[0.04]
            px-4
            py-2.5
          "
        >

          <div className="flex items-center gap-2">

            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-emerald-400
              "
            />

            <span className="text-xs font-semibold text-white/60">
              OPN Testnet
            </span>

          </div>

          <span className="text-xs font-medium text-emerald-400">
            Network Online
          </span>

        </div>

        {/* SWAP CARD */}

        <SwapCard
          amountIn={amountIn}
          setAmountIn={setAmountIn}
          amountOut={amountOut}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          onSelectIn={() => setSelector("in")}
          onSelectOut={() => setSelector("out")}
          onFlip={flip}
          balance={balance}
          onSwap={async () => {

            if (!isConnected) {
              return;
            }

            if (needsApproval) {
              approve();
              return;
            }

            const result = await swap(
              amountIn,
              tokenIn,
              tokenOut,
              slippage
            );

            if (result) {
              addTransaction({
                id: result.hash,
                tokenIn: result.tokenIn.symbol,
                tokenOut: result.tokenOut.symbol,
                amountIn: result.amountIn,
                amountOut: result.amountOut,
                hash: result.hash,
                timestamp: Date.now(),
                status: "success",
              });
            }

          }}
          buttonText={
            !isConnected
              ? "Connect Wallet"
              : !amountIn
                ? "Enter Amount"
                : needsApproval
                  ? `Approve ${tokenIn.symbol}`
                  : "Swap"
          }
          loading={isPending || approving}
        />

        {/* SWAP DETAILS */}

        <div
          className="
            mt-3
            rounded-3xl
            border
            border-white/10
            bg-white/[0.04]
            p-4
            backdrop-blur-xl
          "
        >

          <div className="mb-3 flex items-center justify-between">

            <h2 className="font-black">
              Swap Details
            </h2>

            <span className="text-xs text-white/30">
              {slippage}% slippage
            </span>

          </div>

          <div className="space-y-3">

            <div className="flex justify-between gap-4">

              <span className="text-sm text-white/40">
                Rate
              </span>

              <span className="max-w-[65%] text-right text-sm font-semibold">
                {rate || "--"}
              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-sm text-white/40">
                Minimum received
              </span>

              <span className="text-right text-sm font-semibold">
                {amountOut
                  ? `${(
                      Number(amountOut) *
                      (1 - slippage / 100)
                    ).toFixed(6)} ${tokenOut.symbol}`
                  : "--"}
              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-sm text-white/40">
                Route
              </span>

              <span className="max-w-[65%] text-right text-sm font-semibold text-cyan-400">
                {route.length
                  ? route.join(" → ")
                  : "--"}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-sm text-white/40">
                Network
              </span>

              <span className="text-sm font-semibold">
                OPN Testnet
              </span>

            </div>

          </div>

        </div>

        {/* QUICK TOOLS */}

        <div className="mt-3 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              py-3
              text-sm
              font-bold
              text-white/70
              transition
              hover:border-cyan-400/30
              hover:bg-cyan-400/10
              hover:text-cyan-400
            "
          >
            <Zap size={16} />
            Import Token
          </button>

          <button
            type="button"
            onClick={() => setSlippageOpen(true)}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              py-3
              text-sm
              font-bold
              text-white/70
              transition
              hover:border-cyan-400/30
              hover:bg-cyan-400/10
              hover:text-cyan-400
            "
          >
            <Settings2 size={16} />
            Slippage
          </button>

        </div>

        {/* SECURITY NOTE */}

        <div
          className="
            mt-3
            flex
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-white/[0.025]
            p-3.5
          "
        >

          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-cyan-400"
          />

          <p className="text-xs leading-5 text-white/40">
            Always verify token contracts before trading.
            Transactions are executed directly through
            your connected wallet.
          </p>

        </div>

        {/* HISTORY */}

        <SwapHistory />

      </div>

      {/* TOKEN SELECTOR */}

      <TokenSelector
        open={selector !== null}
        tokens={tokens}
        onClose={() => setSelector(null)}
        onSelect={select}
      />

      {/* TOKEN IMPORT */}

      <TokenImport
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(token) => {
          addToken(token);
          setTokenOut(token);
        }}
      />

      {/* SLIPPAGE */}

      <SlippageModal
        open={slippageOpen}
        onClose={() => setSlippageOpen(false)}
        slippage={slippage}
        setSlippage={setSlippage}
      />

    </main>
  );
}