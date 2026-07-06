import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./services/db";

import { getHistory } from "./api/history";
import { getBalance } from "./api/balance";
import { sendTransaction } from "./api/send";

import { startTransactionWatcher } from "./services/txWatcher";

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
      origin: "*",
        },
        });

        /* ================= HEALTH ================= */

        app.get("/", (_, res) => {
          res.json({
              status: "IOPN Backend Running 🚀",
                  chain: "IOPN Testnet",
                    });
                    });

                    /* ================= BALANCE ================= */

                    app.get("/api/balance", async (req, res) => {
                      try {
                          const address = req.query.address as string;

                              const data = await getBalance(address);

                                  res.json(data);
                                    } catch (err: any) {
                                        res.status(500).json({
                                              success: false,
                                                    error: err.message,
                                                        });
                                                          }
                                                          });

                                                          /* ================= HISTORY ================= */

                                                          app.get("/api/history", async (req, res) => {
                                                            try {
                                                                const address = req.query.address as string;

                                                                    const data = await getHistory(address);

                                                                        res.json(data);
                                                                          } catch (err: any) {
                                                                              res.status(500).json({
                                                                                    success: false,
                                                                                          error: err.message,
                                                                                              });
                                                                                                }
                                                                                                });

                                                                                                /* ================= SEND ================= */

                                                                                                app.post("/api/send", async (req, res) => {
                                                                                                  try {
                                                                                                      const {
                                                                                                            from,
                                                                                                                  to,
                                                                                                                        amount,
                                                                                                                              token,
                                                                                                                                    hash,
                                                                                                                                          chainId,
                                                                                                                                              } = req.body;

                                                                                                                                                  if (!from || !to || !amount || !hash) {
                                                                                                                                                        return res.status(400).json({
                                                                                                                                                                success: false,
                                                                                                                                                                        message: "Missing required fields",
                                                                                                                                                                              });
                                                                                                                                                                                  }

                                                                                                                                                                                      const result = await sendTransaction({
                                                                                                                                                                                            from,
                                                                                                                                                                                                  to,
                                                                                                                                                                                                        amount,
                                                                                                                                                                                                              token,
                                                                                                                                                                                                                    hash,
                                                                                                                                                                                                                          chainId,
                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                  if (result.success) {
                                                                                                                                                                                                                                        io.emit("newTx", {
                                                                                                                                                                                                                                                from,
                                                                                                                                                                                                                                                        to,
                                                                                                                                                                                                                                                                amount,
                                                                                                                                                                                                                                                                        token,
                                                                                                                                                                                                                                                                                hash,
                                                                                                                                                                                                                                                                                        chainId,
                                                                                                                                                                                                                                                                                                status: "pending",
                                                                                                                                                                                                                                                                                                        createdAt: new Date(),
                                                                                                                                                                                                                                                                                                              });
                                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                                      res.json(result);
                                                                                                                                                                                                                                                                                                                        } catch (err: any) {
                                                                                                                                                                                                                                                                                                                            res.status(500).json({
                                                                                                                                                                                                                                                                                                                                  success: false,
                                                                                                                                                                                                                                                                                                                                        error: err.message,
                                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                                                                                                                              /* ================= START ================= */

                                                                                                                                                                                                                                                                                                                                              const PORT = Number(process.env.PORT) || 5000;

                                                                                                                                                                                                                                                                                                                                              async function startServer() {
                                                                                                                                                                                                                                                                                                                                                try {
                                                                                                                                                                                                                                                                                                                                                    await connectDB();

                                                                                                                                                                                                                                                                                                                                                        console.log("✅ MongoDB Connected");

                                                                                                                                                                                                                                                                                                                                                            httpServer.listen(PORT, () => {
                                                                                                                                                                                                                                                                                                                                                                  console.log(`🚀 Backend running on ${PORT}`);

                                                                                                                                                                                                                                                                                                                                                                        /*
                                                                                                                                                                                                                                                                                                                                                                               * Starts checking pending blockchain transactions
                                                                                                                                                                                                                                                                                                                                                                                      * every 15 seconds.
                                                                                                                                                                                                                                                                                                                                                                                             */
                                                                                                                                                                                                                                                                                                                                                                                                   startTransactionWatcher();
                                                                                                                                                                                                                                                                                                                                                                                                       });
                                                                                                                                                                                                                                                                                                                                                                                                         } catch (err) {
                                                                                                                                                                                                                                                                                                                                                                                                             console.error("❌ Failed to start backend:", err);
                                                                                                                                                                                                                                                                                                                                                                                                                 process.exit(1);
                                                                                                                                                                                                                                                                                                                                                                                                                   }
                                                                                                                                                                                                                                                                                                                                                                                                                   }

                                                                                                                                                                                                                                                                                                                                                                                                                   startServer();