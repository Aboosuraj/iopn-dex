"use client";

import { useState } from "react";

export interface SwapTransaction {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  hash: string;
  timestamp: number;
  status: "success" | "failed";
}

export function useTransactionHistory() {

  const [transactions, setTransactions] = useState<SwapTransaction[]>([]);

  function addTransaction(tx: SwapTransaction) {
    setTransactions((prev) => [tx, ...prev]);
  }

  return {
    transactions,
    addTransaction,
  };
}