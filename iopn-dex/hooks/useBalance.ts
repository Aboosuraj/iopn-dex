"use client";

import { useEffect, useState } from "react";

export function useBalance(address?: string) {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (!address) return;

    async function fetchBalance() {
      const res = await fetch(
        `http://localhost:4000/api/balance?address=${address}`
      );

      const data = await res.json();
      setBalance(data.balance);
    }

    fetchBalance();
  }, [address]);

  return balance;
}