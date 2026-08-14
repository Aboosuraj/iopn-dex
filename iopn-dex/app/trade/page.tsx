"use client";

import Link from "next/link";

export default function TradePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">

        <h1 className="text-4xl font-black">
          Trade
        </h1>

        <p className="mt-2 text-white/60">
          Trade assets on IOPn Chain.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">

          <h2 className="text-2xl font-bold">
            Ready to Trade
          </h2>

          <p className="mt-3 text-white/50">
            Open the professional swap interface.
          </p>

          <Link
            href="/swap"
            className="mt-6 inline-flex rounded-2xl bg-cyan-500 px-6 py-3 font-bold text-black hover:bg-cyan-400"
          >
            Open Swap
          </Link>

        </div>

      </div>
    </main>
  );
}