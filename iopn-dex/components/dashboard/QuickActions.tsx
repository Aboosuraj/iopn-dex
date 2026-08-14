"use client";

import Link from "next/link";

const actions = [
  {
    title: "Swap",
    icon: "🔄",
    href: "/swap",
  },
  {
    title: "Market",
    icon: "📈",
    href: "/market",
  },
  {
    title: "Pay",
    icon: "💳",
    href: "/pay",
  },
  {
    title: "Bridge",
    icon: "🌉",
    href: "/bridge",
  },
  {
    title: "Liquidity",
    icon: "💧",
    href: "/liquidity",
  },
  {
    title: "Portfolio",
    icon: "💼",
    href: "/portfolio",
  },
];

export default function QuickActions() {
  return (
    <section className="mt-8">

      <h2 className="mb-5 text-2xl font-black">
        Quick Actions
      </h2>

      <div className="grid grid-cols-3 gap-4">

        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center transition hover:border-cyan-400/30 hover:bg-white/[0.08]"
          >
            <div className="text-3xl">{action.icon}</div>

            <p className="mt-3 text-sm font-bold">
              {action.title}
            </p>
          </Link>
        ))}

      </div>

    </section>
  );
}