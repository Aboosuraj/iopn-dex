import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
      cors: {
            origin: "*",
                  methods: ["GET", "POST"]
                      }
                        });

                          io.on("connection", (socket) => {
                              console.log("🟢 Socket connected:", socket.id);

                                  socket.on("disconnect", () => {
                                        console.log("🔴 Socket disconnected:", socket.id);
                                            });
                                              });

                                                console.log("⚡ Socket initialized");
                                                };

                                                export const getIO = () => {
                                                  if (!io) throw new Error("Socket not initialized");
                                                    return io;
                                                    };