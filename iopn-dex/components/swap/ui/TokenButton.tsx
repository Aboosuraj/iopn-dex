"use client";

import { ChevronDown } from "lucide-react";

interface Props {
  symbol: string;
  onClick: () => void;
}

export default function TokenButton({
  symbol,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-cyan-500/20
        bg-[#0f172a]
        px-4
        py-3
        transition
        hover:border-cyan-400
        hover:bg-[#162033]
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-cyan-500/15
          text-lg
          font-black
          text-cyan-400
        "
      >
        {symbol.charAt(0)}
      </div>

      <span className="font-bold text-white">
        {symbol}
      </span>

      <ChevronDown
        size={18}
        className="text-white/50"
      />
    </button>
  );
}