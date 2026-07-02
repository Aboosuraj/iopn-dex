"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const router = express_1.default.Router();
/* ================= STORE TRANSACTION ONLY ================= */
router.post("/", async (req, res) => {
    try {
        const { from, to, amount, hash, token, chainId } = req.body;
        if (!hash || !from || !to || !amount) {
            return res.status(400).json({ error: "Missing fields" });
        }
        // prevent duplicates
        const exists = await Transaction_1.default.findOne({ hash });
        if (exists) {
            return res.json({ success: true, tx: exists });
        }
        const tx = await Transaction_1.default.create({
            hash,
            from,
            to,
            amount,
            token: token || "OPN",
            status: "pending",
            chainId: chainId || 984,
        });
        return res.json({
            success: true,
            tx,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to store transaction" });
    }
});
exports.default = router;
