"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  TrendingUp,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  RefreshCw,
} from "lucide-react";

import { useTokens, Token } from "@/hooks/useTokens";
import { useSwap } from "@/hooks/useSwap";

type MarketToken = Token & {
  priceInOPN: string;
};

type Tab =
  | "all"
  | "trending"
  | "gainers"
  | "losers"
  | "new";

function formatPrice(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "--";
  }

  if (number >= 1000) {
    return number.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  }

  if (number >= 1) {
    return number.toLocaleString("en-US", {
      maximumFractionDigits: 4,
    });
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 8,
  });
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
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        border-cyan-400/10
        bg-cyan-400/10
        text-sm
        font-black
        text-cyan-400
      "
    >
      {symbol.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function MarketPage() {
  const { tokens } = useTokens();
  const { getQuote } = useSwap();

  const [prices, setPrices] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [tab, setTab] = useState<Tab>("all");

  async function loadPrices() {
    if (!tokens.length) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const nextPrices: Record<string, string> = {};

    for (const token of tokens) {
      try {
        if (token.native) {
          nextPrices[token.symbol] = "1";
          continue;
        }

        const quote = await getQuote(
          "1",
          token,
          tokens.find((item) => item.native) ?? tokens[0]
        );

        nextPrices[token.symbol] = quote;
      } catch {
        nextPrices[token.symbol] = "0";
      }
    }

    setPrices(nextPrices);

    setLoading(false);
  }

  useEffect(() => {
    loadPrices();
  }, [tokens]);

  const marketTokens: MarketToken[] = useMemo(() => {
    return tokens.map((token) => ({
      ...token,
      priceInOPN:
        prices[token.symbol] ?? "0",
    }));
  }, [tokens, prices]);

  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = [...marketTokens];

    if (query) {
      result = result.filter(
        (token) =>
          token.symbol
            .toLowerCase()
            .includes(query) ||
          token.address
            .toLowerCase()
            .includes(query)
      );
    }

    if (tab === "trending") {
      result = result.slice(0, 4);
    }

    if (tab === "new") {
      result = [...result].reverse().slice(0, 4);
    }

    /*
     * Gainers / losers require historical price data.
     * We don't invent 24H percentages.
     */
    if (
      tab === "gainers" ||
      tab === "losers"
    ) {
      result = [];
    }

    return result;
  }, [
    marketTokens,
    search,
    tab,
  ]);

  const tabs = [
    {
      id: "all" as Tab,
      label: "All Tokens",
      icon: BarChart3,
    },
    {
      id: "trending" as Tab,
      label: "Trending",
      icon: Flame,
    },
    {
      id: "gainers" as Tab,
      label: "Gainers",
      icon: ArrowUpRight,
    },
    {
      id: "losers" as Tab,
      label: "Losers",
      icon: ArrowDownRight,
    },
    {
      id: "new" as Tab,
      label: "New",
      icon: Sparkles,
    },
  ];

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-[#050816]
        pb-28
        text-white
      "
    >
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

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
          max-w-6xl
          px-4
          pt-5
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

          <div>

            <div className="flex items-center gap-2">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-2xl
                  bg-cyan-400/10
                  text-cyan-400
                "
              >
                <TrendingUp size={19} />
              </div>

              <h1
                className="
                  text-2xl
                  font-black
                  tracking-tight
                "
              >
                Markets
              </h1>

            </div>

            <p
              className="
                mt-1
                text-sm
                text-white/40
              "
            >
              Explore the IOPn token market
            </p>

          </div>

          <button
            type="button"
            onClick={loadPrices}
            disabled={loading}
            className="
              flex
              h-10
              w-10
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
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

        </div>


        {/* MARKET STATUS */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-cyan-400/10
            bg-cyan-400/[0.035]
            px-4
            py-3
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

            <span
              className="
                text-xs
                font-semibold
                text-white/60
              "
            >
              IOPn Testnet
            </span>

          </div>

          <span
            className="
              text-xs
              font-bold
              text-emerald-400
            "
          >
            Live On-Chain Prices
          </span>

        </div>


        {/* SEARCH */}

        <div
          className="
            relative
            mt-4
          "
        >

          <Search
            size={17}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-white/30
            "
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search token..."
            className="
              h-12
              w-full
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              pl-11
              pr-4
              text-sm
              font-medium
              text-white
              outline-none
              placeholder:text-white/25
              focus:border-cyan-400/30
              focus:bg-cyan-400/[0.03]
            "
          />

        </div>


        {/* TABS */}

        <div
          className="
            mt-4
            flex
            gap-2
            overflow-x-auto
            pb-1
            scrollbar-none
          "
        >

          {tabs.map((item) => {

            const Icon = item.icon;

            const active =
              tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setTab(item.id)
                }
                className={`
                  flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-xl
                  border
                  px-3
                  py-2
                  text-xs
                  font-bold
                  transition
                  ${
                    active
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-400"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"
                  }
                `}
              >

                <Icon size={14} />

                {item.label}

              </button>
            );
          })}

        </div>


        {/* MARKET SUMMARY */}

        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-4
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-3.5
            "
          >

            <p className="text-[10px] uppercase tracking-wider text-white/30">
              Tokens
            </p>

            <p className="mt-1 text-xl font-black">
              {tokens.length}
            </p>

          </div>

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-3.5
            "
          >

            <p className="text-[10px] uppercase tracking-wider text-white/30">
              Network
            </p>

            <p className="mt-1 text-xl font-black">
              OPN
            </p>

          </div>

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-3.5
            "
          >

            <p className="text-[10px] uppercase tracking-wider text-white/30">
              Pricing
            </p>

            <p className="mt-1 text-xl font-black text-cyan-400">
              Live
            </p>

          </div>

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-3.5
            "
          >

            <p className="text-[10px] uppercase tracking-wider text-white/30">
              Status
            </p>

            <p className="mt-1 text-xl font-black text-emerald-400">
              Online
            </p>

          </div>

        </div>


        {/* MARKET LIST */}

        <section
          className="
            mt-5
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-white/[0.035]
            backdrop-blur-xl
          "
        >

          {/* SECTION HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-white/10
              px-4
              py-4
            "
          >

            <div>

              <h2 className="font-black">
                {tabs.find(
                  (item) =>
                    item.id === tab
                )?.label}
              </h2>

              <p className="mt-0.5 text-xs text-white/30">
                Prices quoted against OPN
              </p>

            </div>

            <span
              className="
                rounded-full
                bg-cyan-400/10
                px-2.5
                py-1
                text-[10px]
                font-bold
                text-cyan-400
              "
            >
              {filteredTokens.length}
            </span>

          </div>


          {/* LOADING */}

          {loading ? (

            <div
              className="
                px-5
                py-12
                text-center
              "
            >

              <RefreshCw
                size={24}
                className="
                  mx-auto
                  animate-spin
                  text-cyan-400
                "
              />

              <p className="mt-3 text-sm text-white/40">
                Loading on-chain prices...
              </p>

            </div>

          ) : tab === "gainers" ||
            tab === "losers" ? (

            <div
              className="
                px-5
                py-12
                text-center
              "
            >

              <BarChart3
                size={26}
                className="
                  mx-auto
                  text-white/20
                "
              />

              <h3 className="mt-3 font-bold">
                24H data coming next
              </h3>

              <p
                className="
                  mx-auto
                  mt-1
                  max-w-xs
                  text-xs
                  leading-5
                  text-white/35
                "
              >
                Gainers and losers need historical
                price data. We will connect that to
                real market history instead of showing
                fake percentages.
              </p>

            </div>

          ) : filteredTokens.length === 0 ? (

            <div
              className="
                px-5
                py-12
                text-center
                text-sm
                text-white/35
              "
            >
              No tokens found.
            </div>

          ) : (

            <div>

              {filteredTokens.map(
                (token, index) => {

                  const price =
                    token.priceInOPN;

                  return (

                    <div
                      key={token.address}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-white/[0.06]
                        px-4
                        py-3.5
                        transition
                        last:border-b-0
                        hover:bg-white/[0.025]
                      "
                    >

                      {/* TOKEN */}

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-3
                        "
                      >

                        <span
                          className="
                            w-4
                            text-center
                            text-[10px]
                            font-bold
                            text-white/20
                          "
                        >
                          {index + 1}
                        </span>

                        <TokenIcon
                          symbol={token.symbol}
                        />

                        <div className="min-w-0">

                          <div className="flex items-center gap-1.5">

                            <p
                              className="
                                truncate
                                text-sm
                                font-black
                              "
                            >
                              {token.symbol}
                            </p>

                            {token.native && (
                              <span
                                className="
                                  rounded-md
                                  bg-cyan-400/10
                                  px-1.5
                                  py-0.5
                                  text-[8px]
                                  font-bold
                                  text-cyan-400
                                "
                              >
                                NATIVE
                              </span>
                            )}

                          </div>

                          <p
                            className="
                              mt-0.5
                              truncate
                              text-[10px]
                              text-white/30
                            "
                          >
                            {token.native
                              ? "Native OPN"
                              : "ERC-20 Token"}
                          </p>

                        </div>

                      </div>


                      {/* PRICE */}

                      <div
                        className="
                          shrink-0
                          text-right
                        "
                      >

                        <p
                          className="
                            text-sm
                            font-black
                            text-white
                          "
                        >
                          {formatPrice(price)}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            font-semibold
                            text-cyan-400
                          "
                        >
                          OPN
                        </p>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>


        {/* INFO */}

        <div
          className="
            mt-4
            flex
            gap-3
            rounded-2xl
            border
            border-cyan-400/10
            bg-cyan-400/[0.025]
            p-3.5
          "
        >

          <TrendingUp
            size={18}
            className="
              mt-0.5
              shrink-0
              text-cyan-400
            "
          />

          <p
            className="
              text-xs
              leading-5
              text-white/35
            "
          >
            Token prices are calculated from the
            IOPn DEX router using live on-chain
            liquidity. 24H percentage changes and
            volume will be added when market-history
            data is connected.
          </p>

        </div>

      </div>

    </main>
  );
}