import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

import transactionRoutes from "./routes/transactions";
import { startListener } from "./listener/listener";
import sendTxRoute from "./routes/sendTx";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/send", sendTxRoute);

app.get("/", (req, res) => {
  res.json({
    status: "IOPN Backend Running 🚀",
    chain: "IOPN Testnet",
    rpc: process.env.IOPN_RPC
  });
});

/* ================= ROUTES ================= */
app.use("/api/tx", transactionRoutes);

/* ================= SOCKET ================= */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

/* ================= DB CONNECT ================= */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB Error:", err);
  }
}

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);

  /* START BLOCKCHAIN LISTENER */
  startListener(io);
});