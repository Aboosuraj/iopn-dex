"use client";

import { TOKENS } from "@/lib/tokens";
import TokenCard from "./TokenCard";

interface Props {
  search: string;
}

export default function TokenList({
  search,
}: Props) {

  const filtered = TOKENS.filter((token) => {

    const q = search.toLowerCase();

    return (
      token.name.toLowerCase().includes(q) ||
      token.symbol.toLowerCase().includes(q) ||
      token.address.toLowerCase().includes(q)
    );

  });

  return (
    <div className="grid gap-5">

      {filtered.length === 0 ? (

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
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