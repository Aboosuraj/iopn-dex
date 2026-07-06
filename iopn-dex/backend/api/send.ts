import { connectDB } from "../services/db";
import Transaction from "../db/Transaction";

export async function sendTransaction(data: any) {
  try {
      await connectDB();

          // Prevent duplicate transactions
              const existing = await Transaction.findOne({
                    hash: data.hash,
                        });

                            if (existing) {
                                  return {
                                          success: true,
                                                  tx: existing,
                                                          message: "Transaction already exists",
                                                                };
                                                                    }

                                                                        const tx = await Transaction.create({
                                                                              hash: data.hash,
                                                                                    from: data.from,
                                                                                          to: data.to,
                                                                                                amount: data.amount,
                                                                                                      token: data.token || "OPN",
                                                                                                            chainId: data.chainId || 984,
                                                                                                                  status: "pending",
                                                                                                                      });

                                                                                                                          return {
                                                                                                                                success: true,
                                                                                                                                      message: "Transaction saved successfully",
                                                                                                                                            tx,
                                                                                                                                                };
                                                                                                                                                  } catch (err: any) {
                                                                                                                                                      console.error(err);

                                                                                                                                                          return {
                                                                                                                                                                success: false,
                                                                                                                                                                      error: err.message,
                                                                                                                                                                          };
                                                                                                                                                                            }
                                                                                                                                                                            }