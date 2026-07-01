"use client";

import { useAccount, useBalance } from "wagmi";

export default function WalletCard() {
  const { address, isConnected } = useAccount();

    const { data: balance } = useBalance({
        address,
          });

            const shortAddress =
                address && address.length > 10
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                            : "Not Connected";

                              const formattedBalance = balance?.formatted
                                  ? parseFloat(balance.formatted).toFixed(2)
                                      : "0.00";

                                        return (
                                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-[#0b1020] to-[#0a0f1f] p-6 shadow-xl">

                                                  {/* glow */}
                                                        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
                                                              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

                                                                    <div className="relative z-10">

                                                                            <p className="text-xs uppercase tracking-widest text-white/40">
                                                                                      Wallet Balance
                                                                                              </p>

                                                                                                      <div className="mt-3 flex items-end justify-between">

                                                                                                                <div>
                                                                                                                            <h2 className="text-3xl font-extrabold text-cyan-300">
                                                                                                                                          {formattedBalance} OPN
                                                                                                                                                      </h2>

                                                                                                                                                                  <p className="mt-1 text-sm text-white/50">
                                                                                                                                                                                {shortAddress}
                                                                                                                                                                                            </p>
                                                                                                                                                                                                      </div>

                                                                                                                                                                                                                <div className="text-right">

                                                                                                                                                                                                                            <div className="text-xs text-white/40">Network</div>
                                                                                                                                                                                                                                        <div className="text-sm font-semibold text-purple-300">
                                                                                                                                                                                                                                                      IOPN Testnet
                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                                                                                            {/* actions */}
                                                                                                                                                                                                                                                                                                    <div className="mt-5 flex gap-3">

                                                                                                                                                                                                                                                                                                              <button className="flex-1 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">
                                                                                                                                                                                                                                                                                                                          Receive
                                                                                                                                                                                                                                                                                                                                    </button>

                                                                                                                                                                                                                                                                                                                                              <button className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition">
                                                                                                                                                                                                                                                                                                                                                          Copy
                                                                                                                                                                                                                                                                                                                                                                    </button>

                                                                                                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                                                        }