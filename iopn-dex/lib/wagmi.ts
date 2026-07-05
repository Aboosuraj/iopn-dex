import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const IOPN_CHAIN = defineChain({
  id: 984,
    name: "OPN Testnet",

      nativeCurrency: {
          name: "OPN",
              symbol: "OPN",
                  decimals: 18,
                    },

                      rpcUrls: {
                          default: {
                                http: ["https://testnet-rpc.iopn.tech"],
                                    },
                                      },

                                        blockExplorers: {
                                            default: {
                                                  name: "OPN Explorer",
                                                        url: "https://testnet.iopn.tech",
                                                            },
                                                              },

                                                                testnet: true,
                                                                });

                                                                export const config = getDefaultConfig({
                                                                  appName: "IOPn Dex",
                                                                    projectId: "2f556cee5880c8a19600fcfc8238056d",
                                                                      chains: [IOPN_CHAIN],
                                                                        ssr: true,
                                                                        });