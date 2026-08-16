"use client";

import {
  BarChart3,
  Activity,
  Wallet,
  Zap,
  ArrowUpRight,
} from "lucide-react";

const EXPLORER_URL = "https://testnet.iopn.tech";

export default function MarketOverview() {
  const stats = [
    {
      title: "24H Volume",
      label: "TOTAL VOLUME",
      value: "$0",
      icon: BarChart3,
      iconStyle: "bg-cyan-400/10 text-cyan-300",
      valueStyle: "text-cyan-300",
    },
    {
      title: "Chain Transactions",
      label: "TOTAL TXN",
      value: "386M+",
      icon: Activity,
      iconStyle: "bg-emerald-400/10 text-emerald-300",
      valueStyle: "text-emerald-300",
    },
    {
      title: "Wallet Addresses",
      label: "TOTAL WALLETS",
      value: "33.3M+",
      icon: Wallet,
      iconStyle: "bg-violet-400/10 text-violet-300",
      valueStyle: "text-violet-300",
    },
    {
      title: "Daily Activity",
      label: "DAILY TXN",
      value: "—",
      icon: Zap,
      iconStyle: "bg-blue-400/10 text-blue-300",
      valueStyle: "text-blue-300",
    },
  ];

  return (
    <section className="mt-7">

      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-cyan-400/15
              bg-cyan-400/[0.06]
              shadow-[0_0_20px_rgba(34,211,238,0.06)]
            "
          >
            <Activity
              size={19}
              className="text-cyan-300"
              strokeWidth={2}
            />
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Chain Stats
            </h2>

            <p className="mt-0.5 text-[11px] text-white/35">
              OPN Chain network activity
            </p>
          </div>

        </div>

        {/* LIVE */}
        <div
          className="
            flex items-center gap-1.5
            rounded-full
            border border-emerald-400/15
            bg-emerald-400/[0.07]
            px-3 py-1.5
          "
        >
          <span
            className="
              h-1.5 w-1.5 animate-pulse rounded-full
              bg-emerald-400
              shadow-[0_0_8px_rgba(52,211,153,0.8)]
            "
          />

          <span className="text-[10px] font-black tracking-wide text-emerald-300">
            LIVE
          </span>
        </div>

      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-2.5">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.title}
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                relative
                overflow-hidden
                rounded-[20px]
                border border-white/[0.07]
                bg-[#0d121d]/90
                p-3.5
                shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                backdrop-blur-xl
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-cyan-400/25
                hover:bg-[#101827]
                hover:shadow-[0_8px_35px_rgba(34,211,238,0.08)]
                active:scale-[0.98]
              "
            >

              {/* GLOW */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-8
                  -top-8
                  h-20
                  w-20
                  rounded-full
                  bg-cyan-400/[0.035]
                  blur-2xl
                  transition
                  group-hover:bg-cyan-400/[0.08]
                "
              />

              {/* TOP */}
              <div className="relative flex items-center justify-between">

                <div
                  className={`
                    flex h-9 w-9
                    items-center justify-center
                    rounded-xl
                    ${item.iconStyle}
                  `}
                >
                  <Icon size={17} strokeWidth={2} />
                </div>

                <ArrowUpRight
                  size={14}
                  className="
                    text-white/15
                    transition-all
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-cyan-300
                  "
                />

              </div>

              {/* TITLE */}
              <p className="relative mt-3 text-[10px] font-semibold text-white/35">
                {item.title}
              </p>

              {/* LABEL */}
              <p className="relative mt-1.5 text-[9px] font-bold tracking-[0.14em] text-white/25">
                {item.label}
              </p>

              {/* VALUE */}
              <h3
                className={`
                  relative mt-1
                  text-2xl
                  font-black
                  tracking-tight
                  ${item.valueStyle}
                `}
              >
                {item.value}
              </h3>

            </a>
          );
        })}

      </div>

    </section>
  );
}