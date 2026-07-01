import { ethers } from "ethers";

const RPC = "https://rpc.iopn.testnet";
const provider = new ethers.JsonRpcProvider(RPC);

export async function sendTx(req: any, res: any) {
  try {
    const { privateKey, to, amount } = req.body;

    const wallet = new ethers.Wallet(privateKey, provider);

    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount),
    });

    res.json({
      success: true,
      hash: tx.hash,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}