"use client";

import { useMemo, useState } from "react";

type Token = {
  symbol: string;
  address: string;
  decimals: number;
  native: boolean;
};

type Props = {
  open: boolean;
  tokens: Token[];
  onClose: () => void;
  onSelect: (token: Token) => void;
};

export default function TokenModal({
  open,
  tokens,
  onClose,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tokens.filter((t) => {
      const q = search.toLowerCase();

      return (
        t.symbol.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
      );
    });
  }, [search, tokens]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center">

      <div className="w-full max-w-md rounded-t-3xl md:rounded-3xl bg-[#171717] p-5">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-xl font-bold text-white">
            Select Token
          </h2>

          <button
            onClick={onClose}
            className="text-white text-2xl"
          >
            ×
          </button>

        </div>

        <input
          placeholder="Search token..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-xl bg-[#222] px-4 py-3 text-white outline-none"
        />

        <div className="max-h-96 overflow-y-auto space-y-2">

          {filtered.map((token) => (

            <button
              key={token.address}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl bg-[#222] p-4 hover:bg-[#2b2b2b]"
            >

              <div>

                <div className="font-semibold text-white">
                  {token.symbol}
                </div>

                <div className="text-xs text-gray-400 break-all">
                  {token.address}
                </div>

              </div>

              {token.native && (
                <span className="rounded bg-green-600 px-2 py-1 text-xs text-white">
                  Native
                </span>
              )}

            </button>

          ))}

          {filtered.length === 0 && (

            <div className="py-8 text-center text-gray-400">
              No token found
            </div>

          )}

        </div>

      </div>

    </div>
  );
}