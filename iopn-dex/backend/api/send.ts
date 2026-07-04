import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.iopn.testnet");

export async function sendTransaction(
  to: string,
    amount: string,
      privateKey: string
      ) {
        const wallet = new ethers.Wallet(privateKey, provider);

          const tx = await wallet.sendTransaction({
              to,
                  value: ethers.parseEther(amount),
                    });

                      return {
                          success: true,
                              hash: tx.hash,
                                };
                                }