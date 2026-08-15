"use client";

export type MarketTab =
  | "trending"
  | "listed"
  | "gainers"
  | "losers";

interface Props {
  active: MarketTab;
  onChange: (tab: MarketTab) => void;
}

const tabs: {
  id: MarketTab;
  label: string;
}[] = [
  {
    id: "trending",
    label: "Trending",
  },
  {
    id: "listed",
    label: "Listed",
  },
  {
    id: "gainers",
    label: "Gainers",
  },
  {
    id: "losers",
    label: "Losers",
  },
];

export default function MarketTabs({
  active,
  onChange,
}: Props) {
  return (
    <div
      className="
        mb-4
        flex
        gap-2
        overflow-x-auto
        pb-1
        scrollbar-none
      "
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              shrink-0
              rounded-xl
              px-4
              py-2.5
              text-xs
              font-bold
              transition-all
              duration-200
              ${
                isActive
                  ? "bg-cyan-500 text-black shadow-[0_6px_20px_rgba(6,182,212,.12)]"
                  : "border border-white/10 bg-white/[0.035] text-white/50 hover:border-cyan-400/25 hover:bg-cyan-400/[0.05] hover:text-white"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}