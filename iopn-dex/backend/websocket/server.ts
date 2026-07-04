import { Server } from "socket.io";
import { startListener } from "./indexer/listener";

export function createSocket(server: any) {
  const io = new Server(server, {
      cors: {
            origin: "*",
                  methods: ["GET", "POST"],
                      },
                        });

                          startListener(io);

                            return io;
                            }