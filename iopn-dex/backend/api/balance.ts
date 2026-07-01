import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.iopn.testnet");

export async function getBalance(req: any, res: any) {
  const { address } = req.query;

  const balance = await provider.getBalance(address);

  res.json({
    balance: ethers.formatEther(balance),
  });
}