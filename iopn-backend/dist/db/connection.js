"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI not found in env");
        }
        await mongoose_1.default.connect(uri);
        console.log("🟢 MongoDB connected successfully");
    }
    catch (err) {
        console.error("❌ DB connection error:", err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
