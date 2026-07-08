import { ROUTER_ADDRESS } from "@/lib/router";
import { ROUTER_ABI } from "@/lib/routerAbi";


type SwapParams = {
  writeContract: any;
  tokenIn: any;
  tokenOut: any;
  amountIn: bigint;
  amountOutMin: bigint;
  path: `0x${string}`[];
  user: `0x${string}`;
};



export function executeSwap({

  writeContract,

  tokenIn,

  tokenOut,

  amountIn,

  amountOutMin,

  path,

  user,

}: SwapParams) {


  const deadline =
    BigInt(
      Math.floor(
        Date.now() / 1000
      ) + 1200
    );




  // OPN -> TOKEN

  if(
    tokenIn.native &&
    !tokenOut.native
  ){

    return writeContract({

      address:
        ROUTER_ADDRESS as `0x${string}`,

      abi:
        ROUTER_ABI,

      functionName:
        "swapExactOPNForTokens",


      args:[

        amountOutMin,

        path,

        user,

        deadline

      ],


      value:
        amountIn

    });

  }





  // TOKEN -> OPN

  if(
    !tokenIn.native &&
    tokenOut.native
  ){

    return writeContract({

      address:
        ROUTER_ADDRESS as `0x${string}`,

      abi:
        ROUTER_ABI,

      functionName:
        "swapExactTokensForOPN",


      args:[

        amountIn,

        amountOutMin,

        path,

        user,

        deadline

      ]

    });

  }





  // TOKEN -> TOKEN

  return writeContract({

    address:
      ROUTER_ADDRESS as `0x${string}`,

    abi:
      ROUTER_ABI,

    functionName:
      "swapExactTokensForTokens",


    args:[

      amountIn,

      amountOutMin,

      path,

      user,

      deadline

    ]

  });


}