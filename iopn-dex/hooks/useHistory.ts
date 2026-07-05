import { useEffect, useState } from "react";

const API = "https://iopndex.onrender.com";

export function useHistory(address?: string) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!address) return;

      const res = await fetch(`${API}/api/history?address=${address}`);
      const data = await res.json();

      setHistory(data);
    }

    load();
  }, [address]);

  return history;
}