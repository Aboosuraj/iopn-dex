"use client";

export default function HowItWorks() {
  const steps = [
    {
      icon: "🔗",
      title: "Connect Wallet",
      description:
        "Securely connect your wallet using RainbowKit to access all IOPn DEX features.",
    },
    {
      icon: "🔍",
      title: "Search Token",
      description:
        "Search any supported token instantly by name, symbol, or contract address.",
    },
    {
      icon: "📊",
      title: "Review Best Route",
      description:
        "IOPn DEX compares supported liquidity sources to find the best available price.",
    },
    {
      icon: "🚀",
      title: "Confirm Swap",
      description:
        "Review the transaction, approve it in your wallet, and complete your swap securely.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">

      <div className="text-center">

        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Simple Process
        </p>

        <h2 className="mt-2 text-2xl font-black">
          How It Works
        </h2>

        <p className="mt-2 text-xs text-white/60">
          Start trading on IOPn DEX in just a few simple steps.
        </p>

      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-4">

        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-lg">
              {step.icon}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-black">
                {index + 1}
              </span>

              <h3 className="text-sm font-bold">
                {step.title}
              </h3>
            </div>

            <p className="mt-2 text-xs leading-5 text-white/60">
              {step.description}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}