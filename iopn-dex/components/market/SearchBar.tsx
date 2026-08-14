"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="mb-8">

      <div className="relative">

        <input
          type="text"
          placeholder="Search token name, symbol or contract..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            px-5
            py-4
            text-white
            placeholder:text-white/40
            outline-none
            transition
            focus:border-cyan-400
          "
        />

      </div>

    </div>
  );
}