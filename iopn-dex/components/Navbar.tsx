"use client";

import Link from "next/link";

export default function Navbar() {
  return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
            <div className="flex justify-around items-center py-3">

                    <Link
                              href="/"
                                        className="flex flex-col items-center text-purple-400 hover:text-white transition"
                                                >
                                                          <span className="text-xl">🏠</span>
                                                                    <span className="text-xs font-semibold">Home</span>
                                                                            </Link>

                                                                                    <Link
                                                                                              href="/trade"
                                                                                                        className="flex flex-col items-center text-zinc-400 hover:text-white transition"
                                                                                                                >
                                                                                                                          <span className="text-xl">🔄</span>
                                                                                                                                    <span className="text-xs font-semibold">Trade</span>
                                                                                                                                            </Link>

                                                                                                                                                    <Link
                                                                                                                                                              href="/staking"
                                                                                                                                                                        className="flex flex-col items-center text-zinc-400 hover:text-white transition"
                                                                                                                                                                                >
                                                                                                                                                                                          <span className="text-xl">💎</span>
                                                                                                                                                                                                    <span className="text-xs font-semibold">Staking</span>
                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                    <Link
                                                                                                                                                                                                                              href="/analytics"
                                                                                                                                                                                                                                        className="flex flex-col items-center text-zinc-400 hover:text-white transition"
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                          <span className="text-xl">📊</span>
                                                                                                                                                                                                                                                                    <span className="text-xs font-semibold">Zone</span>
                                                                                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                                                                                    <Link
                                                                                                                                                                                                                                                                                              href="/portfolio"
                                                                                                                                                                                                                                                                                                        className="flex flex-col items-center text-zinc-400 hover:text-white transition"
                                                                                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                                                                          <span className="text-xl">💼</span>
                                                                                                                                                                                                                                                                                                                                    <span className="text-xs font-semibold">Portfolio</span>
                                                                                                                                                                                                                                                                                                                                            </Link>

                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                        }