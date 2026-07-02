"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = void 0;
const ethers_1 = require("ethers");
exports.provider = new ethers_1.ethers.JsonRpcProvider("https://testnet-rpc.iopn.tech");
