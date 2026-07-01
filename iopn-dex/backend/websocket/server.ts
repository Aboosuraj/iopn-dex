import { Server } from "socket.io";
import { startListener } from "./indexer/listener";

startListener(io);

export function createSocket(server: any) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected");

    socket.on("subscribe", (address) => {
      socket.join(address);
    });
  });

  return io;
}