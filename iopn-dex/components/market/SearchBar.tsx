"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="mb-4">
      <div className="relative">

        <Search
          size={18}
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-white/30
          "
        />

        <input
          type="text"
          placeholder="Search tokens or contract..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            h-12
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/[0.035]
            pl-11
            pr-11
            text-sm
            text-white
            placeholder:text-white/30
            outline-none
            transition-all
            duration-200
            focus:border-cyan-400/40
            focus:bg-white/[0.05]
            focus:ring-1
            focus:ring-cyan-400/20
          "
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="
              absolute
              right-3
              top-1/2
              flex
              h-8
              w-8
              -translate-y-1/2
              items-center
              justify-center
              rounded-xl
              text-white/30
              transition
              hover:bg-white/[0.06]
              hover:text-white/70
            "
          >
            <X size={16} />
          </button>
        )}

      </div>
    </div>
  );
}