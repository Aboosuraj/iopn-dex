"use client";

interface TransactionCardProps {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  status: "success" | "failed";
  timestamp: number;
}

export default function TransactionCard({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  status,
  timestamp,
}: TransactionCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">

      <div className="flex items-center justify-between">

        <div>
          <h3 className="font-bold">
            {amountIn} {tokenIn}
          </h3>

          <p className="text-sm text-white/60">
            ↓
          </p>

          <h3 className="font-bold text-green-400">
            {amountOut} {tokenOut}
          </h3>
        </div>

        <div className="text-right">

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              status === "success"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {status.toUpperCase()}
          </span>

          <p className="mt-2 text-xs text-white/50">
            {new Date(timestamp).toLocaleString()}
          </p>

        </div>

      </div>

    </div>
  );
}