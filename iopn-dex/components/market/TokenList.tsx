"use client";

import { TOKENS } from "@/lib/tokens";
import TokenCard from "./TokenCard";

interface Props {
  search: string;
}

export default function TokenList({
  search,
}: Props) {
  const q = search.trim().toLowerCase();

  const filtered = TOKENS.filter((token) => {
    return (
      token.name.toLowerCase().includes(q) ||
      token.symbol.toLowerCase().includes(q) ||
      token.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2">

      {filtered.length === 0 ? (
        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.035]
            p-8
            text-center
            text-sm
            text-white/40
            sm:col-span-2
          "
        >
          No token found.
        </div>
      ) : (
        filtered.map((token) => (
          <TokenCard
            key={token.address}
            token={token}
          />
        ))
      )}

    </div>
  );
}