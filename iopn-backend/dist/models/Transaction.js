"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TransactionSchema = new mongoose_1.default.Schema({
    hash: String,
    from: String,
    to: String,
    amount: String,
    token: String,
    status: String,
    chainId: Number,
}, { timestamps: true });
exports.default = mongoose_1.default.model("Transaction", TransactionSchema);
