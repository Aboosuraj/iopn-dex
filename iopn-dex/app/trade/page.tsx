"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  CandlestickChart,
  ExternalLink,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Suspense, useMemo } from "react";

import { TOKENS } from "@/lib/tokens";
import { getImportedTokens } from "@/lib/importedTokens";

type ListedToken = (typeof TOKENS)[number];

type ImportedToken = {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
  native: false;
  imported?: boolean;
  name?: string;
  logo?: string;
  price?: number;
  change24h?: number;
  verified?: boolean;
};

type TradeToken = {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
  native: boolean;
  name: string;
  logo?: string;
  price: number;
  change24h: number;
  verified: boolean;
  imported: boolean;
};

function formatPrice(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "--";
  }

  if (value >= 1000) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  }

  if (value >= 1) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 4,
    });
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 8,
  });
}

function formatChange(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function TokenIcon({
  symbol,
}: {
  symbol: string;
}) {
  return (
    <div
      className="
        flex
        h-12
        w-12
        shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        border-cyan-400/20
        bg-gradient-to-br
        from-cyan-400/15
        to-purple-500/15
        text-lg
        font-black
        text-cyan-300
        shadow-[0_0_25px_rgba(34,211,238,0.08)]
      "
    >
      {symbol.slice(0, 1).toUpperCase()}
    </div>
  );
}

function buildCandles(
  price: number,
  change24h: number
) {
  const safePrice =
    Number.isFinite(price) && price > 0
      ? price
      : 1;

  const direction =
    change24h >= 0 ? 1 : -1;

  const volatility =
    Math.max(
      Math.abs(change24h) / 100,
      0.015
    );

  const candles = [];

  for (let i = 0; i < 28; i++) {
    const progress = i / 27;

    const wave =
      Math.sin(i * 1.37) *
        volatility *
        0.7 +
      Math.cos(i * 0.61) *
        volatility *
        0.35;

    const trend =
      direction *
      volatility *
      (progress - 0.5);

    const close =
      safePrice *
      (1 + wave + trend);

    const open =
      safePrice *
      (
        1 +
        Math.sin((i - 1) * 1.37) *
          volatility *
          0.7 +
        direction *
          volatility *
          (Math.max(
            progress - 0.04,
            0
          ) - 0.5)
      );

    const high =
      Math.max(open, close) *
      (1 + volatility * 0.22);

    const low =
      Math.min(open, close) *
      (1 - volatility * 0.22);

    candles.push({
      open,
      close,
      high,
      low,
    });
  }

  return candles;
}

function CandleChart({
  price,
  change24h,
}: {
  price: number;
  change24h: number;
}) {
  const candles = useMemo(
    () =>
      buildCandles(
        price,
        change24h
      ),
    [price, change24h]
  );

  const values =
    candles.flatMap(
      (candle) => [
        candle.high,
        candle.low,
      ]
    );

  const min =
    Math.min(...values) || 0;

  const max =
    Math.max(...values) || 1;

  const range =
    max - min || 1;

  const chartHeight = 230;

  function y(value: number) {
    return (
      18 +
      ((max - value) / range) *
        (chartHeight - 36)
    );
  }

  const candleWidth = 7;
  const gap = 5;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080d1c]">
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-40
        "
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize:
            "100% 46px, 55px 100%",
        }}
      />

      <svg
        viewBox={`0 0 ${
          candles.length *
          (candleWidth + gap)
        } ${chartHeight}`}
        className="
          relative
          h-[230px]
          w-full
        "
        preserveAspectRatio="none"
      >
        {candles.map(
          (candle, index) => {
            const x =
              index *
                (candleWidth +
                  gap) +
              gap;

            const openY =
              y(candle.open);

            const closeY =
              y(candle.close);

            const highY =
              y(candle.high);

            const lowY =
              y(candle.low);

            const bullish =
              candle.close >=
              candle.open;

            const bodyTop =
              Math.min(
                openY,
                closeY
              );

            const bodyHeight =
              Math.max(
                Math.abs(
                  closeY -
                    openY
                ),
                2
              );

            return (
              <g key={index}>
                <line
                  x1={
                    x +
                    candleWidth /
                      2
                  }
                  x2={
                    x +
                    candleWidth /
                      2
                  }
                  y1={highY}
                  y2={lowY}
                  stroke={
                    bullish
                      ? "#22d3ee"
                      : "#a78bfa"
                  }
                  strokeWidth="1.2"
                />

                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  rx="1.5"
                  fill={
                    bullish
                      ? "#22d3ee"
                      : "#a78bfa"
                  }
                  opacity="0.9"
                />
              </g>
            );
          }
        )}
      </svg>

      <div className="pointer-events-none absolute right-2 top-3 space-y-8">
        <span className="block rounded bg-white/[0.05] px-1.5 py-1 text-[9px] font-semibold text-white/35">
          {formatPrice(max)}
        </span>

        <span className="block rounded bg-white/[0.05] px-1.5 py-1 text-[9px] font-semibold text-white/35">
          {formatPrice(
            (max + min) / 2
          )}
        </span>

        <span className="block rounded bg-white/[0.05] px-1.5 py-1 text-[9px] font-semibold text-white/35">
          {formatPrice(min)}
        </span>
      </div>

      <div
        className="
          absolute
          bottom-2
          left-3
          right-3
          flex
          justify-between
          text-[9px]
          font-medium
          text-white/25
        "
      >
        <span>24H AGO</span>
        <span>12H</span>
        <span>NOW</span>
      </div>
    </div>
  );
}

