"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  BarChart3,
  ArrowLeftRight,
  Wallet,
  Settings,
} from "lucide-react";

const nav = [
  {
    href: "/app",
    label: "Home",
    icon: Home,
  },
  {
    href: "/market",
    label: "Market",
    icon: BarChart3,
  },
  {
    href: "/swap",
    label: "Swap",
    icon: ArrowLeftRight,
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: Wallet,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on landing page only
  if (pathname === "/") return null;

  return (
    <nav
      className="
        fixed
        bottom-4
        left-1/2
        z-50
        w-[94%]
        max-w-md
        -translate-x-1/2
        rounded-3xl
        border
        border-slate-200
        bg-white/90
        shadow-lg
        backdrop-blur-xl
        dark:border-white/10
        dark:bg-[#111827]/90
      "
    >
      <div className="flex justify-around py-3">
        {nav.map((item) => {
          const Icon = item.icon;

          const active =
            pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`rounded-xl p-2 transition ${
                  active
                    ? "bg-cyan-500 text-black"
                    : "text-slate-500 dark:text-white/50"
                }`}
              >
                <Icon size={20} />
              </div>

              <span
                className={`text-[11px] ${
                  active
                    ? "text-cyan-500 dark:text-cyan-400"
                    : "text-slate-400 dark:text-white/40"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}