"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet = void 0;
const ethers_1 = require("ethers");
exports.wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, new ethers_1.ethers.JsonRpcProvider("https://testnet-rpc.iopn.tech"));
