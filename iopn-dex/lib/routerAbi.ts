export const ROUTER_ABI = [
      {
          type: "function",
              name: "getAmountsOut",
                  stateMutability: "view",
                      inputs: [
                            { name: "amountIn", type: "uint256" },
                                  { name: "path", type: "address[]" },
                                      ],
                                          outputs: [{ name: "amounts", type: "uint256[]" }],
                                            },

                                              {
                                                  type: "function",
                                                      name: "swapExactTokensForTokens",
                                                          stateMutability: "nonpayable",
                                                              inputs: [
                                                                    { name: "amountIn", type: "uint256" },
                                                                          { name: "amountOutMin", type: "uint256" },
                                                                                { name: "path", type: "address[]" },
                                                                                      { name: "to", type: "address" },
                                                                                            { name: "deadline", type: "uint256" },
                                                                                                ],
                                                                                                    outputs: [{ name: "amounts", type: "uint256[]" }],
                                                                                                      },

                                                                                                        {
                                                                                                            type: "function",
                                                                                                                name: "swapExactOPNForTokens",
                                                                                                                    stateMutability: "payable",
                                                                                                                        inputs: [
                                                                                                                              { name: "amountOutMin", type: "uint256" },
                                                                                                                                    { name: "path", type: "address[]" },
                                                                                                                                          { name: "to", type: "address" },
                                                                                                                                                { name: "deadline", type: "uint256" },
                                                                                                                                                    ],
                                                                                                                                                        outputs: [{ name: "amounts", type: "uint256[]" }],
                                                                                                                                                          },

                                                                                                                                                            {
                                                                                                                                                                type: "function",
                                                                                                                                                                    name: "swapExactTokensForOPN",
                                                                                                                                                                        stateMutability: "nonpayable",
                                                                                                                                                                            inputs: [
                                                                                                                                                                                  { name: "amountIn", type: "uint256" },
                                                                                                                                                                                        { name: "amountOutMin", type: "uint256" },
                                                                                                                                                                                              { name: "path", type: "address[]" },
                                                                                                                                                                                                    { name: "to", type: "address" },
                                                                                                                                                                                                          { name: "deadline", type: "uint256" },
                                                                                                                                                                                                              ],
                                                                                                                                                                                                                  outputs: [{ name: "amounts", type: "uint256[]" }],
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                    ] as const;