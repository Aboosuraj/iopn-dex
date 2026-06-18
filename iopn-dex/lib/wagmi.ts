import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
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
                                                              });

                                                              export const config = createConfig({
                                                                chains: [iopnTestnet],
                                                                  connectors: [
                                                                      injected({
                                                                            shimDisconnect: true,
                                                                                }),
                                                                                  ],
                                                                                    transports: {
                                                                                        [984]: http("https://testnet-rpc.iopn.tech"),
                                                                                          },
                                                                                          });