"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    exports.io = io = new socket_io_1.Server(server, {
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
exports.initSocket = initSocket;
