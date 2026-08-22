export const ROUTER_POOL_ABI = [
  {
    type: "function",
    name: "WETH",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "address",
      },
    ],
  },

  {
    type: "function",
    name: "addLiquidityETH",
    stateMutability: "payable",
    inputs: [
      {
        name: "token",
        type: "address",
      },
      {
        name: "amountTokenDesired",
        type: "uint256",
      },
      {
        name: "amountTokenMin",
        type: "uint256",
      },
      {
        name: "amountETHMin",
        type: "uint256",
      },
      {
        name: "to",
        type: "address",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "amountToken",
        type: "uint256",
      },
      {
        name: "amountETH",
        type: "uint256",
      },
      {
        name: "liquidity",
        type: "uint256",
      },
    ],
  },
] as const;