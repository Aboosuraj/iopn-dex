import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://iopndex.onrender.com";

export function useSocket() {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("newTx", (tx) => {
      setTxs((prev) => [tx, ...prev]);
    });

    socket.on("txConfirmed", (data) => {
      setTxs((prev) =>
        prev.map((t) =>
          t.hash === data.hash ? { ...t, status: "confirmed" } : t
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  return txs;
}