"use client";

import Link from "next/link";

export default function Navbar() {
  return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090B]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
            <div className="flex justify-around items-center py-3">

                    <Link
                              href="/"
                                        className="flex flex-col items-center text-purple-400"
                                                >
                                                          <span className="text-xl">🏠</span>
                                                                    <span className="text-[10px]">DASHBOARD</span>
                                                                            </Link>

                                                                                    <Link
                                                                                              href="/pay"
                                                                                                        className="flex flex-col items-center text-green-400"
                                                                                                                >
                                                                                                                          <span className="text-xl">💸</span>
                                                                                                                                    <span className="text-[10px]">PAY</span>
                                                                                                                                            </Link>

                                                                                                                                                    <Link
                                                                                                                                                              href="/trade"
                                                                                                                                                                        className="flex flex-col items-center text-blue-400"
                                                                                                                                                                                >
                                                                                                                                                                                          <span className="text-xl">🔄</span>
                                                                                                                                                                                                    <span className="text-[10px]">SWAP</span>
                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                    <Link
                                                                                                                                                                                                                              href="/Liquidity"
                                                                                                                                                                                                                                        className="flex flex-col items-center text-yellow-400"
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                          <span className="text-xl">💎</span>
                                                                                                                                                                                                                                                                    <span className="text-[10px]">STAKE</span>
                                                                                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                                                                                    <Link
                                                                                                                                                                                                                                                                                              href="/portfolio"
                                                                                                                                                                                                                                                                                                        className="flex flex-col items-center text-pink-400"
                                                                                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                                                                          <span className="text-xl">💼</span>
                                                                                                                                                                                                                                                                                                                                    <span className="text-[10px]">PORTFOLIO</span>
                                                                                                                                                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                        }