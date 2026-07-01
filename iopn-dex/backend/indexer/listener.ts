import { ethers } from "ethers";
import Transaction from "../db/Transaction";
import { connectDB } from "../services/db";

// IOPN Testnet RPC
const RPC_URL = "https://testnet-rpc.iopn.tech";

const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function startListener(io?: any) {
  await connectDB();

  console.log("🚀 IOPN Testnet Listener started...");

  provider.on("block", async (blockNumber: number) => {
    try {
      // Ethers v6
      const block = await provider.getBlock(blockNumber, true);

      if (!block) return;

      for (const tx of block.transactions) {
        // Skip if transaction object is missing or doesn't have a recipient
        if (typeof tx === "string") continue;
        if (!tx.to) continue;

        // Prevent duplicate records
        const exists = await Transaction.findOne({ hash: tx.hash });
        if (exists) continue;

        // Save transaction
        const savedTx = await Transaction.create({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          amount: tx.value.toString(),
          token: "OPN",
          status: "confirmed",
          chainId: 984,
          blockNumber: block.number,
          timestamp: new Date((block.timestamp ?? 0) * 1000),
        });

        // Emit socket event if Socket.IO is available
        if (io) {
          io.emit("newTx", savedTx);
        }

        console.log(`✅ Saved TX: ${tx.hash}`);
      }
    } catch (error) {
      console.error("Listener error:", error);
    }
  });
}