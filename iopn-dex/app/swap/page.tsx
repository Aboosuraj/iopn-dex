"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import SwapCard from "@/components/swap/SwapCard";
import TokenSelector from "@/components/swap/TokenSelector";
import TokenImport from "@/components/swap/TokenImport";
import SlippageModal from "@/components/swap/SlippageModal";
import SwapHistory from "@/components/swap/SwapHistory";

import {
  Token,
  useTokens,
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
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";

import { TOKENS } from "@/lib/tokens";


/* =========================================================
   HELPERS
========================================================= */

function formatAmount(
  value: string | number,
  decimals = 6
) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "0";
  }

  return number.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }
  );
}


function sameToken(
  a?: Token,
  b?: Token
) {

  if (!a || !b) {
    return false;
  }

  return (
    a.address?.toLowerCase() ===
      b.address?.toLowerCase() &&
    a.symbol.toLowerCase() ===
      b.symbol.toLowerCase()
  );
}


function isNativeOPN(
  token?: Token
) {

  if (!token) {
    return false;
  }

  return (
    token.native === true ||
    token.symbol.toUpperCase() ===
      "OPN"
  );
}


function findTokenByAddress(
  tokens: Token[],
  address: string | null
) {

  if (!address) {
    return undefined;
  }

  return tokens.find(
    (token) =>
      token.address?.toLowerCase() ===
      address.toLowerCase()
  );
}


function findSafeDifferentToken(
  tokens: Token[],
  other?: Token
) {

  return (
    tokens.find(
      (token) =>
        !sameToken(
          token,
          other
        )
    ) ??
    tokens.find(
      (token) =>
        token.symbol.toUpperCase() !==
        "OPN"
    ) ??
    tokens[0]
  );
}


/* =========================================================
   PAGE
========================================================= */

