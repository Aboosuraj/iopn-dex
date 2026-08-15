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

// Display OPN with exactly 2 decimals
const opnBalance = nativeBalance.data
? Number(nativeBalance.data.formatted).toFixed(2)
: "0.00";

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
pb-24
text-white
"
>
{/* BACKGROUND GLOW */}

  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

    <div
      className="
        absolute
        left-1/2
        top-0
        h-64
        w-64
        -translate-x-1/2
        rounded-full
        bg-cyan-500/10
        blur-[100px]
      "
    />

    <div
      className="
        absolute
        bottom-20
        right-[-100px]
        h-60
        w-60
        rounded-full
        bg-purple-500/10
        blur-[100px]
      "
    />

  </div>

  <div className="mx-auto w-full max-w-xl px-4 pt-4">

    {/* HEADER */}

    <div className="mb-4 flex items-center justify-between">

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-cyan-400/10
              text-cyan-400
            "
          >
            <Wallet size={16} />
          </div>

          <h1 className="text-xl font-black tracking-tight">
            Portfolio
          </h1>

        </div>

        <p className="mt-1 text-xs text-white/40">
          Manage your IOPn assets
        </p>

      </div>

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-white/10
          bg-white/[0.04]
          text-white/45
        "
      >
        <Activity size={16} />
      </div>

    </div>

    {/* MAIN BALANCE CARD */}

    <section
      className="
        relative
        overflow-hidden
        rounded-[1.5rem]
        border
        border-cyan-400/10
        bg-gradient-to-br
        from-cyan-400/[0.10]
        via-white/[0.035]
        to-purple-500/[0.08]
        px-4
        py-4
        backdrop-blur-xl
      "
    >

      {/* GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          right-[-70px]
          top-[-70px]
          h-40
          w-40
          rounded-full
          bg-cyan-400/10
          blur-[65px]
        "
      />

      <div className="relative">

        {/* TOP ROW */}

        <div className="flex items-center justify-between">

          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
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
              px-2
              py-1
              text-[9px]
              font-bold
              text-emerald-400
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            TESTNET
          </div>

        </div>

        {/* BALANCE */}

        <div className="mt-2 flex items-end gap-2">

          <span className="text-[40px] font-black leading-none tracking-tight">
            {opnBalance}
          </span>

          <span
            className="
              mb-0.5
              text-base
              font-black
              text-cyan-400
            "
          >
            OPN
          </span>

        </div>

        <p className="mt-1.5 text-[10px] text-white/35">
          Native balance on IOPn Chain
        </p>

        {/* WALLET */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-2
            rounded-xl
            border
            border-white/10
            bg-black/20
            px-3
            py-2
          "
        >

          <div className="min-w-0">

            <p className="text-[8px] uppercase tracking-wider text-white/25">
              Connected Wallet
            </p>

            <p className="mt-0.5 truncate font-mono text-xs font-bold text-cyan-300">
              {shortenAddress(address)}
            </p>

          </div>

          {isConnected && (

            <button
              type="button"
              onClick={copyAddress}
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-white/[0.06]
                text-white/45
                transition
                hover:bg-cyan-400/10
                hover:text-cyan-400
              "
              title="Copy wallet address"
            >
              <Copy size={14} />
            </button>

          )}

        </div>

      </div>

    </section>

    {/* QUICK STATS */}

    <div className="mt-3 grid grid-cols-2 gap-2.5">

      <div
        className="
          rounded-xl
          border
          border-white/10
          bg-white/[0.035]
          px-3
          py-3
        "
      >

        <div className="flex items-center gap-1.5 text-white/35">

          <Coins size={13} />

          <span className="text-[10px]">
            Assets Held
          </span>

        </div>

        <p className="mt-1 text-lg font-black">
          {isConnected ? heldTokens.length + 1 : 0}
        </p>

      </div>

      <div
        className="
          rounded-xl
          border
          border-white/10
          bg-white/[0.035]
          px-3
          py-3
        "
      >

        <div className="flex items-center gap-1.5 text-white/35">

          <ShieldCheck size={13} />

          <span className="text-[10px]">
            Network
          </span>

        </div>

        <p className="mt-1 text-lg font-black">
          IOPn
        </p>

      </div>

    </div>

    {/* ASSETS */}

    <section
      className="
        mt-3
        rounded-[1.5rem]
        border
        border-white/10
        bg-white/[0.035]
        p-3
        backdrop-blur-xl
      "
    >

      {/* SECTION HEADER */}

      <div className="mb-3 flex items-center justify-between">

        <div>

          <h2 className="text-base font-black">
            Your Assets
          </h2>

          <p className="mt-0.5 text-[10px] text-white/30">
            Tokens currently held by your wallet
          </p>

        </div>

        <div
          className="
            rounded-full
            bg-cyan-400/10
            px-2.5
            py-1
            text-[9px]
            font-bold
            text-cyan-400
          "
        >
          {heldTokens.length + (isConnected ? 1 : 0)}
        </div>

      </div>

      {!isConnected ? (

        <div
          className="
            rounded-xl
            border
            border-dashed
            border-white/10
            bg-black/20
            px-4
            py-7
            text-center
          "
        >

          <Wallet
            size={26}
            className="mx-auto text-white/20"
          />

          <h3 className="mt-3 text-sm font-bold">
            Wallet not connected
          </h3>

          <p className="mt-1 text-xs text-white/30">
            Connect your wallet to view your assets.
          </p>

        </div>

      ) : (

        <div className="space-y-2">

          {/* OPN */}

          <div
            className="
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-cyan-400/15
              bg-cyan-400/[0.055]
              px-3
              py-2.5
            "
          >

            <div className="flex items-center gap-2.5">

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-400/10
                  text-sm
                  font-black
                  text-cyan-400
                "
              >
                O
              </div>

              <div>

                <p className="text-sm font-black">
                  OPN
                </p>

                <p className="text-[9px] text-white/30">
                  Native Token
                </p>

              </div>

            </div>

            <div className="text-right">

              <p className="text-sm font-black text-cyan-300">
                {opnBalance}
              </p>

              <p className="text-[9px] text-white/25">
                OPN
              </p>

            </div>

          </div>

          {/* ERC20 */}

          {tokensLoading ? (

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-black/20
                px-4
                py-5
                text-center
                text-xs
                text-white/35
              "
            >

              <RefreshCw
                size={15}
                className="mx-auto mb-2 animate-spin"
              />

              Loading token balances...

            </div>

          ) : heldTokens.length === 0 ? (

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-white/10
                bg-black/20
                px-4
                py-6
                text-center
              "
            >

              <Coins
                size={22}
                className="mx-auto text-white/20"
              />

              <p className="mt-2 text-xs font-semibold text-white/40">
                No ERC-20 tokens held
              </p>

            </div>

          ) : (

            heldTokens.map((token) => {

              const formatted = Number(
                token.balance
              ).toFixed(2);

              return (

                <div
                  key={token.symbol}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    px-3
                    py-2.5
                    transition
                    hover:border-cyan-400/20
                  "
                >

                  <div className="flex items-center gap-2.5">

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-purple-400/10
                        text-xs
                        font-black
                        text-purple-300
                      "
                    >
                      {token.symbol
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>

                    <div>

                      <p className="text-sm font-bold">
                        {token.symbol}
                      </p>

                      <p className="text-[9px] text-white/25">
                        ERC-20 Token
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-sm font-black">
                      {formatted}
                    </p>

                    <p className="text-[9px] text-white/25">
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
          mt-3
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/[0.035]
          py-3
          text-xs
          font-bold
          text-white/50
          transition
          hover:border-cyan-400/20
          hover:bg-cyan-400/[0.05]
          hover:text-cyan-400
        "
      >
        View Wallet on Explorer
        <ExternalLink size={14} />
      </a>

    )}

  </div>

</main>

);
}