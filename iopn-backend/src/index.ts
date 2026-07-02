import express from "express";
import http from "http";
import dotenv from "dotenv";

import { connectDB } from "./db/connection";
import { initSocket } from "./socket/socket";
import { startListener } from "./blockchain/listener";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
      status: "IOPN Backend Running 🚀",
          chain: "IOPN Testnet"
            });
            });

            async function bootstrap() {
              await connectDB();

                const io = initSocket(server);

                  startListener(io);

                    server.listen(5000, () => {
                        console.log("🚀 Server running on port 5000");
                          });
                          }

                          bootstrap();