"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./db/connection");
const socket_1 = require("./socket/socket");
const listener_1 = require("./blockchain/listener");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({
        status: "IOPN Backend Running 🚀",
        chain: "IOPN Testnet"
    });
});
async function bootstrap() {
    await (0, connection_1.connectDB)();
    const io = (0, socket_1.initSocket)(server);
    (0, listener_1.startListener)(io);
    server.listen(5000, () => {
        console.log("🚀 Server running on port 5000");
    });
}
bootstrap();
