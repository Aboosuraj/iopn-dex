"use client";

import Link from "next/link";

import {
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  Waypoints,
  Droplets,
  Briefcase,
} from "lucide-react";

const actions = [
  {
    title: "Swap",
    icon: ArrowLeftRight,
    href: "/swap",
  },
  {
    title: "Market",
    icon: BarChart3,
    href: "/market",
  },
  {
    title: "Pay",
    icon: CreditCard,
    href: "/pay",
  },
  {
    title: "Bridge",
    icon: Waypoints,
    href: "/bridge",
  },
  {
    title: "Liquidity",
    icon: Droplets,
    href: "/liquidity",
  },
  {
    title: "Portfolio",
    icon: Briefcase,
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
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center transition hover:border-cyan-400/30 hover:bg-white/[0.08]"
            >
              <div className="flex justify-center">
                <Icon
                  size={34}
                  className="text-cyan-400"
                  strokeWidth={2.2}
                />
              </div>

              <p className="mt-3 text-sm font-bold">
                {action.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}