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
    <section className="mx-auto max-w-7xl px-6 py-20">

      <div className="text-center">

        <p className="text-cyan-400 font-semibold uppercase tracking-widest">
          Simple Process
        </p>

        <h2 className="mt-3 text-4xl font-black">
          How It Works
        </h2>

        <p className="mt-4 text-white/60">
          Start trading on IOPn DEX in just a few simple steps.
        </p>

      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-3xl">
              {step.icon}
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-full bg-cyan-500 px-3 py-1 text-sm font-bold text-black">
                {index + 1}
              </span>

              <h3 className="text-xl font-bold">
                {step.title}
              </h3>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/60">
              {step.description}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}