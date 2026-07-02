import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY as string,
    new ethers.JsonRpcProvider("https://testnet-rpc.iopn.tech")
    );