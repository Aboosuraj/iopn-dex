import { createPublicClient, http, formatUnits } from "viem";
import { iopnTestnet } from "./wagmi";

const ERC20_ABI = [
  {
      name: "name",
          type: "function",
              stateMutability: "view",
                  inputs: [],
                      outputs: [{ type: "string" }],
                        },
                          {
                              name: "symbol",
                                  type: "function",
                                      stateMutability: "view",
                                          inputs: [],
                                              outputs: [{ type: "string" }],
                                                },
                                                  {
                                                      name: "decimals",
                                                          type: "function",
                                                              stateMutability: "view",
                                                                  inputs: [],
                                                                      outputs: [{ type: "uint8" }],
                                                                        },
                                                                          {
                                                                              name: "totalSupply",
                                                                                  type: "function",
                                                                                      stateMutability: "view",
                                                                                          inputs: [],
                                                                                              outputs: [{ type: "uint256" }],
                                                                                                },
                                                                                                ] as const;

                                                                                                const client = createPublicClient({
                                                                                                  chain: iopnTestnet,
                                                                                                    transport: http("https://rpc.iopn.tech"),
                                                                                                    });

                                                                                                    export async function getTokenData(address: `0x${string}`) {
                                                                                                      try {
                                                                                                          const [name, symbol, decimals, totalSupply] =
                                                                                                                await Promise.all([
                                                                                                                        client.readContract({
                                                                                                                                  address,
                                                                                                                                            abi: ERC20_ABI,
                                                                                                                                                      functionName: "name",
                                                                                                                                                              }),
                                                                                                                                                                      client.readContract({
                                                                                                                                                                                address,
                                                                                                                                                                                          abi: ERC20_ABI,
                                                                                                                                                                                                    functionName: "symbol",
                                                                                                                                                                                                            }),
                                                                                                                                                                                                                    client.readContract({
                                                                                                                                                                                                                              address,
                                                                                                                                                                                                                                        abi: ERC20_ABI,
                                                                                                                                                                                                                                                  functionName: "decimals",
                                                                                                                                                                                                                                                          }),
                                                                                                                                                                                                                                                                  client.readContract({
                                                                                                                                                                                                                                                                            address,
                                                                                                                                                                                                                                                                                      abi: ERC20_ABI,
                                                                                                                                                                                                                                                                                                functionName: "totalSupply",
                                                                                                                                                                                                                                                                                                        }),
                                                                                                                                                                                                                                                                                                              ]);

                                                                                                                                                                                                                                                                                                                  return {
                                                                                                                                                                                                                                                                                                                        address,
                                                                                                                                                                                                                                                                                                                              name,
                                                                                                                                                                                                                                                                                                                                    symbol,
                                                                                                                                                                                                                                                                                                                                          totalSupply: formatUnits(totalSupply, decimals),
                                                                                                                                                                                                                                                                                                                                              };
                                                                                                                                                                                                                                                                                                                                                } catch (error) {
                                                                                                                                                                                                                                                                                                                                                    console.error("Token loading error:", error);

                                                                                                                                                                                                                                                                                                                                                        return {
                                                                                                                                                                                                                                                                                                                                                              address,
                                                                                                                                                                                                                                                                                                                                                                    name: "Unknown",
                                                                                                                                                                                                                                                                                                                                                                          symbol: "Unknown",
                                                                                                                                                                                                                                                                                                                                                                                totalSupply: "0",
                                                                                                                                                                                                                                                                                                                                                                                    };
                                                                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                                                                      }