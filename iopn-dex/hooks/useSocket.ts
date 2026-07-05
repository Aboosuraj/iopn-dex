"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://iopndex.onrender.com"; // ✅ production URL

export function useSocket(address?: string) {
  const [txs, setTxs] = useState<any[]>([]);

    useEffect(() => {
        const socket: Socket = io(SOCKET_URL, {
              transports: ["websocket"],
                  });

                      socket.on("connect", () => {
                            console.log("Socket connected:", socket.id);
                                });

                                    socket.on("newTx", (tx) => {
                                          setTxs((prev) => [tx, ...prev]);
                                              });

                                                  socket.on("txConfirmed", (data) => {
                                                        setTxs((prev) =>
                                                                prev.map((tx) =>
                                                                          tx.hash === data.hash ? { ...tx, status: "confirmed" } : tx
                                                                                  )
                                                                                        );
                                                                                            });

                                                                                                // ✅ IMPORTANT: proper cleanup (fixes your error)
                                                                                                    return () => {
                                                                                                          socket.off("connect");
                                                                                                                socket.off("newTx");
                                                                                                                      socket.off("txConfirmed");
                                                                                                                            socket.disconnect();
                                                                                                                                };
                                                                                                                                  }, []);

                                                                                                                                    return txs;
                                                                                                                                    }