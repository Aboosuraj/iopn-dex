import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/tx";

export function useHistory(address?: string) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(API);
      const data = await res.json();
      setHistory(data);
    }

    load();
  }, [address]);

  return history;
}