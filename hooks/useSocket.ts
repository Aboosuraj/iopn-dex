import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // change later for production

export function useSocket(address?: string) {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("newTx", (tx) => {
      setTxs((prev) => [tx, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return txs;
}