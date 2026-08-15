"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Globe2,
  Users,
} from "lucide-react";

type ChainStats = {
  totalTransactions: number | null;
  totalWallets: number | null;
  dailyTransactions: number | null;
};

const EXPLORER_URL = "https://testnet.iopn.tech";

export default function LiveStats() {
  const [stats, setStats] = useState<ChainStats>({
    totalTransactions: null,
    totalWallets: null,
    dailyTransactions: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        setLoading(true);

        /*
         * IMPORTANT:
         * The explorer is the source of truth for these chain metrics.
         *
         * If your explorer exposes a JSON stats endpoint, replace the
         * URL below with that endpoint.
         *
         * The UI intentionally does not hardcode the chain values.
         */

        const response = await fetch(
          `${EXPLORER_URL}/api/stats`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Explorer stats unavailable");
        }

        const data = await response.json();

        if (!mounted) return;

        setStats({
          totalTransactions:
            Number(
              data.totalTransactions ??
                data.total_transactions ??
                data.transactions ??
                0
            ),

          totalWallets:
            Number(
              data.walletAddresses ??
                data.wallet_addresses ??
                data.wallets ??
                0
            ),

          dailyTransactions:
            Number(
              data.dailyTransactions ??
                data.daily_transactions ??
                data.dailyTxn ??
                data.daily_txn ??
                0
            ),
        });
      } catch (error) {
        console.error(
          "Unable to load OPN chain statistics:",
          error
        );

        if (!mounted) return;

        setStats({
          totalTransactions: null,
          totalWallets: null,
          dailyTransactions: null,
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    const interval = setInterval(
      loadStats,
      30_000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  function formatNumber(value: number | null) {
    if (value === null) return "--";

    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B+`;
    }

    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M+`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K+`;
    }

    return value.toLocaleString();
  }

  const cards = [
    {
      label: "Total Volume",
      value: "$0",
      description: "DEX volume",
      icon: BarChart3,
      iconClass: "text-cyan-400",
      glow: "bg-cyan-400/10",
      valueClass: "text-cyan-400",
    },

    {
      label: "Total TXN",
      value: loading
        ? "..."
        : formatNumber(stats.totalTransactions),
      description: "Chain transactions",
      icon: Activity,
      iconClass: "text-emerald-400",
      glow: "bg-emerald-400/10",
      valueClass: "text-emerald-400",
    },

    {
      label: "Total Wallets",
      value: loading
        ? "..."
        : formatNumber(stats.totalWallets),
      description: "Unique chain wallets",
      icon: Users,
      iconClass: "text-violet-400",
      glow: "bg-violet-400/10",
      valueClass: "text-violet-400",
    },

    {
      label: "Daily TXN",
      value: loading
        ? "..."
        : formatNumber(stats.dailyTransactions),
      description: "Transactions today",
      icon: Globe2,
      iconClass: "text-amber-400",
      glow: "bg-amber-400/10",
      valueClass: "text-amber-400",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">

      {/* HEADER */}

      <div className="mb-5 flex items-end justify-between">

        <div>
          <div className="flex items-center gap-2">

            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                border
                border-cyan-400/10
                bg-cyan-400/[0.07]
              "
            >
              <Activity
                size={14}
                className="text-cyan-400"
              />
            </span>

            <h2 className="text-xl font-black tracking-tight text-white">
              Network Stats
            </h2>

          </div>

          <p className="mt-1 ml-9 text-[10px] text-white/30">
            Live OPN Testnet activity
          </p>
        </div>

        <a
          href={EXPLORER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex
            items-center
            gap-1
            rounded-lg
            border
            border-cyan-400/10
            bg-cyan-400/[0.05]
            px-2.5
            py-1.5
            text-[9px]
            font-bold
            text-cyan-400
            transition
            hover:border-cyan-400/25
            hover:bg-cyan-400/[0.09]
          "
        >
          Explorer

          <ArrowUpRight size={11} />
        </a>

      </div>


      {/* COMPACT CARDS */}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

        {cards.map((card) => {

          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#0b1020]/80
                p-3.5
                backdrop-blur-xl
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-cyan-400/20
                hover:bg-[#0e1426]
              "
            >

              {/* CARD GLOW */}

              <div
                className={`
                  pointer-events-none
                  absolute
                  -right-8
                  -top-8
                  h-20
                  w-20
                  rounded-full
                  ${card.glow}
                  blur-2xl
                `}
              />


              {/* ICON */}

              <div
                className={`
                  relative
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.06]
                  ${card.glow}
                `}
              >

                <Icon
                  size={15}
                  className={card.iconClass}
                  strokeWidth={2}
                />

              </div>


              {/* VALUE */}

              <div className="relative mt-3">

                <p
                  className={`
                    truncate
                    text-2xl
                    font-black
                    tracking-tight
                    ${card.valueClass}
                  `}
                >
                  {card.value}
                </p>

                <p className="mt-1 text-[10px] font-bold text-white/60">
                  {card.label}
                </p>

                <p className="mt-0.5 truncate text-[8px] text-white/25">
                  {card.description}
                </p>

              </div>


              {/* LIVE DOT */}

              <div className="absolute right-3 top-3">

                <span
                  className="
                    block
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-400
                    shadow-[0_0_8px_rgba(52,211,153,0.8)]
                  "
                />

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}