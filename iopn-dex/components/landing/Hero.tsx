"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[110px]" />

        <div className="absolute bottom-0 right-0 h-[220px] w-[220px] rounded-full bg-purple-600/15 blur-[100px]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-16">

        {/* LOGO */}
        <div className="mb-5 rounded-2xl border border-cyan-400/10 bg-white/[0.035] p-2 shadow-[0_0_35px_rgba(34,211,238,0.08)] backdrop-blur-xl">
          <img
            src="/logo.png"
            alt="IOPn DEX"
            className="h-16 w-16 rounded-xl sm:h-20 sm:w-20"
          />
        </div>

        {/* BADGE */}
        <div className="mb-4 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5 text-[10px] font-bold tracking-wide text-cyan-300 sm:text-xs">
          <span className="mr-1.5">●</span>
          Built for the IOPn Ecosystem
        </div>

        {/* TITLE */}
        <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
          Fastest DEX Aggregator
          <br />
          <span className="text-cyan-400">
            on IOPn Chain
          </span>
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-5 max-w-2xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
          Search tokens by name or contract address, discover competitive
          prices across supported DEXs, and swap securely with fast execution.
        </p>

        {/* BUTTONS */}
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">

          <Link
            href="/app"
            className="
              rounded-xl
              bg-cyan-400
              px-5
              py-2.5
              text-xs
              font-black
              text-black
              shadow-[0_0_25px_rgba(34,211,238,0.15)]
              transition
              hover:bg-cyan-300
              hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]
              active:scale-95
            "
          >
            Launch App
          </Link>

          <a
            href="#features"
            className="
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.035]
              px-5
              py-2.5
              text-xs
              font-bold
              text-white/70
              backdrop-blur-xl
              transition
              hover:border-cyan-400/20
              hover:bg-white/[0.06]
              hover:text-white
              active:scale-95
            "
          >
            Learn More
          </a>

        </div>

        {/* FEATURES */}
        <div className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">

          {[
            "Best Price Routing",
            "Token Name Search",
            "Contract Search",
            "Secure Contracts",
            "Wallet Connect",
            "Fast Swaps",
            "Mobile Friendly",
            "Testnet → Mainnet",
          ].map((item) => (
            <div
              key={item}
              className="
                group
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                px-2.5
                py-2.5
                text-[9px]
                font-bold
                text-white/55
                backdrop-blur-xl
                transition
                hover:border-cyan-400/20
                hover:bg-cyan-400/[0.04]
                hover:text-cyan-300
              "
            >
              <span className="mr-1 text-cyan-400">
                ✓
              </span>

              {item}
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}