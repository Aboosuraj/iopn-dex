"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export function useSocket(address?: string) {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    if (!address) return;

    socket.emit("subscribe", address);

    socket.on("newTx", (data) => {
      setTxs((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("newTx");
    };
  }, [address]);

  return txs;
}