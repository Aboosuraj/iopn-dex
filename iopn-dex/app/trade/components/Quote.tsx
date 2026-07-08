import { readContract } from "wagmi/actions";
import { config } from "@/lib/wagmi";
import { ROUTER_ABI } from "@/lib/routerAbi";
import { ROUTER_ADDRESS } from "@/lib/router";


export async function getQuote(
  amountIn: bigint,
  path: `0x${string}`[]
) {

  try {

    const data =
      await readContract(config, {

        address:
          ROUTER_ADDRESS as `0x${string}`,

        abi:
          ROUTER_ABI,

        functionName:
          "getAmountsOut",

        args:[
          amountIn,
          path
        ]

      });



    const amounts =
      data as bigint[];


    return amounts[
      amounts.length - 1
    ];


  } catch {

    return null;

  }

}