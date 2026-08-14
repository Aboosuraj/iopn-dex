"use client";

export default function LiveStats() {
  const stats = [
    {
      value: "$0",
      label: "Total Volume",
      color: "text-cyan-400",
    },
    {
      value: "0",
      label: "Total Swaps",
      color: "text-green-400",
    },
    {
      value: "0",
      label: "Total Users",
      color: "text-purple-400",
    },
    {
      value: "5+",
      label: "Supported Tokens",
      color: "text-yellow-400",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">

      <div className="text-center">

        <p className="text-cyan-400 font-semibold uppercase tracking-widest">
          Live Network Status
        </p>

        <h2 className="mt-3 text-4xl font-black">
          Network Statistics
        </h2>

        <p className="mt-4 text-white/60">
          Real-time statistics from the IOPn ecosystem.
        </p>

      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            <h3 className={`text-5xl font-black ${item.color}`}>
              {item.value}
            </h3>

            <p className="mt-4 text-white/60">
              {item.label}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}