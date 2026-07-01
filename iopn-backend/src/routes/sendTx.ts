import express from "express";
import { wallet } from "../services/signer";
import Transaction from "../db/Transaction";

const router = express.Router();

/* ================= REAL WEB3 SEND ================= */
router.post("/", async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!to || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // convert ETH amount
    const txResponse = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount.toString()),
    });

    // save pending tx
    const tx = await Transaction.create({
      hash: txResponse.hash,
      from,
      to,
      amount,
      token: "OPN",
      status: "pending",
      chainId: 984,
    });

    return res.json({
      success: true,
      tx,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transaction failed" });
  }
});

export default router;