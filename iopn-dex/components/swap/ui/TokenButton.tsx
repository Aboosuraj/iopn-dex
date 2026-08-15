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
        h-14
        shrink-0
        items-center
        gap-2
        rounded-2xl
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
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-cyan-500/15
          text-base
          font-black
          text-cyan-400
        "
      >
        {symbol.charAt(0)}
      </div>

      <span
        className="
          max-w-[72px]
          truncate
          text-sm
          font-bold
          text-white
        "
      >
        {symbol}
      </span>

      <ChevronDown
        size={17}
        className="shrink-0 text-white/40"
      />
    </button>
  );
}