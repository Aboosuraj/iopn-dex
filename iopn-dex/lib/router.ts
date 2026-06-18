export const ROUTER_ADDRESS =
  "0xe3Bb1A8Fca436599A6FA15908e8a01767c565BCc";

  export const WOPN =
    "0xeb69FE376bA27B1105509aB46BdB56267134a318";

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
                                                                                                      ] as const;