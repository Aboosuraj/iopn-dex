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

    <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-2xl">


      {/* Header */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-white">
          Swap
        </h1>

        <p className="text-sm text-white/50">
          Trade tokens on IOPN Testnet
        </p>

      </div>




      {/* FROM */}

      <div className="rounded-3xl border border-white/10 bg-black/30 p-4">


        <div className="flex justify-between text-sm text-white/50">

          <span>
            You Pay
          </span>


          <span>
            Balance: {balance}
          </span>

        </div>



        <div className="mt-3 flex items-center gap-3">


          <input

            value={amountIn}

            onChange={(e) =>
              setAmountIn(e.target.value)
            }

            placeholder="0.0"

            className="min-w-0 flex-1 bg-transparent text-4xl font-bold text-white outline-none placeholder:text-white/20"

          />



          <button

            onClick={openTokenIn}

            className="rounded-2xl bg-green-500 px-4 py-3 font-bold text-black"

          >

            {tokenIn.symbol}

            <span className="ml-1">
              ▼
            </span>


          </button>


        </div>


      </div>





      {/* FLIP BUTTON */}


      <div className="flex justify-center py-4">


        <button

          onClick={onFlip}

          className="h-14 w-14 rounded-full border border-green-400/30 bg-green-500 text-2xl font-bold text-black transition hover:rotate-180"

        >

          ⇅

        </button>


      </div>






      {/* TO */}


      <div className="rounded-3xl border border-white/10 bg-black/30 p-4">


        <div className="text-sm text-white/50">

          You Receive

        </div>



        <div className="mt-3 flex items-center gap-3">


          <div className="flex-1 truncate text-4xl font-bold text-green-400">

            {amountOut || "0.0"}

          </div>



          <button

            onClick={openTokenOut}

            className="rounded-2xl bg-green-500 px-4 py-3 font-bold text-black"

          >

            {tokenOut.symbol}

            <span className="ml-1">
              ▼
            </span>


          </button>


        </div>


      </div>







      {/* DETAILS */}


      <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">


        <div className="flex justify-between">

          <span className="text-white/50">
            Network
          </span>


          <span className="text-white">
            OPN Testnet
          </span>

        </div>



        <div className="flex justify-between">

          <span className="text-white/50">
            Slippage
          </span>


          <span className="text-white">
            0.5%
          </span>

        </div>


      </div>






      {/* IMPORT TOKEN */}


      <button

        onClick={onImport}

        className="mt-4 w-full rounded-2xl border border-green-500/40 py-3 font-semibold text-green-400 transition hover:bg-green-500/10"

      >

        + Import Token

      </button>







      {/* ACTION */}


      <button

        disabled={loading}

        onClick={onAction}

        className="mt-4 w-full rounded-2xl bg-green-500 py-4 text-lg font-bold text-black transition hover:bg-green-400 disabled:opacity-50"

      >

        {loading
          ? "Processing..."
          : actionText
        }


      </button>


    </div>

  );

}