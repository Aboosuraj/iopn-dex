import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        shadow-[0_0_40px_rgba(6,182,212,0.08)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}