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
      className="mx-auto max-w-4xl px-6 py-20"
    >
      {/* HEADER */}

      <div className="text-center">

        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">
          Roadmap
        </p>

        <h2 className="mt-3 text-3xl font-black md:text-4xl">
          Building the IOPn trading ecosystem
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/55">
          Starting with Testnet and continuously expanding toward a
          complete decentralized trading ecosystem.
        </p>

      </div>

      {/* ROADMAP */}

      <div className="mt-8 space-y-2.5">

        {phases.map((item) => {

          const isCompleted = item.status === "completed";
          const isProgress = item.status === "progress";

          return (
            <div
              key={item.phase}
              className="
                group
                relative
                overflow-hidden
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.035]
                px-3.5
                py-3
                backdrop-blur-xl
                transition-all
                duration-200
                hover:border-cyan-400/25
                hover:bg-white/[0.05]
              "
            >

              <div className="relative flex items-start gap-3">

                {/* STATUS ICON */}

                <div
                  className={`
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    text-[10px]
                    font-black
                    ${
                      isCompleted
                        ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                        : isProgress
                          ? "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300"
                          : "border-white/[0.08] bg-white/[0.03] text-white/25"
                    }
                  `}
                >
                  {isCompleted
                    ? "✓"
                    : isProgress
                      ? "•"
                      : "○"}
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">

                  {/* TOP */}

                  <div className="flex items-center gap-2">

                    <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/30">
                      {item.phase}
                    </span>

                    {isCompleted && (
                      <span className="rounded-full bg-emerald-400/[0.07] px-2 py-0.5 text-[7px] font-bold text-emerald-300">
                        Completed
                      </span>
                    )}

                    {isProgress && (
                      <span className="rounded-full bg-cyan-400/[0.07] px-2 py-0.5 text-[7px] font-bold text-cyan-300">
                        In Progress
                      </span>
                    )}

                    {!isCompleted && !isProgress && (
                      <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[7px] font-bold text-white/30">
                        Upcoming
                      </span>
                    )}

                  </div>

                  {/* TITLE */}

                  <h3 className="mt-1 text-sm font-bold text-white">
                    {item.title}
                  </h3>

                  {/* DESCRIPTION */}

                  <p className="mt-0.5 text-[10px] leading-4 text-white/45">
                    {item.description}
                  </p>

                </div>

              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
}