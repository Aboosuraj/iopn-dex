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
        bg-white
        px-3
        text-slate-900
        transition
        duration-200
        hover:border-cyan-400/50
        hover:bg-cyan-50
        dark:bg-[#0f172a]
        dark:text-white
        dark:hover:bg-[#162033]
      "
    >
      {/* TOKEN ICON */}

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-cyan-500/10
          text-sm
          font-black
          text-cyan-600
          dark:bg-cyan-500/15
          dark:text-cyan-400
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
          text-slate-900
          dark:text-white
        "
      >
        {symbol}
      </span>

      {/* ARROW */}

      <ChevronDown
        size={16}
        className="
          shrink-0
          text-slate-400
          dark:text-white/40
        "
      />
    </button>
  );
}