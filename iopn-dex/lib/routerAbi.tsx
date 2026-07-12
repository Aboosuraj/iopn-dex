export const ROUTER_ABI = [

  // Get output amount
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
      },
      {
        name: "path",
        type: "address[]",
      },
    ],
    outputs: [
      {
        name: "amounts",
        type: "uint256[]",
      },
    ],
  },


  // Get required input amount
  {
    type: "function",
    name: "getAmountsIn",
    stateMutability: "view",
    inputs: [
      {
        name: "amountOut",
        type: "uint256",
      },
      {
        name: "path",
        type: "address[]",
      },
    ],
    outputs: [
      {
        name: "amounts",
        type: "uint256[]",
      },
    ],
  },


  // Token -> Token
  {
    type: "function",
    name: "swapExactTokensForTokens",
    stateMutability: "nonpayable",
    inputs: [

      {
        name:"amountIn",
        type:"uint256"
      },

      {
        name:"amountOutMin",
        type:"uint256"
      },

      {
        name:"path",
        type:"address[]"
      },

      {
        name:"to",
        type:"address"
      },

      {
        name:"deadline",
        type:"uint256"
      }

    ],
    outputs:[
      {
        name:"amounts",
        type:"uint256[]"
      }
    ],
  },


  // Native OPN -> Token
  {
    type:"function",
    name:"swapExactOPNForTokens",
    stateMutability:"payable",
    inputs:[

      {
        name:"amountOutMin",
        type:"uint256"
      },

      {
        name:"path",
        type:"address[]"
      },

      {
        name:"to",
        type:"address"
      },

      {
        name:"deadline",
        type:"uint256"
      }

    ],
    outputs:[
      {
        name:"amounts",
        type:"uint256[]"
      }
    ],
  },


  // Token -> Native OPN
  {
    type:"function",
    name:"swapExactTokensForOPN",
    stateMutability:"nonpayable",
    inputs:[

      {
        name:"amountIn",
        type:"uint256"
      },

      {
        name:"amountOutMin",
        type:"uint256"
      },

      {
        name:"path",
        type:"address[]"
      },

      {
        name:"to",
        type:"address"
      },

      {
        name:"deadline",
        type:"uint256"
      }

    ],
    outputs:[
      {
        name:"amounts",
        type:"uint256[]"
      }
    ],
  },


  // Router WOPN address
  {
    type:"function",
    name:"WOPN",
    stateMutability:"view",
    inputs:[],
    outputs:[
      {
        type:"address"
      }
    ],
  },


  // Factory address
  {
    type:"function",
    name:"factory",
    stateMutability:"view",
    inputs:[],
    outputs:[
      {
        type:"address"
      }
    ],
  },



  // ==========================
  // LIQUIDITY FUNCTIONS
  // ==========================



  // Add Token + Token liquidity
  {
    type:"function",
    name:"addLiquidity",
    stateMutability:"nonpayable",

    inputs:[

      {
        name:"tokenA",
        type:"address"
      },

      {
        name:"tokenB",
        type:"address"
      },

      {
        name:"amountADesired",
        type:"uint256"
      },

      {
        name:"amountBDesired",
        type:"uint256"
      },

      {
        name:"amountAMin",
        type:"uint256"
      },

      {
        name:"amountBMin",
        type:"uint256"
      },

      {
        name:"to",
        type:"address"
      },

      {
        name:"deadline",
        type:"uint256"
      }

    ],

    outputs:[

      {
        name:"amountA",
        type:"uint256"
      },

      {
        name:"amountB",
        type:"uint256"
      },

      {
        name:"liquidity",
        type:"uint256"
      }

    ],

  },





  // Add OPN + Token liquidity
  {
    type:"function",
    name:"addLiquidityOPN",
    stateMutability:"payable",

    inputs:[

      {
        name:"token",
        type:"address"
      },

      {
        name:"amountTokenDesired",
        type:"uint256"
      },

      {
        name:"amountTokenMin",
        type:"uint256"
      },

      {
        name:"amountOPNMin",
        type:"uint256"
      },

      {
        name:"to",
        type:"address"
      },

      {
        name:"deadline",
        type:"uint256"
      }

    ],

    outputs:[

      {
        name:"amountToken",
        type:"uint256"
      },

      {
        name:"amountOPN",
        type:"uint256"
      },

      {
        name:"liquidity",
        type:"uint256"
      }

    ],

  },





  // Remove Token + Token liquidity
  {
    type:"function",
    name:"removeLiquidity",
    stateMutability:"nonpayable",

    inputs:[

      {
        name:"tokenA",
        type:"address"
      },

      {
        name:"tokenB",
        type:"address"
      },

      {
        name:"liquidity",
        type:"uint256"
      },

      {
        name:"amountAMin",
        type:"uint256"
      },

      {
        name:"amountBMin",
        type:"uint256"
      },

      {
        name:"to",
        type:"address"
      },

      {
        name:"deadline",
        type:"uint256"
      }

    ],

    outputs:[

      {
        name:"amountA",
        type:"uint256"
      },

      {
        name:"amountB",
        type:"uint256"
      }

    ],

  },





  // Remove OPN + Token liquidity
  {
    type:"function",
    name:"removeLiquidityOPN",
    stateMutability:"nonpayable",

    inputs:[

      {
        name:"token",
        type:"address"
      },

      {
        name:"liquidity",
        type:"uint256"
      },

      {
        name:"amountTokenMin",
        type:"uint256"
      },

      {
        name:"amountOPNMin",
        type:"uint256"
      },

      {
        name:"to",
        type:"address"
      },

      {
        name:"deadline",
        type:"uint256"
      }

    ],

    outputs:[

      {
        name:"amountToken",
        type:"uint256"
      },

      {
        name:"amountOPN",
        type:"uint256"
      }

    ],

  }

  {
  type: "function",
  name: "removeLiquidity",
  stateMutability: "nonpayable",
  inputs: [
    { name: "tokenA", type: "address" },
    { name: "tokenB", type: "address" },
    { name: "liquidity", type: "uint256" },
    { name: "amountAMin", type: "uint256" },
    { name: "amountBMin", type: "uint256" },
    { name: "to", type: "address" },
    { name: "deadline", type: "uint256" }
  ],
  outputs: [
    { type: "uint256" },
    { type: "uint256" }
  ]
},

{
  type: "function",
  name: "removeLiquidityOPN",
  stateMutability: "nonpayable",
  inputs: [
    { name: "token", type: "address" },
    { name: "liquidity", type: "uint256" },
    { name: "amountTokenMin", type: "uint256" },
    { name: "amountOPNMin", type: "uint256" },
    { name: "to", type: "address" },
    { name: "deadline", type: "uint256" }
  ],
  outputs: [
    { type: "uint256" },
    { type: "uint256" }
  ]
},

] as const;