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

  // Hide on landing page
  if (pathname === "/") {
    return null;
  }

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-white/[0.08]
        bg-[#050816]/95
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-xl
          items-center
          justify-around
          px-3
          py-2.5
        "
      >
        {nav.map((item) => {
          const Icon = item.icon;

          const active = pathname.startsWith(item.href);

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
                    : "text-white/50"
                }`}
              >
                <Icon size={20} />
              </div>

              <span
                className={`text-[11px] ${
                  active
                    ? "text-cyan-400"
                    : "text-white/40"
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