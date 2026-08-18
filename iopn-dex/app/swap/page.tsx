"use client";

import {
  useEffect,
  useState,
  Suspense,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import SwapCard from "@/components/swap/SwapCard";
import TokenSelector from "@/components/swap/TokenSelector";
import TokenImport from "@/components/swap/TokenImport";
import SlippageModal from "@/components/swap/SlippageModal";
import SwapHistory from "@/components/swap/SwapHistory";

import {
  useTokens,
  Token,
} from "@/hooks/useTokens";

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

import { useTheme } from "@/components/ThemeProvider";

import { TOKENS } from "@/lib/tokens";

function formatAmount(
  value: string | number,
  decimals = 2
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function SwapPageContent() {
  const searchParams =
    useSearchParams();

  const { isConnected } =
    useAccount();

  const { darkMode } =
    useTheme();

  const {
    tokens,
    addToken,
  } = useTokens();

  const {
    addTransaction,
  } = useTransactionHistory();

  const [tokenIn, setTokenIn] =
    useState<Token>(
      tokens[0]
    );

  const [tokenOut, setTokenOut] =
    useState<Token>(
      tokens[3] ?? tokens[1]
    );

  const [amountIn, setAmountIn] =
    useState("");

  const [amountOut, setAmountOut] =
    useState("");

  const {
    needsApproval,
    approve,
    isPending: approving,
  } = useApproval(
    tokenIn,
    amountIn
  );

  const [route, setRoute] =
    useState<string[]>([]);

  const [rate, setRate] =
    useState("");

  const [selector, setSelector] =
    useState<
      "in" | "out" | null
    >(null);

  const [importOpen, setImportOpen] =
    useState(false);

  const [slippage, setSlippage] =
    useState(0.5);

  const [slippageOpen, setSlippageOpen] =
    useState(false);

  const {
    getQuote,
    swap,
    isPending,
    swapSuccess,
  } = useSwap();

  const {
    balance,
    refetch: refetchBalance,
  } = useTokenBalance(
    tokenIn
  );

  /*
   * Read selected token/action from URL.
   *
   * Buy:
   * OPN -> selected token
   *
   * Sell:
   * selected token -> OPN
   */

  useEffect(() => {
    const tokenInAddress =
      searchParams.get(
        "tokenIn"
      );

    const tokenOutAddress =
      searchParams.get(
        "tokenOut"
      );

    const action =
      searchParams.get(
        "action"
      );

    if (
      !tokenInAddress &&
      !tokenOutAddress
    ) {
      return;
    }

    const findToken = (
      address: string | null
    ) => {
      if (!address) {
        return undefined;
      }

      return tokens.find(
        (token) =>
          token.address.toLowerCase() ===
          address.toLowerCase()
      );
    };

    let selectedIn =
      findToken(
        tokenInAddress
      );

    let selectedOut =
      findToken(
        tokenOutAddress
      );

    /*
     * Also search the official token list.
     * This makes the selection work even before
     * the local token state has updated.
     */

    if (
      !selectedIn &&
      tokenInAddress
    ) {
      const official =
        TOKENS.find(
          (token) =>
            token.address.toLowerCase() ===
            tokenInAddress.toLowerCase()
        );

      if (official) {
        selectedIn =
          official as unknown as Token;

        addToken(
          official as unknown as Token
        );
      }
    }

    if (
      !selectedOut &&
      tokenOutAddress
    ) {
      const official =
        TOKENS.find(
          (token) =>
            token.address.toLowerCase() ===
            tokenOutAddress.toLowerCase()
        );

      if (official) {
        selectedOut =
          official as unknown as Token;

        addToken(
          official as unknown as Token
        );
      }
    }

    if (selectedIn) {
      setTokenIn(
        selectedIn
      );
    }

    if (selectedOut) {
      setTokenOut(
        selectedOut
      );
    }

    /*
     * Fallback action logic.
     */

    if (
      action === "buy" &&
      selectedOut
    ) {
      setTokenIn(
        tokens[0]
      );

      setTokenOut(
        selectedOut
      );
    }

    if (
      action === "sell" &&
      selectedIn
    ) {
      setTokenIn(
        selectedIn
      );

      setTokenOut(
        tokens[0]
      );
    }
  }, [
    searchParams,
    tokens,
    addToken,
  ]);

  useEffect(() => {
    if (swapSuccess) {
      refetchBalance();
    }
  }, [
    swapSuccess,
    refetchBalance,
  ]);

  /*
   * QUOTE
   */

  useEffect(() => {
    const timer =
      setTimeout(
        async () => {
          if (!amountIn) {
            setAmountOut("");
            setRate("");
            setRoute([]);
            return;
          }

          try {
            const quote =
              await getQuote(
                amountIn,
                tokenIn,
                tokenOut
              );

            const formattedQuote =
              formatAmount(
                quote,
                2
              );

            setAmountOut(
              formattedQuote
            );

            setRate(
              `1 ${tokenIn.symbol} = ${formatAmount(
                quote,
                6
              )} ${tokenOut.symbol}`
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
        },
        500
      );

    return () =>
      clearTimeout(timer);
  }, [
    amountIn,
    tokenIn,
    tokenOut,
    getQuote,
  ]);

  function flip() {
    const old =
      tokenIn;

    setTokenIn(
      tokenOut
    );

    setTokenOut(
      old
    );

    setAmountOut("");
    setRate("");
    setRoute([]);
  }

  function select(
    token: Token
  ) {
    if (
      selector === "in"
    ) {
      setTokenIn(
        token
      );
    }

    if (
      selector === "out"
    ) {
      setTokenOut(
        token
      );
    }

    setSelector(null);
  }

  return (
    <main
      className={`
        relative
        min-h-screen
        overflow-x-hidden
        px-4
        pb-28
        pt-1
        transition-colors
        duration-300
        ${
          darkMode
            ? "bg-[#050816] text-white"
            : "bg-slate-50 text-slate-900"
        }
      `}
    >
      {/* BACKGROUND GLOW */}

      <div
        className={`
          pointer-events-none
          fixed
          left-1/2
          top-14
          -z-0
          h-56
          w-56
          -translate-x-1/2
          rounded-full
          blur-[90px]
          ${
            darkMode
              ? "bg-cyan-500/10"
              : "bg-cyan-400/10"
          }
        `}
      />

      <div
        className={`
          pointer-events-none
          fixed
          bottom-20
          right-0
          -z-0
          h-48
          w-48
          rounded-full
          blur-[90px]
          ${
            darkMode
              ? "bg-purple-500/10"
              : "bg-purple-400/10"
          }
        `}
      />

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-md
        "
      >
        {/* HEADER */}

        <div
          className="
            mb-3
            flex
            items-center
            justify-between
          "
        >
          <div className="min-w-0">
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/10
                  text-cyan-400
                "
              >
                <ArrowDownUp
                  size={17}
                />
              </div>

              <h1
                className="
                  text-xl
                  font-black
                  tracking-tight
                "
              >
                Swap
              </h1>
            </div>

            <p
              className={`
                mt-0.5
                text-xs
                ${
                  darkMode
                    ? "text-white/40"
                    : "text-slate-500"
                }
              `}
            >
              {searchParams.get(
                "action"
              ) === "buy"
                ? `Buy ${tokenOut.symbol}`
                : searchParams.get(
                    "action"
                  ) === "sell"
                ? `Sell ${tokenIn.symbol}`
                : "Trade tokens instantly on IOPn Chain"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSlippageOpen(
                true
              )
            }
            className={`
              ml-3
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              transition
              ${
                darkMode
                  ? "border-white/10 bg-white/[0.04] text-white/50 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-400"
                  : "border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-500"
              }
            `}
          >
            <Settings2
              size={17}
            />
          </button>
        </div>

        {/* NETWORK STATUS */}

        <div
          className={`
            mb-3
            flex
            items-center
            justify-between
            rounded-xl
            border
            px-3
            py-2
            ${
              darkMode
                ? "border-emerald-400/10 bg-emerald-400/[0.04]"
                : "border-emerald-200 bg-emerald-50"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <span
              className="
                h-1.5
                w-1.5
                animate-pulse
                rounded-full
                bg-emerald-400
              "
            />

            <span
              className={`
                text-[11px]
                font-semibold
                ${
                  darkMode
                    ? "text-white/60"
                    : "text-slate-600"
                }
              `}
            >
              OPN Testnet
            </span>
          </div>

          <span className="text-[11px] font-medium text-emerald-400">
            Network Online
          </span>
        </div>

        {/* SWAP CARD */}

        <SwapCard
          amountIn={amountIn}
          setAmountIn={
            setAmountIn
          }
          amountOut={
            amountOut
          }
          tokenIn={
            tokenIn
          }
          tokenOut={
            tokenOut
          }
          onSelectIn={() =>
            setSelector("in")
          }
          onSelectOut={() =>
            setSelector("out")
          }
          onFlip={
            flip
          }
          balance={formatAmount(
            balance,
            2
          )}
          onSwap={async () => {
            if (!isConnected) {
              return;
            }

            if (needsApproval) {
              approve();
              return;
            }

            const result =
              await swap(
                amountIn,
                tokenIn,
                tokenOut,
                slippage
              );

            if (result) {
              addTransaction({
                id: result.hash,
                tokenIn:
                  result.tokenIn
                    .symbol,
                tokenOut:
                  result.tokenOut
                    .symbol,
                amountIn:
                  result.amountIn,
                amountOut:
                  result.amountOut,
                hash: result.hash,
                timestamp:
                  Date.now(),
                status:
                  "success",
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
          loading={
            isPending ||
            approving
          }
        />

        {/* SWAP DETAILS */}

        <div
          className={`
            mt-2.5
            rounded-2xl
            border
            p-3.5
            backdrop-blur-xl
            ${
              darkMode
                ? "border-white/10 bg-white/[0.04]"
                : "border-slate-200 bg-white shadow-sm"
            }
          `}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-black">
              Swap Details
            </h2>

            <span
              className={`
                text-[11px]
                ${
                  darkMode
                    ? "text-white/30"
                    : "text-slate-400"
                }
              `}
            >
              {slippage}% slippage
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <span
                className={`
                  text-xs
                  ${
                    darkMode
                      ? "text-white/40"
                      : "text-slate-500"
                  }
                `}
              >
                Rate
              </span>

              <span className="max-w-[65%] truncate text-right text-xs font-semibold">
                {rate || "--"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span
                className={`
                  text-xs
                  ${
                    darkMode
                      ? "text-white/40"
                      : "text-slate-500"
                  }
                `}
              >
                Minimum received
              </span>

              <span className="max-w-[65%] truncate text-right text-xs font-semibold">
                {amountOut
                  ? `${(
                      Number(
                        amountOut
                      ) *
                      (1 -
                        slippage /
                          100)
                    ).toFixed(
                      6
                    )} ${
                      tokenOut.symbol
                    }`
                  : "--"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span
                className={`
                  text-xs
                  ${
                    darkMode
                      ? "text-white/40"
                      : "text-slate-500"
                  }
                `}
              >
                Route
              </span>

              <span className="max-w-[65%] truncate text-right text-xs font-semibold text-cyan-400">
                {route.length
                  ? route.join(
                      " → "
                    )
                  : "--"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`
                  text-xs
                  ${
                    darkMode
                      ? "text-white/40"
                      : "text-slate-500"
                  }
                `}
              >
                Network
              </span>

              <span className="text-xs font-semibold">
                OPN Testnet
              </span>
            </div>
          </div>
        </div>

        {/* QUICK TOOLS */}

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() =>
              setImportOpen(
                true
              )
            }
            className={`
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              py-2.5
              text-xs
              font-bold
              transition
              ${
                darkMode
                  ? "border-white/10 bg-white/[0.04] text-white/70 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-400"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-500"
              }
            `}
          >
            <Zap size={15} />
            Import Token
          </button>

          <button
            type="button"
            onClick={() =>
              setSlippageOpen(
                true
              )
            }
            className={`
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              py-2.5
              text-xs
              font-bold
              transition
              ${
                darkMode
                  ? "border-white/10 bg-white/[0.04] text-white/70 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-400"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-500"
              }
            `}
          >
            <Settings2 size={15} />
            Slippage
          </button>
        </div>

        {/* SECURITY */}

        <div
          className={`
            mt-2.5
            flex
            gap-2.5
            rounded-xl
            border
            p-3
            ${
              darkMode
                ? "border-white/10 bg-white/[0.025]"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-cyan-400"
          />

          <p
            className={`
              text-[11px]
              leading-4
              ${
                darkMode
                  ? "text-white/40"
                  : "text-slate-500"
              }
            `}
          >
            Always verify token contracts
            before trading. Transactions
            are executed directly through
            your connected wallet.
          </p>
        </div>

        {/* HISTORY */}

        <div className="mt-2.5">
          <SwapHistory />
        </div>
      </div>

      {/* TOKEN SELECTOR */}

      <TokenSelector
        open={
          selector !== null
        }
        tokens={tokens}
        onClose={() =>
          setSelector(null)
        }
        onSelect={
          select
        }
      />

      {/* IMPORT */}

      <TokenImport
        open={importOpen}
        onClose={() =>
          setImportOpen(
            false
          )
        }
        onImport={(token) => {
          addToken(token);
          setTokenOut(token);
        }}
      />

      {/* SLIPPAGE */}

      <SlippageModal
        open={slippageOpen}
        onClose={() =>
          setSlippageOpen(
            false
          )
        }
        slippage={
          slippage
        }
        setSlippage={
          setSlippage
        }
      />
    </main>
  );
}

export default function SwapPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050816]" />
      }
    >
      <SwapPageContent />
    </Suspense>
  );
}