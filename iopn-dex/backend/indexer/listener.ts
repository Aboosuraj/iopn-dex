import { ethers } from "ethers";
import Transaction from "../db/Transaction";
import { connectDB } from "../services/db";

const provider = new ethers.JsonRpcProvider(
  "https://testnet-rpc.iopn.tech"
);

export async function startListener(io?: any) {
  await connectDB();

  console.log("🚀 Listening on IOPN Testnet...");

  provider.on("block", async (blockNumber) => {
    try {
      const block = await provider.getBlock(blockNumber);

      if (!block || !block.transactions.length) return;

      for (const hash of block.transactions) {
        const tx = await provider.getTransaction(hash);

        if (!tx || !tx.to) continue;

        const exists = await Transaction.findOne({
          hash: tx.hash,
        });

        if (exists) continue;

        const saved = await Transaction.create({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          amount: tx.value.toString(),
          token: "OPN",
          status: "confirmed",
          chainId: 984,
        });

        if (io) {
          io.emit("newTx", saved);
        }

        console.log("Saved:", tx.hash);
      }
    } catch (err) {
      console.error(err);
    }
  });
}