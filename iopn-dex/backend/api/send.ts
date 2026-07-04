import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://testnet-rpc.iopn.tech"
  );

  export async function sendTransaction(
    to: string,
      amount: string,
        privateKey: string
        ) {
          try {
              const wallet = new ethers.Wallet(privateKey, provider);

                  const tx = await wallet.sendTransaction({
                        to,
                              value: ethers.parseEther(amount),
                                  });

                                      return {
                                            success: true,
                                                  hash: tx.hash,
                                                      };
                                                        } catch (err: any) {
                                                            return {
                                                                  success: false,
                                                                        error: err.message,
                                                                            };
                                                                              }
                                                                              }