import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.iopn.testnet");

export async function getBalance(address: string) {
  const balance = await provider.getBalance(address);

    return {
        balance: ethers.formatEther(balance),
          };
          }