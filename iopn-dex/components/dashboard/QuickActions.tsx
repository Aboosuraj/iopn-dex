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
    <section className="mt-7">
      <h2 className="mb-4 text-xl font-black">
        Quick Actions
      </h2>

      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                px-2
                py-3.5
                text-center
                transition
                hover:border-cyan-400/30
                hover:bg-white/[0.08]
                active:scale-[0.97]
              "
            >
              <div className="flex justify-center">
                <Icon
                  size={27}
                  className="text-cyan-400"
                  strokeWidth={2.2}
                />
              </div>

              <p className="mt-2 text-[11px] font-bold">
                {action.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}