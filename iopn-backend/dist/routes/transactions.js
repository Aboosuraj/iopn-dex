"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const router = express_1.default.Router();
/* GET ALL TRANSACTIONS */
router.get("/", async (req, res) => {
    try {
        const txs = await Transaction_1.default.find().sort({ createdAt: -1 });
        res.json(txs);
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
