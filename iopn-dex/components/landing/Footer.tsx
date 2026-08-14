"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#03050d]">

      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}

          <div className="md:col-span-2">

            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <img
                src="/logo.png"
                alt="IOPn DEX"
                className="h-12 w-12"
              />

              <div>
                <div className="font-black">
                  IOPn DEX
                </div>

                <div className="text-xs text-cyan-400">
                  Trade Smarter on IOPn
                </div>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/50">
              A decentralized exchange aggregator built for the
              IOPn ecosystem, starting on Testnet and designed for
              the future of Mainnet trading.
            </p>

          </div>


          {/* Product */}

          <div>

            <h3 className="font-bold">
              Product
            </h3>

            <div className="mt-4 space-y-3 text-sm text-white/50">

              <Link
                href="/app"
                className="block transition hover:text-cyan-400"
              >
                Launch App
              </Link>

              <Link
                href="/market"
                className="block transition hover:text-cyan-400"
              >
                Market
              </Link>

              <Link
                href="/app"
                className="block transition hover:text-cyan-400"
              >
                Trade
              </Link>

            </div>

          </div>


          {/* Resources */}

          <div>

            <h3 className="font-bold">
              Resources
            </h3>

            <div className="mt-4 space-y-3 text-sm text-white/50">

              <a
                href="https://testnet.iopn.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-cyan-400"
              >
                IOPn Explorer
              </a>

              <a
                href="https://x.com/IOPndex_xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-cyan-400"
              >
                X / Twitter
              </a>

            </div>

          </div>

        </div>


        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/30">

          © {year} IOPn DEX. Built for the IOPn ecosystem.

        </div>

      </div>

    </footer>
  );
}