"use client";

import { useMemo, useState, useEffect } from "react";

import {
  useAccount,
  useBalance,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import { readContract } from "wagmi/actions";

import { formatUnits, parseUnits } from "viem";

import SwapCard from "./components/SwapCard";
import TokenModal from "./components/TokenModal";
import TokenImport from "./components/TokenImport";

import { TOKENS } from "@/lib/tokens";
import { ERC20_ABI } from "@/lib/erc20";
import { ROUTER_ABI } from "@/lib/routerAbi";
import {
  ROUTER_ADDRESS,
  WOPN_ADDRESS,
} from "@/lib/router";

import { DEFAULT_SLIPPAGE } from "@/lib/config";
import { config } from "@/lib/wagmi";


type Token = {
  symbol: string;
  address: string;
  decimals: number;
  native: boolean;
};


export default function TradePage() {


  const { address, isConnected } = useAccount();


  const { data: nativeBalance } = useBalance({
    address,
  });


  const {
    writeContract,
    data: txHash,
    isPending,
  } = useWriteContract();


  const {
    isSuccess: txSuccess,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });



  // Token list (supports imported tokens later)

  const [tokens, setTokens] = useState<Token[]>(
    TOKENS as unknown as Token[]
  );



  // Selected tokens

  const [tokenIn, setTokenIn] = useState<Token>(
    TOKENS[0] as unknown as Token
  );


  const [tokenOut, setTokenOut] = useState<Token>(
    TOKENS[3] as unknown as Token
  );



  // Amounts

  const [amountIn, setAmountIn] =
    useState("");


  const [amountOut, setAmountOut] =
    useState("");



  // Modals

  const [selecting, setSelecting] =
    useState<"in" | "out" | null>(null);


  const [showImport, setShowImport] =
    useState(false);



  // Swap data

  const [route, setRoute] =
    useState<`0x${string}`[]>([]);


  const [error, setError] =
    useState("");



  const [loading, setLoading] =
    useState(false);



  const parsedAmount =
    amountIn && Number(amountIn) > 0
      ? parseUnits(
          amountIn,
          tokenIn.decimals
        )
      : 0n;
      const currentBalance = useMemo(() => {

  if (!isConnected) return "0";

  if (tokenIn.native) {
    return nativeBalance?.formatted ?? "0";
  }

  return "0";

}, [
  isConnected,
  tokenIn,
  nativeBalance,
]);



const { data: tokenBalance } =
  useReadContract({

    address:
      !tokenIn.native
        ? tokenIn.address as `0x${string}`
        : undefined,

    abi: ERC20_ABI,

    functionName: "balanceOf",

    args:
      address && !tokenIn.native
        ? [address]
        : undefined,

    query: {
      enabled:
        !!address &&
        !tokenIn.native,
    },

  });



const displayBalance = useMemo(() => {

  if (!tokenIn.native && tokenBalance) {

    return formatUnits(
      tokenBalance as bigint,
      tokenIn.decimals
    );

  }


  return currentBalance;


}, [
  tokenBalance,
  tokenIn,
  currentBalance,
]);





function getPath(): `0x${string}`[] {

  const input =
    tokenIn.native
      ? WOPN_ADDRESS
      : tokenIn.address;


  const output =
    tokenOut.native
      ? WOPN_ADDRESS
      : tokenOut.address;



  return [
    input as `0x${string}`,
    output as `0x${string}`,
  ];

}





async function getQuote() {

  if (!parsedAmount) {

    setAmountOut("");

    return;

  }



  if (
    tokenIn.symbol === tokenOut.symbol
  ) {

    setAmountOut("");

    setError(
      "Select different tokens"
    );

    return;

  }



  try {

    setError("");



    const path =
      getPath();



    const result =
      await readContract(
        config,
        {

          address:
            ROUTER_ADDRESS as `0x${string}`,

          abi: ROUTER_ABI,

          functionName:
            "getAmountsOut",

          args: [
            parsedAmount,
            path,
          ],

        }
      );



    const amounts =
      result as bigint[];



    const output =
      amounts[
        amounts.length - 1
      ];



    setAmountOut(

      formatUnits(
        output,
        tokenOut.decimals
      )

    );



    setRoute(path);



  } catch (err) {


    console.log(err);


    setAmountOut("");

    setError(
      "No liquidity route found"
    );


  }

}






useEffect(() => {

  const timer =
    setTimeout(() => {

      getQuote();

    }, 500);



  return () =>
    clearTimeout(timer);


}, [
  amountIn,
  tokenIn,
  tokenOut,
]);
const { data: allowance } =
  useReadContract({

    address:
      !tokenIn.native
        ? tokenIn.address as `0x${string}`
        : undefined,

    abi: ERC20_ABI,

    functionName: "allowance",

    args:
      address && !tokenIn.native
        ? [
            address,
            ROUTER_ADDRESS as `0x${string}`,
          ]
        : undefined,

    query: {
      enabled:
        !!address &&
        !tokenIn.native,
    },

  });





const needsApproval =
  !tokenIn.native &&
  parsedAmount > 0n &&
  (!allowance ||
    (allowance as bigint) < parsedAmount);





function getAmountOutMin() {

  if (!amountOut) return 0n;


  const output =
    parseUnits(
      amountOut,
      tokenOut.decimals
    );


  return (
    output *
    BigInt(
      100 -
      DEFAULT_SLIPPAGE
    )
  ) /
  100n;

}







async function handleApprove() {

  if (
    !tokenIn.address ||
    tokenIn.native
  ) {
    return;
  }



  writeContract({

    address:
      tokenIn.address as `0x${string}`,

    abi:
      ERC20_ABI,

    functionName:
      "approve",

    args: [

      ROUTER_ADDRESS as `0x${string}`,

      parsedAmount,

    ],

  });

}









async function handleSwap() {


  if (
    !address ||
    !parsedAmount ||
    route.length < 2
  ) {

    return;

  }



  setLoading(true);



  try {


    const deadline =
      BigInt(
        Math.floor(
          Date.now() / 1000
        ) + 1200
      );



    const amountOutMin =
      getAmountOutMin();





    // OPN -> Token

    if (
      tokenIn.native &&
      !tokenOut.native
    ) {


      writeContract({

        address:
          ROUTER_ADDRESS as `0x${string}`,

        abi:
          ROUTER_ABI,

        functionName:
          "swapExactOPNForTokens",

        args: [

          amountOutMin,

          route,

          address,

          deadline,

        ],

        value:
          parsedAmount,

      });



      return;

    }






    // Token -> OPN

    if (
      !tokenIn.native &&
      tokenOut.native
    ) {


      writeContract({

        address:
          ROUTER_ADDRESS as `0x${string}`,

        abi:
          ROUTER_ABI,

        functionName:
          "swapExactTokensForOPN",

        args: [

          parsedAmount,

          amountOutMin,

          route,

          address,

          deadline,

        ],

      });



      return;

    }








    // Token -> Token


    writeContract({

      address:
        ROUTER_ADDRESS as `0x${string}`,

      abi:
        ROUTER_ABI,

      functionName:
        "swapExactTokensForTokens",

      args: [

        parsedAmount,

        amountOutMin,

        route,

        address,

        deadline,

      ],

    });



  }

  catch(error) {

    console.log(error);

  }

  finally {

    setLoading(false);

  }

}
// ===============================
// TOKEN MANAGEMENT
// ===============================


function flipTokens() {

  const oldIn = tokenIn;

  setTokenIn(tokenOut);

  setTokenOut(oldIn);

  setAmountOut("");

}





function selectToken(token: Token) {


  if (selecting === "in") {

    setTokenIn(token);

  }


  if (selecting === "out") {

    setTokenOut(token);

  }


  setSelecting(null);

  setAmountOut("");

}







function importToken(token: Token) {


  const exists =
    tokens.find(
      (t) =>
        t.address.toLowerCase() ===
        token.address.toLowerCase()
    );



  if (!exists) {

    setTokens([
      ...tokens,
      token,
    ]);

  }



  setTokenOut(token);

}







const actionText = useMemo(() => {


  if (!isConnected) {

    return "Connect Wallet";

  }



  if (!amountIn) {

    return "Enter Amount";

  }



  if (needsApproval) {

    return "Approve";

  }



  return "Swap";


}, [

  isConnected,

  amountIn,

  needsApproval,

]);







function handleAction() {


  if (!isConnected) {

    return;

  }



  if (needsApproval) {

    handleApprove();

    return;

  }



  handleSwap();


}
return (

  <main className="min-h-screen bg-gradient-to-br from-black via-[#071a12] to-black px-4 py-10">

    <SwapCard

      amountIn={amountIn}

      setAmountIn={setAmountIn}

      amountOut={amountOut}

      tokenIn={tokenIn}

      tokenOut={tokenOut}


      openTokenIn={() =>
        setSelecting("in")
      }


      openTokenOut={() =>
        setSelecting("out")
      }


      onFlip={flipTokens}


      balance={displayBalance}


      actionText={actionText}


      onAction={handleAction}


      loading={
        loading ||
        isPending
      }
      onImport={() => {
  console.log("Import token");
}}

    />



    {error && (

      <div className="mx-auto mt-4 max-w-md rounded-xl bg-red-500/20 p-3 text-center text-sm text-red-300">

        {error}

      </div>

    )}



    {txSuccess && (

      <div className="mx-auto mt-4 max-w-md rounded-xl bg-green-500/20 p-3 text-center text-sm text-green-300">

        Swap Successful 🎉

      </div>

    )}





    <TokenModal

      open={
        selecting !== null
      }


      tokens={tokens}


      onClose={() =>
        setSelecting(null)
      }


      onSelect={selectToken}

    />





    <TokenImport

      open={showImport}


      onClose={() =>
        setShowImport(false)
      }


      onImport={importToken}

    />


  </main>

);
}