"use client";

import Link from "next/link";

import {
  ArrowLeftRight,
  Rocket,
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
    title: "Deploy",
    icon: Rocket,
    href: "/deploy",
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
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-black">
            Quick Actions
          </h2>

          <p className="mt-1 text-[10px] font-medium text-white/30">
            Access your most-used DEX tools
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                px-2
                py-3.5
                text-center
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-cyan-400/30
                hover:bg-white/[0.07]
                active:scale-[0.97]
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  right-[-20px]
                  top-[-20px]
                  h-14
                  w-14
                  rounded-full
                  bg-cyan-400/[0.05]
                  blur-2xl
                "
              />

              <div className="relative flex justify-center">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-400/10
                    bg-cyan-400/[0.06]
                    transition
                    group-hover:border-cyan-400/20
                    group-hover:bg-cyan-400/[0.1]
                  "
                >
                  <Icon
                    size={24}
                    className="text-cyan-400"
                    strokeWidth={2.2}
                  />
                </div>
              </div>

              <p
                className="
                  relative
                  mt-2
                  text-[11px]
                  font-bold
                  text-white/90
                "
              >
                {action.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}