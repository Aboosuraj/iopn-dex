import express from "express";
import Transaction from "../models/Transaction";

const router = express.Router();

/* GET ALL TRANSACTIONS */
router.get("/", async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;