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
      type="button"
      onClick={onClick}
      className="
        flex
        h-12
        shrink-0
        items-center
        gap-2
        rounded-xl
        border
        border-cyan-500/20
        bg-[#0f172a]
        px-3
        transition
        duration-200
        hover:border-cyan-400/50
        hover:bg-[#162033]
      "
    >
      {/* TOKEN ICON */}

      <div
        className="
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-gradient-to-br
          from-cyan-400
          to-violet-500
          text-xs
          font-black
          text-black
        "
      >
        {symbol.charAt(0)}
      </div>

      {/* TOKEN SYMBOL */}

      <span
        className="
          max-w-[64px]
          truncate
          text-sm
          font-bold
          text-white
        "
      >
        {symbol}
      </span>

      {/* ARROW */}

      <ChevronDown
        size={16}
        className="shrink-0 text-white/50"
      />
    </button>
  );
}