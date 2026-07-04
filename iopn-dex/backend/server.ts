import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { getHistory } from "./api/history";
import { getBalance } from "./api/balance";
import { sendTransaction } from "./api/send";

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
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

                                                                              /* ================= SEND TX ================= */
                                                                              app.post("/api/send", async (req, res) => {
                                                                                try {
                                                                                    const { to, amount, privateKey } = req.body;

                                                                                        if (!to || !amount || !privateKey) {
                                                                                              return res.status(400).json({
                                                                                                      success: false,
                                                                                                              message: "Missing fields",
                                                                                                                    });
                                                                                                                        }

                                                                                                                            const result = await sendTransaction(to, amount, privateKey);

                                                                                                                                res.json(result);
                                                                                                                                  } catch (err: any) {
                                                                                                                                      res.status(500).json({
                                                                                                                                            success: false,
                                                                                                                                                  error: err.message,
                                                                                                                                                      });
                                                                                                                                                        }
                                                                                                                                                        });

                                                                                                                                                        /* ================= START ================= */
                                                                                                                                                        const PORT = process.env.PORT || 4000;

                                                                                                                                                        httpServer.listen(PORT, () => {
                                                                                                                                                          console.log("🚀 Backend running on", PORT);
                                                                                                                                                          });