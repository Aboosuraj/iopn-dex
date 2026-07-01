import express from "express";
import cors from "cors";

import { getHistory } from "./api/history";
import { getBalance } from "./api/balance";
import { sendTransaction } from "./api/send";

const app = express();

app.use(cors());
app.use(express.json());

/* ================= HISTORY ================= */
app.get("/api/history", async (req, res) => {
  const address = req.query.address as string;

  const data = await getHistory(address);
  res.json(data);
});

/* ================= BALANCE ================= */
app.get("/api/balance", async (req, res) => {
  const address = req.query.address as string;

  const data = await getBalance(address);
  res.json(data);
});

/* ================= SEND TX ================= */
app.post("/api/send", async (req, res) => {
  const { to, amount } = req.body;

  const result = await sendTransaction(to, amount);
  res.json(result);
});

/* ================= SERVER START ================= */
app.listen(4000, () => {
  console.log("🚀 Backend running on http://localhost:4000");
});