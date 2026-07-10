export const PAIR_ABI = [

  {
    type:"function",
    name:"token0",
    stateMutability:"view",
    inputs:[],
    outputs:[
      {
        type:"address"
      }
    ],
  },


  {
    type:"function",
    name:"token1",
    stateMutability:"view",
    inputs:[],
    outputs:[
      {
        type:"address"
      }
    ],
  },


  {
    type:"function",
    name:"getReserves",
    stateMutability:"view",
    inputs:[],
    outputs:[
      {
        name:"reserve0",
        type:"uint112"
      },
      {
        name:"reserve1",
        type:"uint112"
      },
      {
        name:"blockTimestampLast",
        type:"uint32"
      }
    ],
  },


  {
    type:"function",
    name:"totalSupply",
    stateMutability:"view",
    inputs:[],
    outputs:[
      {
        type:"uint256"
      }
    ],
  }

] as const;