function TradeContent() {
  const searchParams =
    useSearchParams();

  const tokenAddress =
    searchParams.get("token");

  /*
   * Build a safe token list containing both:
   *
   * 1. Normal tokens from TOKENS
   * 2. Imported tokens from localStorage
   *
   * We DO NOT cast ImportedToken to TOKENS.
   * Instead, both are normalized into TradeToken.
   */
  const allTokens =
    useMemo<TradeToken[]>(() => {
      const importedTokens =
        getImportedTokens();

      const map =
        new Map<
          string,
          TradeToken
        >();

      /*
       * Normal listed tokens
       */
      for (
        const token of TOKENS
      ) {
        map.set(
          token.address.toLowerCase(),
          {
            symbol:
              token.symbol,
            address:
              token.address,
            decimals:
              token.decimals,
            native:
              Boolean(
                token.native
              ),
            name:
              token.name ??
              token.symbol,
            logo:
              token.logo,
            price:
              typeof token.price ===
              "number"
                ? token.price
                : 0,
            change24h:
              typeof token.change24h ===
              "number"
                ? token.change24h
                : 0,
            verified:
              Boolean(
                token.verified
              ),
            imported: false,
          }
        );
      }

      /*
       * Imported tokens
       *
       * Imported tokens may not contain:
       * name
       * logo
       * price
       * change24h
       * verified
       *
       * So we provide safe defaults.
       */
      for (
        const token of importedTokens as ImportedToken[]
      ) {
        map.set(
          token.address.toLowerCase(),
          {
            symbol:
              token.symbol,
            address:
              token.address,
            decimals:
              Number(
                token.decimals
              ),
            native: false,
            name:
              token.name ??
              token.symbol,
            logo:
              token.logo,
            price:
              typeof token.price ===
              "number"
                ? token.price
                : 0,
            change24h:
              typeof token.change24h ===
              "number"
                ? token.change24h
                : 0,
            verified:
              Boolean(
                token.verified
              ),
            imported: true,
          }
        );
      }

      return Array.from(
        map.values()
      );
    }, []);

  /*
   * Find the token selected from:
   *
   * /trade?token=CONTRACT_ADDRESS
   *
   * This works for both listed and imported tokens.
   */
  const token =
    useMemo<TradeToken>(() => {
      if (!tokenAddress) {
        const first =
          allTokens[0];

        return (
          first ?? {
            symbol: "OPN",
            address:
              "0x0000000000000000000000000000000000000000",
            decimals: 18,
            native: true,
            name: "OPN",
            price: 1,
            change24h: 0,
            verified: true,
            imported: false,
          }
        );
      }

      const normalized =
        tokenAddress.toLowerCase();

      const found =
        allTokens.find(
          (item) =>
            item.address.toLowerCase() ===
            normalized
        );

      if (found) {
        return found;
      }

      /*
       * Unknown address:
       * safely fall back to OPN.
       */
      const nativeToken =
        allTokens.find(
          (item) =>
            item.native
        );

      return (
        nativeToken ??
        allTokens[0]
      );
    }, [
      tokenAddress,
      allTokens,
    ]);

  /*
   * Find the actual native OPN token.
   *
   * This is safer than blindly using TOKENS[0].
   */
  const nativeToken =
    useMemo<TradeToken>(() => {
      const native =
        allTokens.find(
          (item) =>
            item.native
        );

      if (native) {
        return native;
      }

      return {
        symbol: "OPN",
        address:
          TOKENS[0]
            ?.address ??
          ("0x0000000000000000000000000000000000000000" as `0x${string}`),
        decimals:
          TOKENS[0]
            ?.decimals ?? 18,
        native: true,
        name:
          TOKENS[0]
            ?.name ?? "OPN",
        logo:
          TOKENS[0]?.logo,
        price: 1,
        change24h: 0,
        verified: true,
        imported: false,
      };
    }, [allTokens]);

  const isPositive =
    token.change24h >= 0;

  /*
   * BUY
   *
   * OPN -> selected token
   *
   * IMPORTANT:
   * token.address is preserved here.
   * Therefore an imported token gets its
   * imported contract address.
   */
  const buyUrl =
    `/swap?tokenIn=${encodeURIComponent(
      nativeToken.address
    )}&tokenOut=${encodeURIComponent(
      token.address
    )}&action=buy`;

  /*
   * SELL
   *
   * selected token -> OPN
   *
   * IMPORTANT:
   * For an imported token, token.address
   * remains the imported token contract.
   */
  const sellUrl =
    `/swap?tokenIn=${encodeURIComponent(
      token.address
    )}&tokenOut=${encodeURIComponent(
      nativeToken.address
    )}&action=sell`;

  return (
    <main
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#050816]
        pb-28
        text-white
      "
    >
      {/* BACKGROUND */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          -z-10
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            left-1/2
            top-[-100px]
            h-80
            w-80
            -translate-x-1/2
            rounded-full
            bg-cyan-500/10
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-[-100px]
            h-72
            w-72
            rounded-full
            bg-purple-500/10
            blur-[120px]
          "
        />
      </div>

      <div
        className="
          mx-auto
          w-full
          max-w-2xl
          px-4
          pt-4
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <Link
            href="/markets"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              text-white/60
              transition
              hover:border-cyan-400/30
              hover:text-cyan-400
            "
          >
            <ArrowLeft
              size={18}
            />
          </Link>

          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
              IOPn Market
            </p>

            <h1 className="mt-0.5 text-lg font-black">
              Trade
            </h1>
          </div>

          <Link
            href="/swap"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              text-white/60
              transition
              hover:border-cyan-400/30
              hover:text-cyan-400
            "
          >
            <ExternalLink
              size={17}
            />
          </Link>
        </div>

        {/* TOKEN HEADER */}

        <section
          className="
            mt-5
            rounded-3xl
            border
            border-white/10
            bg-white/[0.035]
            p-4
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div className="flex items-center gap-3">
              <TokenIcon
                symbol={
                  token.symbol
                }
              />

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black">
                    {token.symbol}
                  </h2>

                  {token.verified && (
                    <span
                      className="
                        rounded-md
                        bg-cyan-400/10
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-black
                        text-cyan-400
                      "
                    >
                      VERIFIED
                    </span>
                  )}

                  {token.imported && (
                    <span
                      className="
                        rounded-md
                        bg-purple-400/10
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-black
                        text-purple-300
                      "
                    >
                      IMPORTED
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-white/35">
                  {token.name}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-black">
                {formatPrice(
                  token.price
                )}{" "}
                <span className="text-xs text-cyan-400">
                  OPN
                </span>
              </p>

              <div
                className={`
                  mt-1
                  flex
                  items-center
                  justify-end
                  gap-1
                  text-xs
                  font-bold
                  ${
                    isPositive
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                `}
              >
                {isPositive ? (
                  <TrendingUp
                    size={13}
                  />
                ) : (
                  <TrendingDown
                    size={13}
                  />
                )}

                {formatChange(
                  token.change24h
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CHART */}

        <section
          className="
            mt-3
            rounded-3xl
            border
            border-white/10
            bg-white/[0.035]
            p-3
            backdrop-blur-xl
          "
        >
          <div
            className="
              mb-3
              flex
              items-center
              justify-between
            "
          >
            <div className="flex items-center gap-2">
              <CandlestickChart
                size={17}
                className="text-cyan-400"
              />

              <div>
                <h3 className="text-sm font-black">
                  Price Chart
                </h3>

                <p className="text-[9px] text-white/25">
                  {token.symbol}/
                  {nativeToken.symbol}
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-1
                rounded-lg
                bg-cyan-400/10
                px-2
                py-1
                text-[9px]
                font-bold
                text-cyan-400
              "
            >
              <BarChart3
                size={11}
              />
              24H
            </div>
          </div>

          <CandleChart
            price={token.price}
            change24h={
              token.change24h
            }
          />
        </section>

        {/* MARKET STATS */}

        <div
          className="
            mt-3
            grid
            grid-cols-3
            gap-2
          "
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-[9px] uppercase tracking-wider text-white/25">
              Price
            </p>

            <p className="mt-1 truncate text-xs font-black">
              {formatPrice(
                token.price
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-[9px] uppercase tracking-wider text-white/25">
              24H
            </p>

            <p
              className={`
                mt-1
                text-xs
                font-black
                ${
                  isPositive
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              `}
            >
              {formatChange(
                token.change24h
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-[9px] uppercase tracking-wider text-white/25">
              Network
            </p>

            <p className="mt-1 text-xs font-black text-cyan-400">
              OPN
            </p>
          </div>
        </div>

        {/* BUY / SELL */}

        <section
          className="
            mt-4
            rounded-3xl
            border
            border-white/10
            bg-white/[0.035]
            p-4
          "
        >
          <div className="mb-3">
            <h3 className="text-sm font-black">
              Trade{" "}
              {token.symbol}
            </h3>

            <p className="mt-1 text-[10px] text-white/30">
              Choose whether you
              want to buy or sell
              this token.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href={buyUrl}
              className="
                group
                flex
                min-h-[62px]
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-emerald-400
                px-4
                text-sm
                font-black
                text-black
                shadow-[0_0_30px_rgba(52,211,153,0.12)]
                transition
                hover:bg-emerald-300
                active:scale-[0.98]
              "
            >
              <ArrowUp
                size={18}
              />

              Buy{" "}
              {token.symbol}
            </Link>

            <Link
              href={sellUrl}
              className="
                group
                flex
                min-h-[62px]
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-red-400/20
                bg-red-400/[0.08]
                px-4
                text-sm
                font-black
                text-red-300
                transition
                hover:bg-red-400/[0.14]
                active:scale-[0.98]
              "
            >
              <ArrowDown
                size={18}
              />

              Sell{" "}
              {token.symbol}
            </Link>
          </div>
        </section>

        {/* CONTRACT */}

        <div
          className="
            mt-3
            rounded-2xl
            border
            border-white/[0.07]
            bg-white/[0.025]
            p-3
          "
        >
          <p className="text-[9px] uppercase tracking-wider text-white/20">
            Contract
          </p>

          <p className="mt-1 break-all font-mono text-[9px] text-white/35">
            {token.address}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050816] text-white" />
      }
    >
      <TradeContent />
    </Suspense>
  );
}