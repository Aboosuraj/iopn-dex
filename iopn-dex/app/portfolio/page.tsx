"use client";

import { formatUnits } from "viem";
import { usePortfolio } from "@/lib/usePortfolio";
import { TOKENS } from "@/lib/tokens";

export default function PortfolioPage() {

  const {
    address,
    nativeBalance,
    tokenBalances,
  } = usePortfolio();


  const isConnected = !!address;


  return (

    <main
      className="
      min-h-screen
      pb-24
      bg-[#050816]
      text-white
      "
    >

      {/* Background glow */}

      <div className="
        fixed
        inset-0
        -z-10
        overflow-hidden
      ">

        <div className="
          absolute
          top-0
          left-1/2
          h-[400px]
          w-[400px]
          -translate-x-1/2
          rounded-full
          bg-blue-600/20
          blur-[120px]
        "/>

        <div className="
          absolute
          bottom-0
          right-0
          h-[300px]
          w-[300px]
          rounded-full
          bg-purple-600/20
          blur-[120px]
        "/>

      </div>



      <div className="
        mx-auto
        max-w-3xl
        p-5
      ">


        {/* HEADER */}

        <div
          className="
          relative
          overflow-hidden
          rounded-[32px]
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          p-7
          shadow-2xl
          "
        >

          <div className="
            absolute
            right-0
            top-0
            h-40
            w-40
            rounded-full
            bg-cyan-500/20
            blur-3xl
          "/>


          <div className="relative">


            <div className="
              flex
              items-center
              justify-between
            ">


              <div>

                <p className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-widest
                  text-cyan-400
                ">
                  IOPn DEX
                </p>


                <h1 className="
                  mt-2
                  text-4xl
                  font-black
                ">
                  Portfolio
                </h1>


                <p className="
                  mt-2
                  text-sm
                  text-zinc-400
                ">
                  Track your digital assets
                  on IOPn Testnet
                </p>


              </div>


              <div className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-3xl
                bg-gradient-to-br
                from-cyan-400
                to-blue-600
                text-3xl
              ">
                💼
              </div>


            </div>


          </div>


        </div>





        {/* WALLET */}

        <div
          className="
          mt-5
          flex
          items-center
          justify-between
          rounded-3xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-xl
          p-5
          "
        >


          <div>

            <p className="
              text-xs
              uppercase
              tracking-wider
              text-zinc-500
            ">
              Connected Wallet
            </p>


            <p className="
              mt-2
              font-bold
              text-green-400
            ">

              {
                isConnected
                ?
                `${address?.slice(0,6)}...${address?.slice(-4)}`
                :
                "Wallet Not Connected"
              }

            </p>


          </div>


          <div className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-green-500/20
            bg-green-500/10
            px-4
            py-2
          ">

            <span className="
              h-2
              w-2
              rounded-full
              bg-green-400
              animate-pulse
            "/>


            <span className="
              text-xs
              text-green-400
            ">
              {
                isConnected
                ?
                "Online"
                :
                "Offline"
              }
            </span>


          </div>


        </div>

        {/* OPN BALANCE */}

        <div
          className="
          mt-5
          overflow-hidden
          rounded-[32px]
          bg-gradient-to-br
          from-cyan-500
          via-blue-600
          to-purple-700
          p-7
          shadow-2xl
          "
        >

          <p className="
            text-sm
            text-white/70
          ">
            Total OPN Balance
          </p>


          <div className="
            mt-3
            flex
            items-end
            gap-3
          ">


            <h2 className="
              text-5xl
              font-black
              tracking-tight
            ">

              {
                nativeBalance.data
                ?
                Number(
                  nativeBalance.data.formatted
                ).toFixed(4)
                :
                "0.0000"
              }

            </h2>


            <span className="
              mb-2
              text-xl
              font-bold
              text-cyan-200
            ">
              OPN
            </span>


          </div>


          <p className="
            mt-3
            text-sm
            text-white/70
          ">
            Native token balance
          </p>


        </div>





        {/* ASSETS SECTION */}


        <div
          className="
          mt-6
          rounded-[32px]
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          p-6
          "
        >


          <div className="
            flex
            items-center
            justify-between
          ">


            <div>

              <h2 className="
                text-2xl
                font-black
              ">
                Assets
              </h2>


              <p className="
                mt-1
                text-sm
                text-zinc-400
              ">
                Your tokens on IOPn network
              </p>


            </div>


            <div className="
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/10
              px-4
              py-2
              text-xs
              font-bold
              text-cyan-400
            ">

              {TOKENS.length + 1}

            </div>


          </div>





          <div className="
            mt-6
            space-y-4
          ">




            {/* NATIVE OPN */}


            <div
              className="
              flex
              items-center
              justify-between
              rounded-3xl
              border
              border-cyan-400/20
              bg-cyan-400/10
              p-5
              transition
              hover:scale-[1.02]
              "
            >


              <div className="
                flex
                items-center
                gap-4
              ">


                <div className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-cyan-400
                  to-blue-600
                  text-2xl
                  font-black
                ">
                  O
                </div>


                <div>

                  <h3 className="
                    text-lg
                    font-bold
                  ">
                    OPN
                  </h3>


                  <p className="
                    text-sm
                    text-zinc-300
                  ">
                    Native Token
                  </p>


                </div>


              </div>



              <div className="
                text-right
              ">


                <p className="
                  text-xl
                  font-black
                ">

                  {
                    nativeBalance.data
                    ?
                    Number(
                      nativeBalance.data.formatted
                    ).toFixed(4)
                    :
                    "0.0000"
                  }

                </p>


                <p className="
                  text-xs
                  text-cyan-300
                ">
                  Balance
                </p>


              </div>


            </div>

            {/* ERC20 TOKENS */}

            {
              TOKENS.map((token, index) => {

                const balance =
  tokenBalances?.data?.[index]?.result as bigint | undefined;


                const formatted =
                  balance
                  ?
                  Number(
                    formatUnits(
                      balance,
                      token.decimals
                    )
                  ).toFixed(4)
                  :
                  "0.0000";



                return (

                  <div
                    key={token.symbol}
                    className="
                    flex
                    items-center
                    justify-between
                    rounded-3xl
                    border
                    border-white/10
                    bg-black/20
                    p-5
                    transition
                    duration-300
                    hover:border-purple-400/40
                    hover:bg-white/10
                    hover:scale-[1.02]
                    "
                  >


                    {/* TOKEN INFO */}

                    <div className="
                      flex
                      items-center
                      gap-4
                    ">


                      <div
                        className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-purple-500
                        to-indigo-600
                        text-xl
                        font-black
                        shadow-lg
                        "
                      >

                        {token.symbol.slice(0,1)}

                      </div>



                      <div>

                        <h3 className="
                          text-lg
                          font-bold
                        ">

                          {token.symbol}

                        </h3>


                        <p className="
                          text-sm
                          text-zinc-400
                        ">

                          ERC20 Token

                        </p>


                      </div>


                    </div>




                    {/* BALANCE */}

                    <div className="
                      text-right
                    ">


                      <p className="
                        text-xl
                        font-black
                      ">

                        {formatted}

                      </p>


                      <p className="
                        text-xs
                        text-zinc-500
                      ">

                        Balance

                      </p>


                    </div>


                  </div>

                );


              })
            }


          </div>


        </div>

        {/* WALLET DISCONNECTED MESSAGE */}

        {
          !isConnected && (

            <div
              className="
              mt-6
              rounded-[32px]
              border
              border-yellow-400/20
              bg-yellow-400/5
              backdrop-blur-xl
              p-6
              text-center
              "
            >

              <div className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-3xl
                bg-yellow-400/10
                text-3xl
              ">
                🔐
              </div>


              <h3 className="
                mt-4
                text-xl
                font-black
              ">
                Wallet Not Connected
              </h3>


              <p className="
                mt-2
                text-sm
                text-zinc-400
              ">
                Connect your wallet to view your
                OPN and token balances.
              </p>


            </div>

          )
        }


      </div>


    </main>

  );

}