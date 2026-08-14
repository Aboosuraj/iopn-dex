"use client";

export default function Roadmap() {
  const phases = [
    {
      status: "completed",
      phase: "Phase 01",
      title: "Testnet Launch",
      description:
        "Launch the first IOPn DEX experience on the IOPn Testnet and establish the core trading infrastructure.",
    },
    {
      status: "completed",
      phase: "Phase 02",
      title: "Beta",
      description:
        "Introduce wallet connection, token discovery, portfolio tracking and the first trading experience.",
    },
    {
      status: "progress",
      phase: "Phase 03",
      title: "DEX Aggregation",
      description:
        "Connect supported IOPn liquidity sources and build intelligent routing for competitive swap execution.",
    },
    {
      status: "upcoming",
      phase: "Phase 04",
      title: "Mainnet",
      description:
        "Prepare the production deployment and migrate the application from Testnet to IOPn Mainnet.",
    },
    {
      status: "upcoming",
      phase: "Phase 05",
      title: "Advanced Trading",
      description:
        "Introduce features such as limit orders, advanced market tools and trading alerts.",
    },
    {
      status: "upcoming",
      phase: "Phase 06",
      title: "Ecosystem Expansion",
      description:
        "Expand into bridge infrastructure, mobile experiences and additional IOPn ecosystem integrations.",
    },
  ];

  return (
    <section
      id="roadmap"
      className="mx-auto max-w-7xl px-6 py-24"
    >
      <div className="mx-auto max-w-3xl text-center">

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          Roadmap
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Building the IOPn trading ecosystem
        </h2>

        <p className="mt-5 text-base leading-7 text-white/60 md:text-lg">
          Starting with Testnet and continuously expanding toward a
          complete decentralized trading ecosystem.
        </p>

      </div>

      <div className="relative mx-auto mt-16 max-w-4xl">

        <div className="absolute left-5 top-0 hidden h-full w-px bg-white/10 md:block" />

        <div className="space-y-8">

          {phases.map((item) => {

            const isCompleted = item.status === "completed";
            const isProgress = item.status === "progress";

            return (
              <div
                key={item.phase}
                className="relative flex gap-6"
              >
                <div
                  className={`
                    relative z-10
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    text-sm
                    font-black
                    ${
                      isCompleted
                        ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                        : isProgress
                          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                          : "border-white/10 bg-white/5 text-white/40"
                    }
                  `}
                >
                  {isCompleted ? "✓" : isProgress ? "•" : "○"}
                </div>

                <div
                  className="
                    flex-1
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-6
                    backdrop-blur-xl
                  "
                >
                  <div className="flex flex-wrap items-center gap-3">

                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                      {item.phase}
                    </span>

                    {isCompleted && (
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                        Completed
                      </span>
                    )}

                    {isProgress && (
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                        In Progress
                      </span>
                    )}

                    {!isCompleted && !isProgress && (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/40">
                        Upcoming
                      </span>
                    )}

                  </div>

                  <h3 className="mt-3 text-2xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/55">
                    {item.description}
                  </p>

                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}