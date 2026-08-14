"use client";

import { usePortfolio } from "@/lib/usePortfolio";
import { useWalletTokens } from "@/hooks/useWalletTokens";

import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  Coins,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function PortfolioPage() {
  const {
    address,
    nativeBalance,
  } = usePortfolio();

  const {
    walletTokens,
    loading: tokensLoading,
  } = useWalletTokens();

  const isConnected = !!address;

  const opnBalance = nativeBalance.data
    ? Number(nativeBalance.data.formatted).toFixed(4)
    : "0.0000";

  /*
   * Only show ERC20 tokens that actually have a balance.
   */
  const heldTokens = walletTokens.filter((token) => {
    if (token.symbol.toUpperCase() === "OPN") {
      return false;
    }

    return Number(token.balance) > 0;
  });

  function shortenAddress(value?: string) {
    if (!value) return "Not Connected";

    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }

  function copyAddress() {
    if (!address) return;

    navigator.clipboard.writeText(address);
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#050816]
        pb-28
        text-white
      "
    >

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div
          className="
            absolute
            left-1/2
            top-0
            h-80
            w-80
            -translate-x-1/2
            rounded-full
            bg-cyan-500/10
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            bottom-20
            right-[-80px]
            h-72
            w-72
            rounded-full
            bg-purple-500/10
            blur-[120px]
          "
        />

      </div>


      <div className="mx-auto w-full max-w-xl px-4 pt-6">


        {/* HEADER */}

        <div className="mb-5 flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2">

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/10
                  text-cyan-400
                "
              >
                <Wallet size={18} />
              </div>

              <h1 className="text-2xl font-black">
                Portfolio
              </h1>

            </div>

            <p className="mt-1 text-sm text-white/40">
              Manage your IOPn assets
            </p>

          </div>


          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              text-white/50
            "
          >
            <Activity size={18} />
          </div>

        </div>


        {/* MAIN BALANCE CARD */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-white/10
            bg-gradient-to-br
            from-cyan-400/[0.12]
            via-white/[0.04]
            to-purple-500/[0.10]
            p-6
            backdrop-blur-xl
          "
        >

          {/* CARD GLOW */}

          <div
            className="
              pointer-events-none
              absolute
              right-[-60px]
              top-[-60px]
              h-48
              w-48
              rounded-full
              bg-cyan-400/10
              blur-[70px]
            "
          />


          <div className="relative">

            {/* LABEL */}

            <div className="flex items-center justify-between">

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-white/40
                "
              >
                Total OPN Balance
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-emerald-400/10
                  bg-emerald-400/10
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  text-emerald-400
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                TESTNET
              </div>

            </div>


            {/* BALANCE */}

            <div className="mt-3 flex items-end gap-2">

              <span className="text-5xl font-black tracking-tight">
                {opnBalance}
              </span>

              <span
                className="
                  mb-1.5
                  text-lg
                  font-black
                  text-cyan-400
                "
              >
                OPN
              </span>

            </div>


            <p className="mt-2 text-xs text-white/35">
              Native balance on IOPn Chain
            </p>


            {/* WALLET */}

            <div
              className="
                mt-6
                flex
                items-center
                justify-between
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-black/20
                px-4
                py-3
              "
            >

              <div className="min-w-0">

                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Connected Wallet
                </p>

                <p className="mt-1 truncate font-mono text-sm font-bold text-cyan-300">
                  {shortenAddress(address)}
                </p>

              </div>


              {isConnected && (

                <button
                  type="button"
                  onClick={copyAddress}
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/[0.06]
                    text-white/50
                    transition
                    hover:bg-cyan-400/10
                    hover:text-cyan-400
                  "
                  title="Copy wallet address"
                >
                  <Copy size={15} />
                </button>

              )}

            </div>

          </div>

        </section>


        {/* QUICK STATS */}

        <div className="mt-4 grid grid-cols-2 gap-3">

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-4
            "
          >

            <div className="flex items-center gap-2 text-white/40">

              <Coins size={15} />

              <span className="text-xs">
                Assets Held
              </span>

            </div>

            <p className="mt-2 text-xl font-black">
              {isConnected ? heldTokens.length + 1 : 0}
            </p>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              p-4
            "
          >

            <div className="flex items-center gap-2 text-white/40">

              <ShieldCheck size={15} />

              <span className="text-xs">
                Network
              </span>

            </div>

            <p className="mt-2 text-xl font-black">
              IOPn
            </p>

          </div>

        </div>


        {/* ASSETS */}

        <section
          className="
            mt-5
            rounded-[2rem]
            border
            border-white/10
            bg-white/[0.035]
            p-4
            backdrop-blur-xl
          "
        >

          {/* SECTION HEADER */}

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-black">
                Your Assets
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Tokens currently held by your wallet
              </p>

            </div>


            <div
              className="
                rounded-full
                bg-cyan-400/10
                px-3
                py-1
                text-[10px]
                font-bold
                text-cyan-400
              "
            >
              {heldTokens.length + (isConnected ? 1 : 0)}
            </div>

          </div>


          {!isConnected ? (

            /* DISCONNECTED */

            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-white/10
                bg-black/20
                px-5
                py-10
                text-center
              "
            >

              <Wallet
                size={30}
                className="mx-auto text-white/20"
              />

              <h3 className="mt-4 font-bold">
                Wallet not connected
              </h3>

              <p className="mt-1 text-sm text-white/35">
                Connect your wallet to view your assets.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {/* OPN */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-cyan-400/15
                  bg-cyan-400/[0.06]
                  p-4
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-cyan-400/10
                      font-black
                      text-cyan-400
                    "
                  >
                    O
                  </div>

                  <div>

                    <p className="font-black">
                      OPN
                    </p>

                    <p className="mt-0.5 text-xs text-white/35">
                      Native Token
                    </p>

                  </div>

                </div>


                <div className="text-right">

                  <p className="font-black text-cyan-300">
                    {opnBalance}
                  </p>

                  <p className="mt-0.5 text-[10px] text-white/30">
                    OPN
                  </p>

                </div>

              </div>


              {/* ERC20 */}

              {tokensLoading ? (

                <div
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-black/20
                    px-4
                    py-6
                    text-center
                    text-sm
                    text-white/40
                  "
                >
                  <RefreshCw
                    size={17}
                    className="mx-auto mb-2 animate-spin"
                  />

                  Loading token balances...
                </div>

              ) : heldTokens.length === 0 ? (

                <div
                  className="
                    rounded-2xl
                    border
                    border-dashed
                    border-white/10
                    bg-black/20
                    px-4
                    py-7
                    text-center
                  "
                >

                  <Coins
                    size={24}
                    className="mx-auto text-white/20"
                  />

                  <p className="mt-3 text-sm font-semibold text-white/45">
                    No ERC-20 tokens held
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    Tokens you receive or buy will appear here.
                  </p>

                </div>

              ) : (

                heldTokens.map((token) => {

                  const formatted = Number(
                    token.balance
                  ).toFixed(4);

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
                        p-4
                        transition
                        hover:border-cyan-400/20
                        hover:bg-white/[0.035]
                      "
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            bg-purple-400/10
                            text-sm
                            font-black
                            text-purple-300
                          "
                        >
                          {token.symbol
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-bold">
                            {token.symbol}
                          </p>

                          <p className="mt-0.5 text-xs text-white/30">
                            ERC-20 Token
                          </p>

                        </div>

                      </div>


                      <div className="text-right">

                        <p className="font-black">
                          {formatted}
                        </p>

                        <p className="mt-0.5 text-[10px] text-white/30">
                          {token.symbol}
                        </p>

                      </div>

                    </div>

                  );
                })

              )}

            </div>

          )}

        </section>


        {/* EXPLORER */}

        {isConnected && (

          <a
            href={`https://testnet.iopn.tech/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              mt-4
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.035]
              py-4
              text-sm
              font-bold
              text-white/60
              transition
              hover:border-cyan-400/20
              hover:bg-cyan-400/[0.05]
              hover:text-cyan-400
            "
          >
            View Wallet on Explorer
            <ExternalLink size={15} />
          </a>

        )}

      </div>

    </main>
  );
}