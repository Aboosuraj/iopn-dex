"use client";

export default function Features() {
  const features = [
    {
      icon: "⚡",
      title: "Best Price Routing",
      description:
        "Find the best available swap route across supported DEX liquidity on IOPn Chain.",
    },
    {
      icon: "🔍",
      title: "Search by Token Name",
      description:
        "Find supported tokens quickly using their name or symbol.",
    },
    {
      icon: "📄",
      title: "Search by Contract Address",
      description:
        "Paste a token contract address to quickly find the corresponding asset.",
    },
    {
      icon: "🔄",
      title: "Lightning Fast Swaps",
      description:
        "Designed for fast token discovery, route selection and transaction execution.",
    },
    {
      icon: "🔐",
      title: "Secure Smart Contracts",
      description:
        "Users remain in control of their assets while transactions are confirmed through their connected wallet.",
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description:
        "A responsive trading experience designed for phones, tablets and desktop.",
    },
  ];

  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-6 py-10"
    >
      <div className="mx-auto max-w-2xl text-center">

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
          Powerful Features
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight">
          Everything you need to trade smarter
        </h2>

        <p className="mt-2 text-xs leading-5 text-white/60">
          IOPn DEX brings token discovery, liquidity routing and wallet
          trading together in one simple Web3 experience.
        </p>

      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {features.map((feature) => (
          <div
            key={feature.title}
            className="
              group
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              p-3
              backdrop-blur-xl
              transition
              duration-300
              hover:-translate-y-1
              hover:border-cyan-400/30
              hover:bg-white/[0.07]
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                border
                border-cyan-400/20
                bg-cyan-400/10
                text-sm
                transition
                group-hover:scale-105
              "
            >
              {feature.icon}
            </div>

            <h3 className="mt-3 text-sm font-bold">
              {feature.title}
            </h3>

            <p className="mt-1.5 text-[10px] leading-4 text-white/55">
              {feature.description}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
}