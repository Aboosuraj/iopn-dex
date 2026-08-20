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
        bg-black
        px-3
        transition
        duration-200
        hover:border-cyan-400/50
        hover:bg-[#050505]
        active:scale-[0.98]
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
          border
          border-cyan-400/20
          bg-cyan-500/10
          text-sm
          font-black
          text-cyan-400
        "
      >
        {symbol.charAt(0).toUpperCase()}
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
        className="shrink-0 text-white/40"
      />
    </button>
  );
}