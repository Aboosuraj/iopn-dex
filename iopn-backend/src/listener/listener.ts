import { ethers } from "ethers";
import Transaction from "../models/Transaction";

const provider = new ethers.JsonRpcProvider(process.env.IOPN_RPC);

export async function startListener(io?: any) {
  console.log("🚀 Listener starting...");

  try {
    await provider.getBlockNumber(); // TEST RPC FIRST
    console.log("✅ RPC connected");
  } catch (err) {
    console.log("❌ RPC failed, retrying...");
    return;
  }

  provider.on("block", async (blockNumber) => {
    try {
      const block = await provider.getBlock(blockNumber, true);

      if (!block || !block.transactions) return;

      for (const tx of block.transactions as any[]) {
        if (!tx.to) continue;

        const exists = await Transaction.findOne({ hash: tx.hash });
        if (exists) continue;

        const saved = await Transaction.create({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          amount: tx.value.toString(),
          token: "OPN",
          status: "confirmed",
          chainId: 984
        });

        io?.emit("newTx", saved);

        console.log("📦 TX:", tx.hash);
      }
    } catch (err) {
      console.log("Listener error:", err);
    }
  });
}