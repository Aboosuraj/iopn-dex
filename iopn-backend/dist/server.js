"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const transactions_1 = __importDefault(require("./routes/transactions"));
const sendTx_1 = __importDefault(require("./routes/sendTx"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
exports.io = io;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
/* ROUTES */
app.use("/api/send", sendTx_1.default);
app.use("/api/tx", transactions_1.default);
/* HEALTH CHECK */
app.get("/", (req, res) => {
    res.json({
        status: "IOPN Backend Running 🚀",
        chain: "IOPN Testnet",
    });
});
/* SOCKET */
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
});
