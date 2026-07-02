"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, new ethers_1.ethers.JsonRpcProvider("https://testnet-rpc.iopn.tech"));
