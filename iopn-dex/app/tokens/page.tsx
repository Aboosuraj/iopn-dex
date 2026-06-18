"use client";

import { TOKENS } from "@/lib/tokens";

export default function TokensPage() {
  return (
      <main className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">
                              Tokens
                                      </h1>

                                              <div className="grid gap-4">
                                                        {TOKENS.map((token) => (
                                                                    <div
                                                                                  key={token.address}
                                                                                                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                                                                                                            >
                                                                                                                          <div className="text-xl font-semibold">
                                                                                                                                          {token.symbol}
                                                                                                                                                        </div>

                                                                                                                                                                      <div className="text-sm text-zinc-400 break-all mt-2">
                                                                                                                                                                                      {token.address}
                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                  <div className="text-sm text-zinc-500 mt-2">
                                                                                                                                                                                                                                  Decimals: {token.decimals}
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                      ))}
                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                        </main>
                                                                                                                                                                                                                                                                                          );
                                                                                                                                                                                                                                                                                          }