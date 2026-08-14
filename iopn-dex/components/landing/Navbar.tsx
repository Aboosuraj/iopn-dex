"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <img
            src="/logo.png"
            alt="IOPn DEX"
            className="h-12 w-12"
          />

          <div>

            <h1 className="text-xl font-black">
              IOPn DEX
            </h1>

            <p className="text-xs text-cyan-400">
              Trade Smarter
            </p>

          </div>

        </Link>



        {/* Desktop Menu */}

        <nav className="hidden items-center gap-8 md:flex">

          <a href="#features" className="text-white/70 hover:text-white">
            Features
          </a>

          <a href="#roadmap" className="text-white/70 hover:text-white">
            Roadmap
          </a>

          <a href="#faq" className="text-white/70 hover:text-white">
            FAQ
          </a>

          <a href="#community" className="text-white/70 hover:text-white">
            Community
          </a>

        </nav>



        {/* Launch App */}

        <Link
          href="/app"
          className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
        >
          Launch App
        </Link>

      </div>

    </header>
  );
}