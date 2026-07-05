import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({ status: "IOPN Backend Running 🚀" });
});

/* ================= BALANCE ================= */
app.get("/api/balance", async (req, res) => {
  try {
    const address = req.query.address as string;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Missing address",
      });
    }

    res.json({
      success: true,
      balance: "579.8008",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ================= HISTORY ================= */
app.get("/api/history", async (req, res) => {
  res.json([]);
});

/* ================= SEND TX ================= */
app.post("/api/send", async (req, res) => {
  try {
    const { to, amount, from, token, hash, chainId } = req.body;

    if (!to || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const tx = {
      to,
      from,
      amount,
      token,
      hash,
      chainId,
      status: "pending",
      time: new Date().toISOString(),
    };

    console.log("NEW TX:", tx);

    /* emit realtime event */
    io.emit("newTx", tx);

    /* simulate confirmation */
    setTimeout(() => {
      io.emit("txConfirmed", { hash: tx.hash });
    }, 5000);

    res.json({
      success: true,
      message: "Transaction recorded",
      tx,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log("🚀 Backend running on", PORT);
});