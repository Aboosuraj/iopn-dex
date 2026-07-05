import { defineChain } from "viem";

export const IOPN_CHAIN = defineChain({
  id: 984,
    name: "IOPN Testnet",
      nativeCurrency: {
          name: "IOPN",
              symbol: "OPN",
                  decimals: 18,
                    },
                      rpcUrls: {
                          default: {
                                http: ["https://testnet-rpc.iopn.tech"],
                                    },
                                      },
                                      });