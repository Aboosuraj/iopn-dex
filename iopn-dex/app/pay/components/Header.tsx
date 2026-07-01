"use client";

import { useAccount } from "wagmi";

interface HeaderProps {
  onReceive?: () => void;
  }

  export default function Header({ onReceive }: HeaderProps) {
    const { address, isConnected } = useAccount();

      const short =
          address && address.length > 10
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Not Connected";

                        return (
                            <header className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#081221] via-[#0B1830] to-[#120C2F] p-6 shadow-2xl">

                                  {/* Glow */}
                                        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
                                              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

                                                    <div className="relative z-10">

                                                            <div className="flex items-center justify-between">

                                                                      <div>

                                                                                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/20">
                                                                                                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                                                                                                              IOPN TESTNET
                                                                                                                          </div>

                                                                                                                                      <h1 className="mt-4 text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent">
                                                                                                                                                    IOPn Pay
                                                                                                                                                                </h1>

                                                                                                                                                                            <p className="mt-2 text-white/60">
                                                                                                                                                                                          Secure Web3 Payments on IOPN Chain
                                                                                                                                                                                                      </p>

                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                          <div className="text-right">

                                                                                                                                                                                                                                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">

                                                                                                                                                                                                                                                    <p className="text-xs uppercase tracking-widest text-white/40">
                                                                                                                                                                                                                                                                    Wallet
                                                                                                                                                                                                                                                                                  </p>

                                                                                                                                                                                                                                                                                                <p className="mt-1 font-semibold text-cyan-300">
                                                                                                                                                                                                                                                                                                                {short}
                                                                                                                                                                                                                                                                                                                              </p>

                                                                                                                                                                                                                                                                                                                                            <p className="mt-2 text-xs text-green-400">
                                                                                                                                                                                                                                                                                                                                                            {isConnected ? "● Connected" : "Disconnected"}
                                                                                                                                                                                                                                                                                                                                                                          </p>

                                                                                                                                                                                                                                                                                                                                                                                      </div>

                                                                                                                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                                                                                <div className="mt-6 flex gap-3">

                                                                                                                                                                                                                                                                                                                                                                                                                          <button
                                                                                                                                                                                                                                                                                                                                                                                                                                      onClick={onReceive}
                                                                                                                                                                                                                                                                                                                                                                                                                                                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-bold text-black transition hover:scale-105"
                                                                                                                                                                                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        Receive
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </button>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <button
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10 transition"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              Copy Address
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </button>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </header>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }