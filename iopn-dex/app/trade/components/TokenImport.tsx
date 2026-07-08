"use client";

import { useState } from "react";
import { getTokenData } from "@/lib/tokenData";

type Token = {
  symbol: string;
  address: string;
  decimals: number;
  native: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (token: Token) => void;
};

export default function TokenImport({
  open,
  onClose,
  onImport,
}: Props) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    try {
      setLoading(true);

      const token = await getTokenData(
        address as `0x${string}`
      );

      onImport({
        symbol: token.symbol,
        address: token.address,
        decimals: 18,
        native: false,
      });

      onClose();

    } catch {

      alert("Invalid token");

    } finally {

      setLoading(false);

    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center">

      <div className="w-full max-w-md rounded-t-3xl md:rounded-3xl bg-[#171717] p-5">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-bold text-white">
            Import Token
          </h2>

          <button
            onClick={onClose}
            className="text-white text-2xl"
          >
            ×
          </button>

        </div>

        <input
          placeholder="Paste token contract..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-xl bg-[#222] px-4 py-3 text-white outline-none"
        />

        <button
          onClick={handleImport}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
        >
          {loading ? "Loading..." : "Import Token"}
        </button>

      </div>
    </div>
  );
}