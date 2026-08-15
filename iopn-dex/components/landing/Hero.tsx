"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      {/* Background Glow */}

      <div className="absolute inset-0 -z-10">

        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-purple-600/20 blur-[120px]" />

      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">

        <img
          src="/logo.png"
          alt="IOPn DEX"
          className="mb-8 h-32 w-32"
        />

        <div className="mb-5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-300">
          🚀 Built for the IOPn Ecosystem
        </div>

        <h1 className="max-w-5xl text-5xl font-black leading-tight md:text-7xl">
          Fastest DEX Aggregator
          <br />
          on IOPn Chain
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-white/70 md:text-xl">
          Search tokens by name or contract address,
          discover the best price across supported DEXs,
          and swap securely with lightning-fast execution.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">

          <Link
            href="/app"
              className="rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
              >
                🚀 Launch App
                </Link>

          <a
            href="#features"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold transition hover:bg-white/10"
          >
            Learn More
          </a>

        </div>

        <div className="mt-16 grid gap-4 text-left md:grid-cols-2 lg:grid-cols-4">

          {[
            "✔ Best Price Routing",
            "✔ Search by Token Name",
            "✔ Search by Contract Address",
            "✔ Secure Smart Contracts",
            "✔ Wallet Connect",
            "✔ Lightning Fast Swaps",
            "✔ Mobile Friendly",
            "✔ Built for Testnet → Mainnet",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-4"
            >
              {item}
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}