"use client";

import { formatUnits } from "viem";
import { usePortfolio } from "@/lib/usePortfolio";
import { useWalletTokens } from "@/hooks/useWalletTokens";


export default function PortfolioPage() {


  const {
    address,
    nativeBalance,
    tokenBalances,
  } = usePortfolio();

   const {
      walletTokens,
        loading: tokensLoading,
        } = useWalletTokens();
  
  


  const isConnected = !!address;



  const opnBalance =
    nativeBalance.data
      ? Number(
          nativeBalance.data.formatted
        ).toFixed(4)
      : "0.0000";



  return (

    <main
      className="
      min-h-screen
      pb-24
      bg-[#050816]
      text-white
      "
    >


      {/* Background Glow */}

      <div
        className="
        fixed
        inset-0
        -z-10
        overflow-hidden
        "
      >

        <div
          className="
          absolute
          top-10
          left-1/2
          h-72
          w-72
          -translate-x-1/2
          rounded-full
          bg-blue-500/20
          blur-[100px]
          "
        />


        <div
          className="
          absolute
          bottom-20
          right-0
          h-64
          w-64
          rounded-full
          bg-purple-500/20
          blur-[100px]
          "
        />


      </div>




      <div
        className="
        mx-auto
        max-w-xl
        px-4
        pt-5
        "
      >




        {/* PORTFOLIO HERO CARD */}


        <div
          className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-white/10
          bg-gradient-to-br
          from-[#101827]
          via-[#16213b]
          to-[#25104a]
          p-5
          shadow-2xl
          "
        >


          {/* Glow */}

          <div
            className="
            absolute
            right-[-40px]
            top-[-40px]
            h-40
            w-40
            rounded-full
            bg-cyan-400/20
            blur-3xl
            "
          />



          <div
            className="
            relative
            "
          >



            <div
              className="
              flex
              items-start
              justify-between
              "
            >


              <div>


                <p
                  className="
                  text-xs
                  font-bold
                  tracking-[0.25em]
                  text-cyan-400
                  "
                >
                  IOPn DEX
                </p>



                <h1
                  className="
                  mt-2
                  text-3xl
                  font-black
                  "
                >
                  Portfolio
                </h1>


                <p
                  className="
                  mt-1
                  text-sm
                  text-white/60
                  "
                >
                  Your Web3 assets
                </p>


              </div>




              <div
                className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-cyan-400/20
                text-2xl
                "
              >
                💼
              </div>


            </div>





            {/* Balance */}


            <div
              className="
              mt-6
              "
            >


              <p
                className="
                text-xs
                uppercase
                text-white/50
                "
              >
                Total Balance
              </p>



              <div
                className="
                mt-1
                flex
                items-end
                gap-2
                "
              >

                <h2
                  className="
                  text-4xl
                  font-black
                  "
                >

                  {opnBalance}

                </h2>


                <span
                  className="
                  mb-1
                  text-lg
                  font-bold
                  text-cyan-300
                  "
                >
                  OPN
                </span>


              </div>


            </div>
                        {/* Wallet Address Inside Hero */}

            <div
              className="
              mt-5
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-white/10
              bg-black/20
              px-4
              py-3
              "
            >


              <div>


                <p
                  className="
                  text-[11px]
                  uppercase
                  tracking-wider
                  text-white/40
                  "
                >
                  Wallet
                </p>



                <p
                  className="
                  mt-1
                  text-sm
                  font-bold
                  text-green-400
                  "
                >

                  {isConnected
                    ? `${address?.slice(0,6)}...${address?.slice(-4)}`
                    : "Not Connected"
                  }

                </p>


              </div>



              <div
                className="
                h-2
                w-2
                rounded-full
                bg-green-400
                shadow-lg
                shadow-green-400/50
                "
              />


            </div>


          </div>


        </div>





        {/* ASSETS SECTION */}


        <div
          className="
          mt-5
          rounded-[24px]
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-xl
          p-4
          "
        >



          <div
            className="
            mb-4
            flex
            items-center
            justify-between
            "
          >


            <h2
              className="
              text-lg
              font-bold
              "
            >
              Assets
            </h2>


            <span
              className="
              rounded-full
              bg-cyan-400/10
              px-3
              py-1
              text-xs
              text-cyan-300
              "
            >
              OPN Testnet
            </span>


          </div>





          {/* Native OPN */}


          <div
            className="
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-cyan-400/20
            bg-cyan-400/10
            px-4
            py-3
            "
          >


            <div
              className="
              flex
              items-center
              gap-3
              "
            >

              <div
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-cyan-400/20
                "
              >
                ⚡
              </div>



              <div>

                <p
                  className="
                  font-bold
                  "
                >
                  OPN
                </p>


                <p
                  className="
                  text-xs
                  text-white/50
                  "
                >
                  Native Token
                </p>


              </div>


            </div>




            <p
              className="
              font-black
              text-cyan-300
              "
            >
              {opnBalance}
            </p>


          </div>





          {/* ERC20 TOKENS */}

<div
  className="
  mt-3
  space-y-3
  "
>
  {walletTokens
    .filter((token) => token.symbol.toUpperCase() !== "OPN")
    .map((token) => {
      const formatted = Number(token.balance).toFixed(4);

      return (
        <div
          key={token.symbol}
          className="
          flex
          items-center
          justify-between
          rounded-2xl
          border
          border-white/10
          bg-black/20
          px-4
          py-3
          "
        >
          <div
            className="
            flex
            items-center
            gap-3
            "
          >
            <div
              className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-purple-400/20
              text-sm
              font-bold
              "
            >
              {token.symbol[0]}
            </div>

            <div>
              <p className="font-semibold">
                {token.symbol}
              </p>

              <p
                className="
                text-xs
                text-white/40
                "
              >
                ERC20
              </p>
            </div>
          </div>

          <p
            className="
            font-bold
            text-white
            "
          >
            {formatted}
          </p>
        </div>
      );
    })}
</div>



        </div>



      </div>


    </main>


  );


}