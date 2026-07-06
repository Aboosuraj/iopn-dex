"use client";

import { TOKENS } from "@/lib/tokens";

type Props = {
  value: string;
    onChange: (symbol: string) => void;
    };

    export default function TokenSelector({
      value,
        onChange,
        }: Props) {
          return (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                    <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-medium text-white">
                                      Select Token
                                              </p>

                                                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                                                                Supported
                                                                        </span>
                                                                              </div>

                                                                                    <select
                                                                                            value={value}
                                                                                                    onChange={(e) => onChange(e.target.value)}
                                                                                                            className="
                                                                                                                      w-full
                                                                                                                                rounded-xl
                                                                                                                                          border
                                                                                                                                                    border-white/10
                                                                                                                                                              bg-black/30
                                                                                                                                                                        p-3
                                                                                                                                                                                  text-white
                                                                                                                                                                                            outline-none
                                                                                                                                                                                                    "
                                                                                                                                                                                                          >
                                                                                                                                                                                                                  {TOKENS.map((token) => (
                                                                                                                                                                                                                            <option
                                                                                                                                                                                                                                        key={token.symbol}
                                                                                                                                                                                                                                                    value={token.symbol}
                                                                                                                                                                                                                                                                className="bg-neutral-900"
                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                      {token.symbol}
                                                                                                                                                                                                                                                                                                </option>
                                                                                                                                                                                                                                                                                                        ))}
                                                                                                                                                                                                                                                                                                              </select>

                                                                                                                                                                                                                                                                                                                    {/* Quick Token Chips */}

                                                                                                                                                                                                                                                                                                                          <div className="mt-4 flex flex-wrap gap-2">

                                                                                                                                                                                                                                                                                                                                  {TOKENS.map((token) => (
                                                                                                                                                                                                                                                                                                                                            <button
                                                                                                                                                                                                                                                                                                                                                        key={token.symbol}
                                                                                                                                                                                                                                                                                                                                                                    onClick={() => onChange(token.symbol)}
                                                                                                                                                                                                                                                                                                                                                                                className={`rounded-full px-3 py-1 text-xs transition ${
                                                                                                                                                                                                                                                                                                                                                                                              value === token.symbol
                                                                                                                                                                                                                                                                                                                                                                                                              ? "bg-green-500 text-black font-semibold"
                                                                                                                                                                                                                                                                                                                                                                                                                              : "bg-white/10 text-white hover:bg-white/20"
                                                                                                                                                                                                                                                                                                                                                                                                                                          }`}
                                                                                                                                                                                                                                                                                                                                                                                                                                                    >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                {token.symbol}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  ))}

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              }