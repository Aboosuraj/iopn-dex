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
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <div className="mx-auto max-w-3xl text-center">

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          Powerful Features
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Everything you need to trade smarter
        </h2>

        <p className="mt-5 text-base leading-7 text-white/60 md:text-lg">
          IOPn DEX brings token discovery, liquidity routing and wallet
          trading together in one simple Web3 experience.
        </p>

      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {features.map((feature) => (
          <div
            key={feature.title}
            className="
              group
              rounded-3xl
              border
              border-white/10
              bg-white/[0.04]
              p-7
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
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-cyan-400/20
                bg-cyan-400/10
                text-2xl
                transition
                group-hover:scale-105
              "
            >
              {feature.icon}
            </div>

            <h3 className="mt-6 text-xl font-bold">
              {feature.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/55">
              {feature.description}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
}