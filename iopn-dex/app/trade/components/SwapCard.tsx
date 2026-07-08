"use client";

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

  openTokenIn: () => void;
  openTokenOut: () => void;

  onFlip: () => void;

  balance: string;

  actionText: string;

  onAction: () => void;

  onImport: () => void;

  loading?: boolean;
};


export default function SwapCard({
  amountIn,
  setAmountIn,
  amountOut,

  tokenIn,
  tokenOut,

  openTokenIn,
  openTokenOut,

  onFlip,

  balance,

  actionText,

  onAction,

  onImport,

  loading = false,

}: Props) {


  return (

    <div className="
      w-full
      max-w-md
      rounded-3xl
      border
      border-white/10
      bg-black/40
      backdrop-blur-xl
      shadow-2xl
      p-5
    ">


      {/* HEADER */}

      <div className="mb-6 text-center">

        <h1 className="
          text-3xl
          font-bold
          text-white
        ">
          IOPN Swap
        </h1>


        <p className="
          mt-1
          text-sm
          text-white/60
        ">
          Trade tokens on IOPN Testnet
        </p>

      </div>



      {/* INPUT TOKEN */}

      <div className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-4
      ">


        <div className="
          flex
          justify-between
          text-sm
          text-white/60
        ">

          <span>
            You Pay
          </span>


          <span className="truncate max-w-[180px]">
            Balance: {balance}
          </span>

        </div>



        <div className="
          mt-4
          flex
          items-center
          gap-3
        ">


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
              text-3xl
              font-bold
              text-white
              outline-none
            "

          />



          <button

            type="button"

            onClick={openTokenIn}

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

            <span>
              ▼
            </span>

          </button>


        </div>


      </div>





      {/* FLIP */}


      <div className="
        flex
        justify-center
        py-4
      ">


        <button

          type="button"

          onClick={onFlip}

          className="
            h-14
            w-14
            rounded-full
            bg-green-400
            text-2xl
            font-bold
            text-black
            transition
            hover:rotate-180
          "

        >

          ⇅

        </button>


      </div>







      {/* OUTPUT TOKEN */}


      <div className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-4
      ">


        <div className="
          text-sm
          text-white/60
        ">
          You Receive
        </div>




        <div className="
          mt-4
          flex
          items-center
          gap-3
        ">


          <div className="
            min-w-0
            flex-1
            truncate
            text-2xl
            font-bold
            text-green-400
          ">

            {amountOut || "0.0"}

          </div>




          <button

            type="button"

            onClick={openTokenOut}

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

            <span>
              ▼
            </span>

          </button>


        </div>


      </div>







      {/* INFO */}


      <div className="
        mt-5
        rounded-2xl
        border
        border-white/10
        bg-white/5
        p-4
        text-sm
      ">


        <div className="
          flex
          justify-between
        ">

          <span className="text-white/50">
            Network
          </span>


          <span className="text-white">
            IOPN Testnet
          </span>


        </div>



        <div className="
          mt-3
          flex
          justify-between
        ">

          <span className="text-white/50">
            Slippage
          </span>


          <span className="text-white">
            0.5%
          </span>


        </div>


      </div>







      {/* IMPORT */}


      <button

        type="button"

        onClick={onImport}

        className="
          mt-5
          w-full
          rounded-2xl
          border
          border-green-400
          py-3
          font-bold
          text-green-400
          transition
          hover:bg-green-400
          hover:text-black
        "

      >

        + Import Token

      </button>







      {/* ACTION */}


      <button

        type="button"

        onClick={onAction}

        disabled={loading}

        className="
          mt-4
          w-full
          rounded-2xl
          bg-green-400
          py-4
          text-lg
          font-bold
          text-black
          transition
          disabled:opacity-50
        "

      >

        {loading
          ? "Processing..."
          : actionText
        }


      </button>


    </div>

  );

}