"use client";

import TransactionCard from "./TransactionCard";
import { SwapTransaction } from "@/hooks/useTransactionHistory";

interface TransactionHistoryProps {
  transactions: SwapTransaction[];
}

export default function TransactionHistory({
  transactions,
}: TransactionHistoryProps) {

  return (

    <div className="mt-6">

      <h2 className="mb-4 text-xl font-bold">
        Recent Swaps
      </h2>

      {
        transactions.length === 0 ? (

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/50">

            No transactions yet.

          </div>

        ) : (

          <div className="space-y-3">

            {transactions.map((tx) => (

              <TransactionCard
                key={tx.id}
                tokenIn={tx.tokenIn}
                tokenOut={tx.tokenOut}
                amountIn={tx.amountIn}
                amountOut={tx.amountOut}
                status={tx.status}
                timestamp={tx.timestamp}
              />

            ))}

          </div>

        )
      }

    </div>

  );

}