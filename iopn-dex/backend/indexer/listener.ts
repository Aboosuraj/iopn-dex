import { ethers } from "ethers";
import Transaction from "../db/Transaction";
import { connectDB } from "../services/db";

const RPC = "https://rpc.iopn.testnet"; // IOPN chain
const provider = new ethers.JsonRpcProvider(RPC);

export async function startListener(io?:any) {
  await connectDB();

  console.log("🚀 IOPN Listener started...");

  provider.on("block", async (blockNumber) => {
    const block = await provider.getBlock(blockNumber, true);

    for (const tx of block.transactions) {
      if (!tx.to) continue;

      await Transaction.create({
        io.to(tx.to).emit("newTx", tx);
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: tx.value.toString(),
        token: "OPN",
        status: "confirmed",
        chainId: 1234,
      });

      console.log("📦 Tx saved:", tx.hash);
    }
  });
}