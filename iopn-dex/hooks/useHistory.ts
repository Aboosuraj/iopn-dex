"use client";

import { useEffect, useState } from "react";

export function useHistory(address?: string) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!address) return;

    async function fetchHistory() {
      const res = await fetch(
        `http://localhost:4000/api/history?address=${address}`
      );

      const data = await res.json();
      setHistory(data);
    }

    fetchHistory();
  }, [address]);

  return history;
}