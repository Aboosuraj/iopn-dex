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
  }

] as const;