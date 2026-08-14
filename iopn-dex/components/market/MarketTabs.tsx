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

const tabs = [
  {
    id: "trending",
    label: "🔥 Trending",
  },
  {
    id: "listed",
    label: "🪙 Listed",
  },
  {
    id: "gainers",
    label: "📈 Gainers",
  },
  {
    id: "losers",
    label: "📉 Losers",
  },
];

export default function MarketTabs({
  active,
  onChange,
}: Props) {
  return (
    <div className="mb-8 flex gap-3 overflow-x-auto">

      {tabs.map((tab) => (

        <button
          key={tab.id}
          onClick={() =>
            onChange(tab.id as MarketTab)
          }
          className={`
            rounded-full
            px-5
            py-3
            text-sm
            font-bold
            whitespace-nowrap
            transition
            ${
              active === tab.id
                ? "bg-cyan-500 text-black"
                : "border border-white/10 bg-white/[0.04] text-white hover:border-cyan-400/30"
            }
          `}
        >
          {tab.label}
        </button>

      ))}

    </div>
  );
}