"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

function formatBalance(balance: string) {
  const value = Number(balance);

  if (!value) return "0";

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

type Token = {
  symbol: string;
  address: string;
  decimals: number;
  native: boolean;
};

type Props = {
  amountIn: string;
  setAmountIn: (value: string) => void;

  amountOut: string;

  tokenIn: Token;
  tokenOut: Token;

  onSelectIn: () => void;
  onSelectOut: () => void;

  onFlip: () => void;

  balance: string;

  onSwap: () => void;

  buttonText: string;

  loading: boolean;
};

export default function SwapCard({

  amountIn,
  setAmountIn,

  amountOut,

  tokenIn,
  tokenOut,

  onSelectIn,
  onSelectOut,

  onFlip,

  balance,

  onSwap,

  buttonText,

  loading,

}: Props) {

  return (

    <div
      className="
      w-full
      rounded-3xl
      border
      border-white/10
      bg-white/5
      p-5
      backdrop-blur-xl
      shadow-2xl
      "
    >

      <h2
        className="
        mb-5
        text-center
        text-3xl
        font-black
        text-white
        "
      >
         Swap
      </h2>


      {/* PAY */}

      <div
        className="
        rounded-3xl
        bg-black/30
        p-4
        "
      >

        <div
          className="
          flex
          items-center
          justify-between
          text-sm
          "
        >

          <span className="font-medium text-white/70">
            You Pay
          </span>

          <span className="text-xs text-white/50">
            Balance: {formatBalance(balance)}
          </span>

        </div>


        <div
          className="
          mt-2
          flex
          items-center
          justify-between
          "
        >

          <span className="text-xs text-white/40">
            Available
          </span>


          <button
            onClick={() => {

              if(balance){
                setAmountIn(balance);
              }

            }}

            className="
            rounded-lg
            bg-green-400/20
            px-3
            py-1
            text-xs
            font-bold
            text-green-400
            "
          >
            MAX
          </button>


        </div>



        <div
          className="
          mt-4
          flex
          w-full
          items-center
          gap-2
          "
        >

          <input

            type="number"

            value={amountIn}

            onChange={(e)=>
              setAmountIn(e.target.value)
            }

            placeholder="0.0"

            className="
            min-w-0
            flex-1
            bg-transparent
            text-4xl
            font-bold
            text-white
            outline-none
            "

          />


          <button

            onClick={onSelectIn}

            className="
            shrink-0
            rounded-2xl
            bg-green-400
            px-4
            py-3
            font-bold
            text-black
            "

          >

            {tokenIn.symbol}

          </button>


        </div>


      </div>




      {/* FLIP */}

      <div
        className="
        flex
        justify-center
        py-5
        "
      >

        <button

          onClick={onFlip}

          className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-green-400
          text-xl
          font-bold
          text-black
          "

        >

          ⇅

        </button>


      </div>





      {/* RECEIVE */}


      <div
        className="
        rounded-3xl
        bg-black/30
        p-4
        "
      >


        <div className="
        text-sm
        font-medium
        text-white/70
        ">

          You Receive

        </div>




        <div
          className="
          mt-4
          flex
          w-full
          items-center
          gap-2
          "
        >


          <div
            className="
            min-w-0
            flex-1
            overflow-hidden
            "
          >

            <div
              className="
              truncate
              text-4xl
              font-bold
              text-green-400
              "
            >

              {amountOut || "0.0"}

            </div>


          </div>



          <button

            onClick={onSelectOut}

            className="
            shrink-0
            rounded-2xl
            bg-green-400
            px-4
            py-3
            font-bold
            text-black
            "

          >

            {tokenOut.symbol}

          </button>



        </div>


      </div>





      {/* SWAP BUTTON */}

    {buttonText === "Connect Wallet" ? (
  <ConnectButton.Custom>
    {({ openConnectModal, mounted }) => (
      <button
        onClick={openConnectModal}
        disabled={!mounted}
        className="
          mt-6
          w-full
          rounded-2xl
          bg-green-400
          py-4
          text-lg
          font-black
          text-black
          transition
          hover:brightness-110
        "
      >
        Connect Wallet
      </button>
    )}
  </ConnectButton.Custom>
) : (
  <button
    onClick={onSwap}
    disabled={loading}
    className="
      mt-6
      w-full
      rounded-2xl
      bg-green-400
      py-4
      text-lg
      font-black
      text-black
      transition
      hover:brightness-110
      disabled:opacity-50
    "
  >
    {loading ? "Processing..." : buttonText}
  </button>
)}



    </div>


  );

}