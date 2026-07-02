"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startListener = startListener;
const provider_1 = require("./provider");
const Transaction_1 = __importDefault(require("../models/Transaction"));
function startListener(io) {
    console.log("🚀 Blockchain Listener Started...");
    provider_1.provider.on("block", async (blockNumber) => {
        const block = await provider_1.provider.getBlock(blockNumber, true);
        if (!block)
            return;
        for (const tx of block.transactions) {
            if (!tx.to)
                continue;
            const record = await Transaction_1.default.findOne({ hash: tx.hash });
            if (!record)
                continue;
            record.status = "confirmed";
            await record.save();
            // 🔥 REAL-TIME UPDATE TO FRONTEND
            io.emit("txConfirmed", {
                hash: tx.hash,
                status: "confirmed",
            });
            console.log("✅ CONFIRMED:", tx.hash);
        }
    });
}
