import { ethers } from "ethers";

export const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY as string,
  new ethers.JsonRpcProvider("https://testnet-rpc.iopn.tech")
);