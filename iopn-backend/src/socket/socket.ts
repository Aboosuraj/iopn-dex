import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
      cors: {
            origin: "*",
                  methods: ["GET", "POST"]
                      }
                        });

                          io.on("connection", (socket) => {
                              console.log("🔌 User connected:", socket.id);

                                  socket.on("disconnect", () => {
                                        console.log("❌ User disconnected:", socket.id);
                                            });
                                              });

                                                console.log("⚡ Socket initialized");

                                                  return io;
                                                  };

                                                  export { io };