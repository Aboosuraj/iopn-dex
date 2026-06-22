import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const iopnTestnet = defineChain({
  id: 984,
    name: "IOPN Testnet",
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
                                                  name: "IOPN Explorer",
                                                        url: "https://testnet.iopn.tech",
                                                            },
                                                              },
                                                                testnet: true,
                                                                });

                                                                export const config = getDefaultConfig({
                                                                  appName: "IOPn Dex",
                                                                    projectId: "2f556cee5880c8a19600fcfc8238056d",
                                                                      chains: [iopnTestnet],
                                                                        ssr: true,
                                                                        });