export const FACTORY_ABI = [

  {
    type:"function",
    name:"allPairsLength",
    stateMutability:"view",
    inputs:[],
    outputs:[
      {
        type:"uint256"
      }
    ],
  },


  {
    type:"function",
    name:"allPairs",
    stateMutability:"view",
    inputs:[
      {
        name:"index",
        type:"uint256"
      }
    ],
    outputs:[
      {
        type:"address"
      }
    ],
  },


  {
    type:"function",
    name:"getPair",
    stateMutability:"view",
    inputs:[
      {
        name:"tokenA",
        type:"address"
      },
      {
        name:"tokenB",
        type:"address"
      }
    ],
    outputs:[
      {
        type:"address"
      }
    ],
  }

] as const;