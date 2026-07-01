import { provider } from "../services/chain";
import Transaction from "../db/Transaction";

export function startListener(io: any) {
  console.log("🚀 IOPN Listener Running...");

  provider.on("block", async (blockNumber) => {
    const block = await provider.getBlock(blockNumber, true);

    if (!block) return;

    for (const tx of block.transactions) {
      if (!tx.to) continue;

      const exists = await Transaction.findOne({ hash: tx.hash });
      if (!exists) continue;

      exists.status = "confirmed";
      await exists.save();

      io.emit("txConfirmed", {
        hash: tx.hash,
        status: "confirmed",
      });
    }
  });
}