function SwapPageContent() {

  const searchParams =
    useSearchParams();

  const {
    isConnected,
  } = useAccount();

  const {
    darkMode,
  } = useTheme();

  const {
    tokens,
    addToken,
  } = useTokens();


  const {
    addTransaction,
  } = useTransactionHistory();


  const defaultIn =
    tokens[0] ??
    TOKENS[0];


  const defaultOut =
    tokens.find(
      (token) =>
        !sameToken(
          token,
          defaultIn
        )
    ) ??
    tokens[1] ??
    TOKENS[1] ??
    TOKENS[0];


  const [
    tokenIn,
    setTokenIn,
  ] =
    useState<Token>(
      defaultIn
    );


  const [
    tokenOut,
    setTokenOut,
  ] =
    useState<Token>(
      defaultOut
    );


  const [
    amountIn,
    setAmountIn,
  ] =
    useState("");


  const [
    amountOut,
    setAmountOut,
  ] =
    useState("");


  const {
    needsApproval,
    approve,
    isPending:
      approving,
  } =
    useApproval(
      tokenIn,
      amountIn
    );


  const [
    route,
    setRoute,
  ] =
    useState<string[]>([]);


  const [
    rate,
    setRate,
  ] =
    useState("");


  const [
    selector,
    setSelector,
  ] =
    useState<
      "in" | "out" | null
    >(null);


  const [
    importOpen,
    setImportOpen,
  ] =
    useState(false);


  const [
    slippage,
    setSlippage,
  ] =
    useState(0.5);


  const [
    slippageOpen,
    setSlippageOpen,
  ] =
    useState(false);


  const [
    sameTokenError,
    setSameTokenError,
  ] =
    useState(false);


  const [
    quoteLoading,
    setQuoteLoading,
  ] =
    useState(false);


  const {
    getQuote,
    swap,
    isPending,
    swapSuccess,
  } =
    useSwap();


  const {
    balance,
    refetch:
      refetchBalance,
  } =
    useTokenBalance(
      tokenIn
    );


  /* =========================================================
     TOKEN LIST
  ========================================================= */

  const availableTokens =
    useMemo(() => {

      const map =
        new Map<
          string,
          Token
        >();


      for (
        const token of TOKENS
      ) {

        map.set(
          token.address.toLowerCase(),
          token as unknown as Token
        );

      }


      for (
        const token of tokens
      ) {

        map.set(
          token.address.toLowerCase(),
          token
        );

      }


      return Array.from(
        map.values()
      );

    }, [
      tokens,
    ]);


  /* =========================================================
     URL TOKEN SELECTION
  ========================================================= */

  useEffect(() => {

    if (
      !availableTokens.length
    ) {
      return;
    }


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
      action === "buy" &&
      tokenOutAddress
    ) {

      const selectedOut =
        findTokenByAddress(
          availableTokens,
          tokenOutAddress
        );


      if (selectedOut) {

        if (
          isNativeOPN(
            selectedOut
          )
        ) {

          const safeOut =
            findSafeDifferentToken(
              availableTokens,
              availableTokens[0]
            );


          if (safeOut) {

            setTokenIn(
              availableTokens[0]
            );

            setTokenOut(
              safeOut
            );

          }

          setSameTokenError(
            true
          );

          return;
        }


        const native =
          availableTokens.find(
            (token) =>
              isNativeOPN(token)
          );


        if (native) {

          setTokenIn(
            native
          );

          setTokenOut(
            selectedOut
          );

          setSameTokenError(
            false
          );

        }

        return;
      }
    }


    if (
      action === "sell" &&
      tokenInAddress
    ) {

      const selectedIn =
        findTokenByAddress(
          availableTokens,
          tokenInAddress
        );


      if (selectedIn) {

        if (
          isNativeOPN(
            selectedIn
          )
        ) {

          const safeIn =
            findSafeDifferentToken(
              availableTokens,
              availableTokens[0]
            );


          const native =
            availableTokens.find(
              (token) =>
                isNativeOPN(token)
            );


          if (
            safeIn &&
            native
          ) {

            setTokenIn(
              safeIn
            );

            setTokenOut(
              native
            );

          }

          setSameTokenError(
            true
          );

          return;
        }


        const native =
          availableTokens.find(
            (token) =>
              isNativeOPN(token)
          );


        if (native) {

          setTokenIn(
            selectedIn
          );

          setTokenOut(
            native
          );

          setSameTokenError(
            false
          );

        }

        return;
      }
    }


    if (
      tokenInAddress ||
      tokenOutAddress
    ) {

      const selectedIn =
        findTokenByAddress(
          availableTokens,
          tokenInAddress
        );


      const selectedOut =
        findTokenByAddress(
          availableTokens,
          tokenOutAddress
        );


      if (
        selectedIn &&
        selectedOut &&
        sameToken(
          selectedIn,
          selectedOut
        )
      ) {

        const safeOut =
          findSafeDifferentToken(
            availableTokens,
            selectedIn
          );


        setTokenIn(
          selectedIn
        );


        if (safeOut) {

          setTokenOut(
            safeOut
          );

        }


        setSameTokenError(
          true
        );

        return;
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


      setSameTokenError(
        false
      );
    }

  }, [
    searchParams,
    availableTokens,
  ]);


  /* =========================================================
     SAFETY CHECK
  ========================================================= */

  useEffect(() => {

    if (
      !tokenIn ||
      !tokenOut
    ) {
      return;
    }


    if (
      sameToken(
        tokenIn,
        tokenOut
      )
    ) {

      const safeOut =
        findSafeDifferentToken(
          availableTokens,
          tokenIn
        );


      if (safeOut) {

        setTokenOut(
          safeOut
        );

      }


      setSameTokenError(
        true
      );

      setAmountOut("");
      setRate("");
      setRoute([]);

      return;
    }


    setSameTokenError(
      false
    );

  }, [
    tokenIn,
    tokenOut,
    availableTokens,
  ]);


  /* =========================================================
     REFRESH BALANCE AFTER SWAP
  ========================================================= */

  useEffect(() => {

    if (
      swapSuccess
    ) {

      refetchBalance();

      setAmountIn("");
      setAmountOut("");
      setRate("");
      setRoute([]);

    }

  }, [
    swapSuccess,
    refetchBalance,
  ]);


  /* =========================================================
     QUOTE
     
     IMPORTANT FIX:
     getQuote is now stable because
     useSwap uses useCallback.
     
     Therefore this effect only runs when:
     
     - amount changes
     - input token changes
     - output token changes
     
     It will NOT run again simply
     because the page re-rendered.
  ========================================================= */

  useEffect(() => {

    let cancelled = false;


    const timer =
      setTimeout(
        async () => {

          if (
            !amountIn ||
            Number(amountIn) <= 0
          ) {

            setAmountOut("");
            setRate("");
            setRoute([]);
            setQuoteLoading(false);

            return;
          }


          if (
            sameToken(
              tokenIn,
              tokenOut
            )
          ) {

            setAmountOut("");
            setRate("");
            setRoute([]);
            setQuoteLoading(false);
            setSameTokenError(true);

            return;
          }


          try {

            setQuoteLoading(true);

            setSameTokenError(false);


            const quote =
              await getQuote(
                amountIn,
                tokenIn,
                tokenOut
              );


            if (
              cancelled
            ) {
              return;
            }


            const numericQuote =
              Number(quote);


            if (
              !Number.isFinite(
                numericQuote
              ) ||
              numericQuote <= 0
            ) {

              setAmountOut("");
              setRate("");
              setRoute([]);

              return;
            }


            const formattedQuote =
              formatAmount(
                numericQuote,
                tokenOut.decimals > 6
                  ? 6
                  : tokenOut.decimals
              );


            setAmountOut(
              formattedQuote
            );


            const amount =
              Number(amountIn);


            const rateValue =
              amount > 0
                ? numericQuote /
                  amount
                : 0;


            setRate(
              `1 ${tokenIn.symbol} = ${formatAmount(
                rateValue,
                8
              )} ${tokenOut.symbol}`
            );


            setRoute([
              tokenIn.symbol,
              tokenOut.symbol,
            ]);

          }

          catch {

            if (
              cancelled
            ) {
              return;
            }


            setAmountOut("");
            setRate("");
            setRoute([]);

          }

          finally {

            if (
              !cancelled
            ) {

              setQuoteLoading(
                false
              );

            }

          }

        },
        450
      );


    return () =>
      clearTimeout(
        timer
      );

  }, [
    amountIn,
    tokenIn,
    tokenOut,
    getQuote,
  ]);


  /* =========================================================
     FLIP
  ========================================================= */

  function flip() {

    if (
      sameToken(
        tokenIn,
        tokenOut
      )
    ) {
      return;
    }


    const oldIn =
      tokenIn;

    const oldOut =
      tokenOut;


    setTokenIn(
      oldOut
    );

    setTokenOut(
      oldIn
    );


    setAmountIn("");
    setAmountOut("");
    setRate("");
    setRoute([]);
    setSameTokenError(false);

  }


  /* =========================================================
     SELECT TOKEN
  ========================================================= */

  function select(
    token: Token
  ) {

    if (!token) {
      return;
    }


    if (
      selector === "in" &&
      sameToken(
        token,
        tokenOut
      )
    ) {

      setSameTokenError(
        true
      );

      setSelector(null);

      return;
    }


    if (
      selector === "out" &&
      sameToken(
        token,
        tokenIn
      )
    ) {

      setSameTokenError(
        true
      );

      setSelector(null);

      return;
    }


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


    setAmountOut("");
    setRate("");
    setRoute([]);
    setSameTokenError(false);
    setSelector(null);

  }


  /* =========================================================
     SWAP
  ========================================================= */

  async function handleSwap() {

    if (!isConnected) {
      return;
    }


    if (
      sameToken(
        tokenIn,
        tokenOut
      )
    ) {

      setSameTokenError(
        true
      );

      return;
    }


    if (
      !amountIn ||
      Number(amountIn) <= 0
    ) {

      return;
    }


    if (
      needsApproval
    ) {

      await approve();

      return;
    }


    try {

      const result =
        await swap(
          amountIn,
          tokenIn,
          tokenOut,
          slippage
        );


      if (result) {

        addTransaction({

          id:
            result.hash,

          tokenIn:
            result.tokenIn.symbol,

          tokenOut:
            result.tokenOut.symbol,

          amountIn:
            result.amountIn,

          amountOut:
            result.amountOut,

          hash:
            result.hash,

          timestamp:
            Date.now(),

          status:
            "success",

        });

      }

    }
    catch {
      /*
       * useSwap handles
       * transaction errors.
       */
    }

  }


  /* =========================================================
     BUTTON TEXT
  ========================================================= */

  const buttonText =
    !isConnected
      ? "Connect Wallet"
      : sameToken(
          tokenIn,
          tokenOut
        )
      ? "Select Different Tokens"
      : !amountIn
      ? "Enter Amount"
      : quoteLoading
      ? "Getting Quote..."
      : needsApproval
      ? `Approve ${tokenIn.symbol}`
      : !amountOut
      ? "No Route Available"
      : "Swap";


  const minimumReceived =
    amountOut
      ? (
          Number(amountOut) *
          (
            1 -
            slippage / 100
          )
        ).toFixed(
          tokenOut.decimals > 6
            ? 6
            : tokenOut.decimals
        )
      : "";


  /* =========================================================
     UI
  ========================================================= */

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
              setSlippageOpen(true)
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

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

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


          <span
            className="
              text-[11px]
              font-medium
              text-emerald-400
            "
          >
            Network Online
          </span>

        </div>


        {/* SAME TOKEN WARNING */}

        {sameTokenError && (
          <div
            className={`
              mb-3
              flex
              items-start
              gap-2.5
              rounded-2xl
              border
              p-3
              ${
                darkMode
                  ? "border-amber-400/20 bg-amber-400/[0.06]"
                  : "border-amber-200 bg-amber-50"
              }
            `}
          >

            <AlertTriangle
              size={17}
              className="
                mt-0.5
                shrink-0
                text-amber-400
              "
            />

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  text-amber-400
                "
              >
                Select two different tokens
              </p>

              <p
                className={`
                  mt-0.5
                  text-[10px]
                  ${
                    darkMode
                      ? "text-white/40"
                      : "text-slate-500"
                  }
                `}
              >
                Swapping a token to itself is
                not supported.
              </p>

            </div>

          </div>
        )}


        {/* SWAP CARD */}

        <SwapCard
          amountIn={
            amountIn
          }
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
            6
          )}
          onSwap={
            handleSwap
          }
          buttonText={
            buttonText
          }
          loading={
            isPending ||
            approving ||
            quoteLoading
          }
        />


        {/* QUOTE STATUS */}

        {amountIn &&
          !sameToken(
            tokenIn,
            tokenOut
          ) && (

          <div
            className={`
              mt-2
              flex
              items-center
              justify-center
              gap-1.5
              text-[10px]
              ${
                quoteLoading
                  ? "text-cyan-400"
                  : amountOut
                  ? "text-emerald-400"
                  : darkMode
                  ? "text-white/30"
                  : "text-slate-400"
              }
            `}
          >

            {quoteLoading ? (
              <>

                <span
                  className="
                    h-1.5
                    w-1.5
                    animate-pulse
                    rounded-full
                    bg-cyan-400
                  "
                />

                Finding best route...

              </>
            ) : amountOut ? (

              <>

                <CheckCircle2
                  size={12}
                />

                Quote available

              </>

            ) : (

              "No route available"

            )}

          </div>

        )}


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

          <div
            className="
              mb-2.5
              flex
              items-center
              justify-between
            "
          >

            <h2
              className="
                text-sm
                font-black
              "
            >
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

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

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


              <span
                className="
                  max-w-[65%]
                  truncate
                  text-right
                  text-xs
                  font-semibold
                "
              >
                {rate || "--"}
              </span>

            </div>


            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

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


              <span
                className="
                  max-w-[65%]
                  truncate
                  text-right
                  text-xs
                  font-semibold
                "
              >
                {minimumReceived
                  ? `${minimumReceived} ${tokenOut.symbol}`
                  : "--"}
              </span>

            </div>


            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

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


              <span
                className="
                  max-w-[65%]
                  truncate
                  text-right
                  text-xs
                  font-semibold
                  text-cyan-400
                "
              >
                {route.length
                  ? route.join(" → ")
                  : "--"}
              </span>

            </div>


            <div
              className="
                flex
                items-center
                justify-between
              "
            >

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


              <span
                className="
                  text-xs
                  font-semibold
                "
              >
                OPN Testnet
              </span>

            </div>

          </div>

        </div>


        {/* QUICK TOOLS */}

        <div
          className="
            mt-2.5
            grid
            grid-cols-2
            gap-2.5
          "
        >

          <button
            type="button"
            onClick={() =>
              setImportOpen(true)
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

            <Zap
              size={15}
            />

            Import Token

          </button>


          <button
            type="button"
            onClick={() =>
              setSlippageOpen(true)
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

            <Settings2
              size={15}
            />

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
            className="
              mt-0.5
              shrink-0
              text-cyan-400
            "
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

        <div
          className="
            mt-2.5
          "
        >
          <SwapHistory />
        </div>

      </div>


      {/* TOKEN SELECTOR */}

      <TokenSelector
        open={
          selector !== null
        }
        tokens={
          availableTokens
        }
        onClose={() =>
          setSelector(null)
        }
        onSelect={
          select
        }
      />


      {/* IMPORT */}

      <TokenImport
        open={
          importOpen
        }
        onClose={() =>
          setImportOpen(false)
        }
        onImport={(token) => {

          addToken(token);


          if (
            !sameToken(
              token,
              tokenIn
            )
          ) {

            setTokenOut(
              token
            );

          }

          else {

            setTokenIn(
              findSafeDifferentToken(
                availableTokens,
                token
              ) ?? token
            );

            setTokenOut(
              token
            );

          }


          setAmountOut("");
          setRate("");
          setRoute([]);
          setSameTokenError(false);
          setImportOpen(false);

        }}
      />


      {/* SLIPPAGE */}

      <SlippageModal
        open={
          slippageOpen
        }
        onClose={() =>
          setSlippageOpen(false)
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


/* =========================================================
   EXPORT
========================================================= */

export default function SwapPage() {

  return (
    <Suspense
      fallback={
        <main
          className="
            min-h-screen
            bg-[#050816]
          "
        />
      }
    >

      <SwapPageContent />

    </Suspense>
  );
}0