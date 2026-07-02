"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startListener = startListener;
const chain_1 = require("../services/chain");
const Transaction_1 = __importDefault(require("../models/Transaction"));
function startListener(io) {
    console.log("🚀 IOPN Listener Running...");
    // Prevent duplicate listeners (VERY IMPORTANT for deploy/restart)
    chain_1.provider.removeAllListeners("block");
    chain_1.provider.on("block", async (blockNumber) => {
        console.log("📦 New Block:", blockNumber);
        try {
            const block = await chain_1.provider.getBlock(blockNumber, true);
            if (!block) {
                console.log("⚠️ Block not found:", blockNumber);
                return;
            }
            console.log("🔍 Transactions in block:", block.transactions.length);
            for (const tx of block.transactions) {
                try {
                    if (!tx.to || !tx.hash)
                        continue;
                    // Check DB
                    const exists = await Transaction_1.default.findOne({ hash: tx.hash });
                    if (!exists) {
                        // 🆕 Save new transaction (INDEXING)
                        await Transaction_1.default.create({
                            hash: tx.hash,
                            from: tx.from,
                            to: tx.to,
                            value: tx.value?.toString?.() || "0",
                            status: "pending",
                        });
                        console.log("🆕 New tx saved:", tx.hash);
                    }
                    else {
                        // ✅ Update confirmation
                        if (exists.status !== "confirmed") {
                            exists.status = "confirmed";
                            await exists.save();
                            io.emit("txConfirmed", {
                                hash: tx.hash,
                                status: "confirmed",
                            });
                            console.log("✅ Tx confirmed:", tx.hash);
                        }
                    }
                }
                catch (txErr) {
                    console.error("❌ TX error:", tx.hash, txErr);
                }
            }
        }
        catch (err) {
            console.error("❌ Listener block error:", err);
        }
    });
    // Health check (VERY IMPORTANT for production)
    setInterval(() => {
        console.log("🟢 Listener alive:", new Date().toISOString());
    }, 60000);
}
