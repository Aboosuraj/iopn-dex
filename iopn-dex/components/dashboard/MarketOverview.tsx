"use client";

export default function MarketOverview() {
  const stats = [
    {
      title: "Total Volume",
      value: "$0",
      color: "text-cyan-400",
    },
    {
      title: "Total Swaps",
      value: "0",
      color: "text-green-400",
    },
    {
      title: "Listed Tokens",
      value: "5+",
      color: "text-yellow-400",
    },
    {
      title: "DEXs",
      value: "1",
      color: "text-purple-400",
    },
  ];

  return (
    <section className="mt-10">

      <h2 className="mb-5 text-2xl font-black">
        Market Overview
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {stats.map((item) => (

          <div
            key={item.title}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
          >

            <p className="text-sm text-white/50">
              {item.title}
            </p>

            <h3 className={`mt-3 text-3xl font-black ${item.color}`}>
              {item.value}
            </h3>

          </div>

        ))}

      </div>

    </section>
  );
}