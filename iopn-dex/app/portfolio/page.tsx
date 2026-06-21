"use client";

import { useAccount } from "wagmi";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();

    return (
        <main className="min-h-screen pb-24 text-white bg-gradient-to-b from-blue-950 via-purple-950 to-black">

              <div className="p-5">

                      <div className="rounded-3xl p-6 bg-gradient-to-r from-blue-600 to-purple-600">
                                <h1 className="text-4xl font-bold">
                                            💼 Portfolio
                                                      </h1>

                                                                <p className="mt-2 opacity-80">
                                                                            Track your OPN Testnet assets
                                                                                      </p>
                                                                                              </div>

                                                                                                      <div className="mt-6 rounded-3xl p-6 bg-white/5 border border-white/10">

                                                                                                                <h2 className="text-lg font-semibold mb-3">
                                                                                                                            Connected Wallet
                                                                                                                                      </h2>

                                                                                                                                                <p className="break-all text-green-400">
                                                                                                                                                            {isConnected ? address : "Wallet Not Connected"}
                                                                                                                                                                      </p>

                                                                                                                                                                              </div>

                                                                                                                                                                                      <div className="mt-6 rounded-3xl p-6 bg-white/5 border border-white/10">

                                                                                                                                                                                                <h2 className="text-xl font-semibold mb-5">
                                                                                                                                                                                                            Assets
                                                                                                                                                                                                                      </h2>

                                                                                                                                                                                                                                <div className="space-y-4">

                                                                                                                                                                                                                                            <div className="flex justify-between p-4 rounded-xl bg-green-500/20">
                                                                                                                                                                                                                                                          <span>🟢 OPNT</span>
                                                                                                                                                                                                                                                                        <span>0.00</span>
                                                                                                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                                                                                                <div className="flex justify-between p-4 rounded-xl bg-purple-500/20">
                                                                                                                                                                                                                                                                                                              <span>🟣 WOPN</span>
                                                                                                                                                                                                                                                                                                                            <span>0.00</span>
                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                    <div className="flex justify-between p-4 rounded-xl bg-blue-500/20">
                                                                                                                                                                                                                                                                                                                                                                  <span>🔵 tUSDT</span>
                                                                                                                                                                                                                                                                                                                                                                                <span>0.00</span>
                                                                                                                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                                                                                                                        <div className="flex justify-between p-4 rounded-xl bg-yellow-500/20">
                                                                                                                                                                                                                                                                                                                                                                                                                      <span>🟡 tBNB</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                    <span>0.00</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </main>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              }