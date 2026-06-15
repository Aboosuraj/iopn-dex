import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

export const iopnChain = defineChain({
  id: 141319,
    name: "IOPn Chain",
      nativeCurrency: {
          decimals: 18,
              name: "IOPn",
                  symbol: "IOPn",
                    },
                      rpcUrls: {
                          default: {
                                http: ["https://rpc.iopn.tech"],
                                    },
                                      },
                                        blockExplorers: {
                                            default: {
                                                  name: "IOPn Explorer",
                                                        url: "https://explorer.iopn.tech",
                                                            },
                                                              },
                                                              });

                                                              export const config = createConfig({
                                                                chains: [iopnChain],
                                                                  connectors: [
                                                                      injected({
                                                                            shimDisconnect: true,
                                                                                }),
                                                                                  ],
                                                                                    transports: {
                                                                                        [iopnChain.id]: http(),
                                                                                          },
                                                                                          });