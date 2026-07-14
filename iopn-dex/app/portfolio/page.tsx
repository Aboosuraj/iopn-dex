"use client";

import { formatUnits } from "viem";
import { usePortfolio } from "@/lib/usePortfolio";
import { TOKENS } from "@/lib/tokens";

export default function PortfolioPage() {
  const {
    address,
    nativeBalance,
    tokenBalances,
  } = usePortfolio();

  const isConnected = !!address;

  return (
    <main className="min-h-screen pb-28 bg-[#050816] text-white">

      {/* Background Effects */}

      <div className="fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-purple-600/20 blur-[120px]" />

        <div className="absolute right-0 top-1/3 h-[260px] w-[260px] rounded-full bg-blue-600/20 blur-[120px]" />

      </div>

      <div className="mx-auto max-w-4xl p-5">

        {/* HERO CARD */}

        <div className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-white/5 backdrop-blur-2xl shadow-2xl">

          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative p-7">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">

                  IOPn Portfolio

                </p>

                <h1 className="mt-2 text-4xl font-black">

                  Your Assets

                </h1>

                <p className="mt-2 text-sm text-zinc-400">

                  Track balances across the IOPn Testnet ecosystem.

                </p>

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg">

                💼

              </div>

            </div>

            {/* TOTAL BALANCE */}

            <div className="mt-8">

              <p className="text-zinc-400 text-sm">

                Total OPN Balance

              </p>

              <h2 className="mt-2 text-5xl font-black tracking-tight">

                {nativeBalance.data
                  ? Number(nativeBalance.data.formatted).toFixed(4)
                  : "0.0000"}

                <span className="ml-3 text-2xl text-cyan-400">

                  OPN

                </span>

              </h2>

            </div>

            {/* Wallet Badge */}

            <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">

              <div>

                <p className="text-xs uppercase tracking-wider text-zinc-500">

                  Connected Wallet

                </p>

                <p className="mt-1 font-semibold text-green-400">

                  {isConnected
                    ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                    : "Wallet Not Connected"}

                </p>

              </div>

              <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2">

                <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />

                <span className="text-sm font-medium text-green-400">

                  {isConnected ? "Connected" : "Offline"}

                </span>

              </div>

            </div>

          </div>

        </div>
                {/* QUICK ACTIONS */}

        <div className="mt-6 grid grid-cols-3 gap-4">

          <button
            className="
              group
              rounded-3xl
              border
              border-cyan-500/20
              bg-white/5
              backdrop-blur-xl
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-cyan-400
              hover:bg-cyan-500/10
            "
          >
            <div className="text-3xl transition group-hover:scale-110">
              🔄
            </div>

            <p className="mt-3 font-bold">
              Swap
            </p>

            <p className="text-xs text-zinc-400 mt-1">
              Exchange Assets
            </p>

          </button>

          <button
            className="
              group
              rounded-3xl
              border
              border-purple-500/20
              bg-white/5
              backdrop-blur-xl
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-purple-400
              hover:bg-purple-500/10
            "
          >

            <div className="text-3xl transition group-hover:scale-110">
              💧
            </div>

            <p className="mt-3 font-bold">
              Liquidity
            </p>

            <p className="text-xs text-zinc-400 mt-1">
              Add LP
            </p>

          </button>

          <button
            className="
              group
              rounded-3xl
              border
              border-yellow-500/20
              bg-white/5
              backdrop-blur-xl
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-yellow-400
              hover:bg-yellow-500/10
            "
          >

            <div className="text-3xl transition group-hover:scale-110">
              🌾
            </div>

            <p className="mt-3 font-bold">
              Stake
            </p>

            <p className="text-xs text-zinc-400 mt-1">
              Earn Rewards
            </p>

          </button>

        </div>

        {/* PORTFOLIO STATS */}

        <div className="mt-7 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">

            <p className="text-xs uppercase tracking-wider text-zinc-500">

              Assets

            </p>

            <h3 className="mt-3 text-3xl font-black">

              {TOKENS.length + 1}

            </h3>

            <p className="mt-2 text-sm text-zinc-400">

              Native + ERC20 Tokens

            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">

            <p className="text-xs uppercase tracking-wider text-zinc-500">

              Network

            </p>

            <h3 className="mt-3 text-3xl font-black text-cyan-400">

              IOPn

            </h3>

            <p className="mt-2 text-sm text-zinc-400">

              Testnet

            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">

            <p className="text-xs uppercase tracking-wider text-zinc-500">

              Wallet

            </p>

            <h3 className="mt-3 text-2xl font-black">

              {isConnected ? "Connected" : "Offline"}

            </h3>

            <p className="mt-2 text-sm text-zinc-400">

              Web3 Status

            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">

            <p className="text-xs uppercase tracking-wider text-zinc-500">

              Portfolio

            </p>

            <h3 className="mt-3 text-3xl font-black text-green-400">

              Active

            </h3>

            <p className="mt-2 text-sm text-zinc-400">

              Ready to Trade

            </p>

          </div>

        </div>
                {/* ASSETS */}

        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">

                Your Assets

              </h2>

              <p className="mt-1 text-sm text-zinc-400">

                Native & ERC20 balances on IOPn Testnet

              </p>

            </div>

            <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">

              {TOKENS.length + 1} Assets

            </div>

          </div>

          <div className="mt-6 space-y-4">

            {/* Native OPN */}

            <div className="group flex items-center justify-between rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl shadow-lg">

                  💎

                </div>

                <div>

                  <h3 className="text-lg font-bold">

                    OPN

                  </h3>

                  <p className="text-sm text-zinc-400">

                    Native Token

                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="text-2xl font-black">

                  {nativeBalance.data
                    ? Number(nativeBalance.data.formatted).toFixed(4)
                    : "0.0000"}

                </p>

                <p className="text-xs text-cyan-400">

                  Available

                </p>

              </div>

            </div>

            {/* ERC20 Tokens */}

            {TOKENS.map((token, index) => {

              const balance =
                tokenBalances?.data?.[index]?.result as
                  | bigint
                  | undefined;

              const formatted = balance
                ? Number(
                    formatUnits(
                      balance,
                      token.decimals
                    )
                  ).toFixed(4)
                : "0.0000";

              return (

                <div
                  key={token.symbol}
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-3xl
                    border
                    border-white/10
                    bg-black/20
                    p-5
                    transition-all
                    duration-300
                    hover:scale-[1.02]
                    hover:border-cyan-500/30
                    hover:bg-white/10
                  "
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-xl font-bold shadow-lg">

                      {token.symbol.slice(0, 1)}

                    </div>

                    <div>

                      <h3 className="text-lg font-bold">

                        {token.symbol}

                      </h3>

                      <p className="text-sm text-zinc-400">

                        ERC20 Token

                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-2xl font-black">

                      {formatted}

                    </p>

                    <p className="text-xs text-zinc-500">

                      Balance

                    </p>

                  </div>

                </div>

              );

            })}
                      </div>

        </div>

        {/* PORTFOLIO ALLOCATION */}

        <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">

                Portfolio Allocation

              </h2>

              <p className="mt-1 text-sm text-zinc-400">

                Asset distribution overview

              </p>

            </div>

            <span className="rounded-full bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-400">

              Overview

            </span>

          </div>

          <div className="mt-6 space-y-5">

            <div>

              <div className="mb-2 flex justify-between">

                <span className="font-medium">
                  OPN
                </span>

                <span className="text-cyan-400">
                  Primary Asset
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">

                <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-600"></div>

              </div>

            </div>

            <div>

              <div className="mb-2 flex justify-between">

                <span className="font-medium">
                  ERC20 Tokens
                </span>

                <span className="text-purple-400">
                  Secondary Assets
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">

                <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>

              </div>

            </div>

          </div>

        </div>

        {/* NETWORK INFORMATION */}

        <div className="mt-8 rounded-[32px] border border-cyan-500/10 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-2xl p-6">

          <div className="grid grid-cols-2 gap-5">

            <div>

              <p className="text-xs uppercase tracking-widest text-zinc-500">

                Network

              </p>

              <h3 className="mt-2 text-2xl font-black">

                IOPn Testnet

              </h3>

            </div>

            <div>

              <p className="text-xs uppercase tracking-widest text-zinc-500">

                Chain

              </p>

              <h3 className="mt-2 text-2xl font-black text-cyan-400">

                #984

              </h3>

            </div>

            <div>

              <p className="text-xs uppercase tracking-widest text-zinc-500">

                Wallet Status

              </p>

              <h3 className="mt-2 font-bold text-green-400">

                {isConnected
                  ? "Connected"
                  : "Disconnected"}

              </h3>

            </div>

            <div>

              <p className="text-xs uppercase tracking-widest text-zinc-500">

                Supported Assets

              </p>

              <h3 className="mt-2 font-bold">

                {TOKENS.length + 1}

              </h3>

            </div>

          </div>

        </div>
                {/* FOOTER */}

        <div className="mt-10 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6">

          <div className="flex flex-col items-center justify-center text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 shadow-xl">

              🚀

            </div>

            <h2 className="text-2xl font-black">

              IOPn Portfolio

            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-zinc-400">

              Manage your assets, monitor your balances,
              provide liquidity, stake LP tokens,
              and experience a modern Web3 portfolio
              built for the IOPn ecosystem.

            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-400">

                IOPn Testnet

              </span>

              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-400">

                Web3 Portfolio

              </span>

              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-400">

                Secure Wallet

              </span>

            </div>

            <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <p className="mt-6 text-xs tracking-wider text-zinc-500">

              © 2026 IOPn DEX • Built on IOPn Chain • Powered by Wagmi + Viem

            </p>

          </div>

        </div>

      </div>

    </main>

  );

}