import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://testnet-rpc.iopn.tech"
  );

  export async function getBalance(address: string) {
    const balance = await provider.getBalance(address);

      return {
          success: true,
              balance: ethers.formatEther(balance),
                };
                }