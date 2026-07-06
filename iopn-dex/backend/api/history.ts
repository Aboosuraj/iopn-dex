import { connectDB } from "../services/db";
import Transaction from "../db/Transaction";

export async function getHistory(address: string) {
  try {
      await connectDB();

          if (!address) {
                return {
                        success: false,
                                error: "Wallet address is required",
                                      };
                                          }

                                              const txs = await Transaction.find({
                                                    $or: [
                                                            { from: address },
                                                                    { to: address },
                                                                          ],
                                                                              })
                                                                                    .sort({ createdAt: -1 })
                                                                                          .lean();

                                                                                              return {
                                                                                                    success: true,
                                                                                                          history: txs,
                                                                                                              };
                                                                                                                } catch (err: any) {
                                                                                                                    console.error("History Error:", err);

                                                                                                                        return {
                                                                                                                              success: false,
                                                                                                                                    error: err.message,
                                                                                                                                          history: [],
                                                                                                                                              };
                                                                                                                                                }
                                                                                                                                                }