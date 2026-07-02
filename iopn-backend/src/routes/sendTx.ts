import express from "express";
import Transaction from "../models/Transaction";

const router = express.Router();

/* ================= STORE TRANSACTION ONLY ================= */
router.post("/", async (req, res) => {
  try {
      const { from, to, amount, hash, token, chainId } = req.body;

          if (!hash || !from || !to || !amount) {
                return res.status(400).json({ error: "Missing fields" });
                    }

                        // prevent duplicates
                            const exists = await Transaction.findOne({ hash });
                                if (exists) {
                                      return res.json({ success: true, tx: exists });
                                          }

                                              const tx = await Transaction.create({
                                                    hash,
                                                          from,
                                                                to,
                                                                      amount,
                                                                            token: token || "OPN",
                                                                                  status: "pending",
                                                                                        chainId: chainId || 984,
                                                                                            });

                                                                                                return res.json({
                                                                                                      success: true,
                                                                                                            tx,
                                                                                                                });
                                                                                                                  } catch (err) {
                                                                                                                      console.error(err);
                                                                                                                          res.status(500).json({ error: "Failed to store transaction" });
                                                                                                                            }
                                                                                                                            });

                                                                                                                            export default router;