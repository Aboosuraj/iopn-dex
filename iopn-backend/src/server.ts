import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import transactionRoutes from "./routes/transactions";
import sendTxRoute from "./routes/sendTx";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
      origin: "*",
        },
        });

        app.use(cors());
        app.use(express.json());

        /* ROUTES */
        app.use("/api/send", sendTxRoute);
        app.use("/api/tx", transactionRoutes);

        /* HEALTH CHECK */
        app.get("/", (req, res) => {
          res.json({
              status: "IOPN Backend Running 🚀",
                  chain: "IOPN Testnet",
                    });
                    });

                    /* SOCKET */
                    io.on("connection", (socket) => {
                      console.log("User connected:", socket.id);
                      });

                      export { app, server, io };