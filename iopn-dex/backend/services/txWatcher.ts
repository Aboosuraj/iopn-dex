import { JsonRpcProvider } from "ethers";
import Transaction from "../db/Transaction";
import { io } from "../server";

const provider = new JsonRpcProvider(
  "https://testnet-rpc.iopn.tech"
  );

  export function startTransactionWatcher() {
    console.log("🚀 Transaction watcher started");

      setInterval(async () => {
          try {
                const pendingTxs = await Transaction.find({
                        status: "pending",
                              });

                                    for (const tx of pendingTxs) {
                                            try {
                                                      const receipt =
                                                                  await provider.getTransactionReceipt(tx.hash);

                                                                            if (receipt) {
                                                                                        tx.status = "confirmed";
                                                                                                    tx.blockNumber = receipt.blockNumber;
                                                                                                                tx.gasUsed = receipt.gasUsed.toString();
                                                                                                                            tx.explorerUrl =
                                                                                                                                          `https://testnet.iopn.tech/tx/${tx.hash}`;

                                                                                                                                                      await tx.save();

                                                                                                                                                                  console.log("✅ Confirmed TX:", tx.hash);

                                                                                                                                                                              /* ================= REALTIME UPDATE ================= */
                                                                                                                                                                                          io.emit("txConfirmed", {
                                                                                                                                                                                                        hash: tx.hash,
                                                                                                                                                                                                                      status: "confirmed",
                                                                                                                                                                                                                                    blockNumber: receipt.blockNumber,
                                                                                                                                                                                                                                                  gasUsed: receipt.gasUsed.toString(),
                                                                                                                                                                                                                                                              });
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                } catch (err) {
                                                                                                                                                                                                                                                                                          console.error("Watcher error:", tx.hash);
                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                            } catch (err) {
                                                                                                                                                                                                                                                                                                                  console.error("Watcher loop error:", err);
                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                        }, 15000); // every 15 seconds
                                                                                                                                                                                                                                                                                                                        }