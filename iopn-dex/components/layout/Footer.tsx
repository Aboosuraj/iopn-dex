"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 mb-24">
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-gradient-to-br
          from-white/5
          via-green-900/10
          to-black/40
          p-6
          backdrop-blur-xl
        "
      >
        {/* Brand */}

        <h2 className="text-center text-3xl font-black text-white">
          IOPn DEX
        </h2>

        <p className="mt-2 text-center text-sm text-white/60">
          Built for the OPN Ecosystem
        </p>

        {/* Quick Links */}

        <div className="mt-8 flex items-center justify-center gap-6 text-sm font-semibold">
          <Link
            href="https://x.com/IOPnDex_xyz"
            target="_blank"
            className="transition hover:text-green-400"
          >
            𝕏 IOPnDex
          </Link>

          <Link
            href="https://faucet.iopn.tech"
            target="_blank"
            className="transition hover:text-green-400"
          >
            💧 Faucet
          </Link>

          <Link
            href="https://testnet.iopn.tech"
            target="_blank"
            className="transition hover:text-green-400"
          >
            🔍 Explorer
          </Link>
        </div>

        {/* Network */}

        <div className="mt-8 text-center">
          <p className="text-sm font-semibold text-green-400">
            🟢 OPN Testnet
          </p>

          <p className="mt-1 text-xs text-white/50">
            Version v1.0 Beta
          </p>
        </div>

        {/* Divider */}

        <div className="my-6 h-px bg-white/10" />

        {/* Bottom */}

        <p className="text-center text-sm text-white/60">
          Built with ❤️ for OPN Chain
        </p>

        <p className="mt-2 text-center text-xs text-white/40">
          © 2026 IOPn DEX
        </p>
      </div>
    </footer>
  );
}