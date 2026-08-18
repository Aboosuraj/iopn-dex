"use client";

import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  Coins,
  ShieldCheck,
} from "lucide-react";

import {
  usePortfolio,
} from "@/lib/usePortfolio";

import {
  useWalletTokens,
} from "@/hooks/useWalletTokens";

import { useTheme } from "@/components/ThemeProvider";

export default function PortfolioPage() {
  const {
    address,
    nativeBalance,
  } = usePortfolio();

  const {
    walletTokens,
    loading:
      tokensLoading,
    refresh,
  } = useWalletTokens();

  const {
    darkMode,
  } = useTheme();

  const isConnected =
    !!address;

  const opnBalance =
    nativeBalance.data
      ? Number(
          nativeBalance
            .data
            .formatted
        ).toFixed(2)
      : "0.00";

  /*
   * Only tokens with a real
   * blockchain balance are shown.
   */

  const heldTokens =
    walletTokens.filter(
      (token) =>
        token.symbol
          .toUpperCase() !==
          "OPN" &&
        Number(
          token.balance
        ) > 0
    );

  function shortenAddress(
    value?: string
  ) {
    if (!value) {
      return "Not Connected";
    }

    return `${value.slice(
      0,
      6
    )}...${value.slice(-4)}`;
  }

  async function copyAddress() {
    if (!address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        address
      );
    } catch {
      // Clipboard unavailable.
    }
  }

  const assetCount =
    isConnected
      ? heldTokens.length + 1
      : 0;

  return (
    <main
      className={`
        min-h-screen
        pb-28
        transition-colors
        duration-300
        ${
          darkMode
            ? "bg-[#050816] text-white"
            : "bg-slate-50 text-slate-900"
        }
      `}
    >

      {/* BACKGROUND */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          -z-10
          overflow-hidden
        "
      >

        <div
          className={`
            absolute
            left-1/2
            top-0
            h-64
            w-64
            -translate-x-1/2
            rounded-full
            blur-[100px]
            ${
              darkMode
                ? "bg-cyan-500/10"
                : "bg-cyan-400/15"
            }
          `}
        />

        <div
          className={`
            absolute
            bottom-20
            right-[-100px]
            h-60
            w-60
            rounded-full
            blur-[100px]
            ${
              darkMode
                ? "bg-purple-500/10"
                : "bg-purple-400/10"
            }
          `}
        />

      </div>

      <div
        className="
          mx-auto
          w-full
          max-w-xl
          px-4
          pt-4
        "
      >

        {/* HEADER */}

        <div
          className="
            mb-4
            flex
            items-center
            justify-between
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className={`
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    darkMode
                      ? "bg-cyan-400/10 text-cyan-400"
                      : "bg-cyan-500/10 text-cyan-600"
                  }
                `}
              >
                <Wallet
                  size={16}
                />
              </div>

              <h1
                className="
                  text-xl
                  font-black
                "
              >
                Portfolio
              </h1>

            </div>

            <p
              className={`
                mt-1
                text-xs
                ${
                  darkMode
                    ? "text-white/40"
                    : "text-slate-500"
                }
              `}
            >
              Your live IOPn wallet assets
            </p>

          </div>

          {isConnected && (
            <button
              type="button"
              onClick={
                refresh
              }
              disabled={
                tokensLoading
              }
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                transition
                disabled:opacity-50
                ${
                  darkMode
                    ? "border-white/10 bg-white/[0.04] text-white/45 hover:border-cyan-400/30 hover:text-cyan-400"
                    : "border-slate-200 bg-white text-slate-400 shadow-sm hover:border-cyan-400/40 hover:text-cyan-600"
                }
              `}
            >
              <RefreshCw
                size={15}
                className={
                  tokensLoading
                    ? "animate-spin"
                    : ""
                }
              />
            </button>
          )}

        </div>

        {/* BALANCE CARD */}

        <section
          className={`
            relative
            overflow-hidden
            rounded-[1.5rem]
            border
            px-4
            py-4
            backdrop-blur-xl
            transition-colors
            ${
              darkMode
                ? "border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.10] via-white/[0.035] to-purple-500/[0.08]"
                : "border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-purple-50 shadow-sm"
            }
          `}
        >

          <div
            className={`
              pointer-events-none
              absolute
              right-[-70px]
              top-[-70px]
              h-40
              w-40
              rounded-full
              blur-[65px]
              ${
                darkMode
                  ? "bg-cyan-400/10"
                  : "bg-cyan-400/15"
              }
            `}
          />

          <div
            className="
              relative
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <p
                className={`
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  ${
                    darkMode
                      ? "text-white/40"
                      : "text-slate-500"
                  }
                `}
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
                  text-emerald-500
                "
              >

                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-400
                  "
                />

                TESTNET

              </div>

            </div>

            <div
              className="
                mt-2
                flex
                items-end
                gap-2
              "
            >

              <span
                className="
                  text-[40px]
                  font-black
                  leading-none
                  tracking-tight
                "
              >
                {opnBalance}
              </span>

              <span
                className="
                  mb-0.5
                  text-base
                  font-black
                  text-cyan-500
                "
              >
                OPN
              </span>

            </div>

            <p
              className={`
                mt-1.5
                text-[10px]
                ${
                  darkMode
                    ? "text-white/35"
                    : "text-slate-500"
                }
              `}
            >
              Native balance on IOPn Chain
            </p>

            {/* WALLET */}

            <div
              className={`
                mt-3
                flex
                items-center
                justify-between
                gap-2
                rounded-xl
                border
                px-3
                py-2
                ${
                  darkMode
                    ? "border-white/10 bg-black/20"
                    : "border-slate-200 bg-white/70"
                }
              `}
            >

              <div
                className="
                  min-w-0
                "
              >

                <p
                  className={`
                    text-[8px]
                    uppercase
                    tracking-wider
                    ${
                      darkMode
                        ? "text-white/25"
                        : "text-slate-400"
                    }
                  `}
                >
                  Connected Wallet
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    font-mono
                    text-xs
                    font-bold
                    text-cyan-500
                  "
                >
                  {shortenAddress(
                    address
                  )}
                </p>

              </div>

              {isConnected && (
                <button
                  type="button"
                  onClick={
                    copyAddress
                  }
                  className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    transition
                    ${
                      darkMode
                        ? "bg-white/[0.06] text-white/45 hover:bg-cyan-400/10 hover:text-cyan-400"
                        : "bg-slate-100 text-slate-400 hover:bg-cyan-50 hover:text-cyan-600"
                    }
                  `}
                >
                  <Copy
                    size={14}
                  />
                </button>
              )}

            </div>

          </div>

        </section>

        {/* STATS */}

        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-2.5
          "
        >

          <div
            className={`
              rounded-xl
              border
              px-3
              py-3
              ${
                darkMode
                  ? "border-white/10 bg-white/[0.035]"
                  : "border-slate-200 bg-white shadow-sm"
              }
            `}
          >

            <div
              className={`
                flex
                items-center
                gap-1.5
                ${
                  darkMode
                    ? "text-white/35"
                    : "text-slate-400"
                }
              `}
            >

              <Coins
                size={13}
              />

              <span
                className="
                  text-[10px]
                "
              >
                Assets Held
              </span>

            </div>

            <p
              className="
                mt-1
                text-lg
                font-black
              "
            >
              {assetCount}
            </p>

          </div>

          <div
            className={`
              rounded-xl
              border
              px-3
              py-3
              ${
                darkMode
                  ? "border-white/10 bg-white/[0.035]"
                  : "border-slate-200 bg-white shadow-sm"
              }
            `}
          >

            <div
              className={`
                flex
                items-center
                gap-1.5
                ${
                  darkMode
                    ? "text-white/35"
                    : "text-slate-400"
                }
              `}
            >

              <ShieldCheck
                size={13}
              />

              <span
                className="
                  text-[10px]
                "
              >
                Network
              </span>

            </div>

            <p
              className="
                mt-1
                text-lg
                font-black
              "
            >
              IOPn
            </p>

          </div>

        </div>

        {/* ASSETS */}

        <section
          className={`
            mt-3
            rounded-[1.5rem]
            border
            p-3
            backdrop-blur-xl
            ${
              darkMode
                ? "border-white/10 bg-white/[0.035]"
                : "border-slate-200 bg-white shadow-sm"
            }
          `}
        >

          <div
            className="
              mb-3
              flex
              items-center
              justify-between
            "
          >

            <div>

              <h2
                className="
                  text-base
                  font-black
                "
              >
                Your Assets
              </h2>

              <p
                className={`
                  mt-0.5
                  text-[10px]
                  ${
                    darkMode
                      ? "text-white/30"
                      : "text-slate-400"
                  }
                `}
              >
                Live balances from the blockchain
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
                text-cyan-500
              "
            >
              {assetCount}
            </div>

          </div>

          {!isConnected ? (

            <div
              className={`
                rounded-xl
                border
                border-dashed
                px-4
                py-7
                text-center
                ${
                  darkMode
                    ? "border-white/10 bg-black/20"
                    : "border-slate-200 bg-slate-50"
                }
              `}
            >

              <Wallet
                size={26}
                className={`
                  mx-auto
                  ${
                    darkMode
                      ? "text-white/20"
                      : "text-slate-300"
                  }
                `}
              />

              <h3
                className="
                  mt-3
                  text-sm
                  font-bold
                "
              >
                Wallet not connected
              </h3>

              <p
                className={`
                  mt-1
                  text-xs
                  ${
                    darkMode
                      ? "text-white/30"
                      : "text-slate-400"
                  }
                `}
              >
                Connect your wallet to view your assets.
              </p>

            </div>

          ) : (

            <div
              className="
                space-y-2
              "
            >

              {/* OPN */}

              <div
                className={`
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  px-3
                  py-2.5
                  ${
                    darkMode
                      ? "border-cyan-400/15 bg-cyan-400/[0.055]"
                      : "border-cyan-200 bg-cyan-50"
                  }
                `}
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2.5
                  "
                >

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
                      text-cyan-500
                    "
                  >
                    O
                  </div>

                  <div>

                    <p
                      className="
                        text-sm
                        font-black
                      "
                    >
                      OPN
                    </p>

                    <p
                      className={`
                        text-[9px]
                        ${
                          darkMode
                            ? "text-white/30"
                            : "text-slate-400"
                        }
                      `}
                    >
                      Native Token
                    </p>

                  </div>

                </div>

                <div
                  className="
                    text-right
                  "
                >

                  <p
                    className="
                      text-sm
                      font-black
                      text-cyan-500
                    "
                  >
                    {opnBalance}
                  </p>

                  <p
                    className={`
                      text-[9px]
                      ${
                        darkMode
                          ? "text-white/25"
                          : "text-slate-400"
                      }
                    `}
                  >
                    OPN
                  </p>

                </div>

              </div>

              {/* TOKEN LOADING */}

              {tokensLoading ? (

                <div
                  className={`
                    rounded-xl
                    border
                    px-4
                    py-5
                    text-center
                    text-xs
                    ${
                      darkMode
                        ? "border-white/10 bg-black/20 text-white/35"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }
                  `}
                >

                  <RefreshCw
                    size={15}
                    className="
                      mx-auto
                      mb-2
                      animate-spin
                    "
                  />

                  Checking token balances...

                </div>

              ) : heldTokens.length ===
                0 ? (

                <div
                  className={`
                    rounded-xl
                    border
                    border-dashed
                    px-4
                    py-6
                    text-center
                    ${
                      darkMode
                        ? "border-white/10 bg-black/20"
                        : "border-slate-200 bg-slate-50"
                    }
                  `}
                >

                  <Coins
                    size={22}
                    className={`
                      mx-auto
                      ${
                        darkMode
                          ? "text-white/20"
                          : "text-slate-300"
                      }
                    `}
                  />

                  <p
                    className={`
                      mt-2
                      text-xs
                      font-semibold
                      ${
                        darkMode
                          ? "text-white/40"
                          : "text-slate-500"
                      }
                    `}
                  >
                    No ERC-20 tokens held
                  </p>

                  <p
                    className={`
                      mt-1
                      text-[10px]
                      ${
                        darkMode
                          ? "text-white/25"
                          : "text-slate-400"
                      }
                    `}
                  >
                    Buy or receive a token and it will appear here automatically.
                  </p>

                </div>

              ) : (

                heldTokens.map(
                  (token) => {
                    const formatted =
                      Number(
                        token.balance
                      ).toFixed(
                        6
                      );

                    return (
                      <div
                        key={
                          token.address
                        }
                        className={`
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          border
                          px-3
                          py-2.5
                          transition
                          ${
                            darkMode
                              ? "border-white/10 bg-black/20 hover:border-cyan-400/20"
                              : "border-slate-200 bg-slate-50 hover:border-cyan-300"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2.5
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
                              bg-purple-400/10
                              text-xs
                              font-black
                              text-purple-500
                            "
                          >
                            {token.symbol
                              .slice(
                                0,
                                1
                              )
                              .toUpperCase()}
                          </div>

                          <div>

                            <div
                              className="
                                flex
                                items-center
                                gap-1.5
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  font-bold
                                "
                              >
                                {
                                  token.symbol
                                }
                              </p>

                              {token.imported && (
                                <span
                                  className="
                                    rounded-md
                                    bg-purple-400/10
                                    px-1.5
                                    py-0.5
                                    text-[7px]
                                    font-bold
                                    text-purple-500
                                  "
                                >
                                  IMPORTED
                                </span>
                              )}

                            </div>

                            <p
                              className={`
                                text-[9px]
                                ${
                                  darkMode
                                    ? "text-white/25"
                                    : "text-slate-400"
                                }
                              `}
                            >
                              ERC-20 Token
                            </p>

                          </div>

                        </div>

                        <div
                          className="
                            text-right
                          "
                        >

                          <p
                            className="
                              text-sm
                              font-black
                            "
                          >
                            {formatted}
                          </p>

                          <p
                            className={`
                              text-[9px]
                              ${
                                darkMode
                                  ? "text-white/25"
                                  : "text-slate-400"
                              }
                            `}
                          >
                            {
                              token.symbol
                            }
                          </p>

                        </div>

                      </div>
                    );
                  }
                )

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
            className={`
              mt-3
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              py-3
              text-xs
              font-bold
              transition
              ${
                darkMode
                  ? "border-white/10 bg-white/[0.035] text-white/50 hover:border-cyan-400/20 hover:text-cyan-400"
                  : "border-slate-200 bg-white text-slate-500 shadow-sm hover:border-cyan-300 hover:text-cyan-600"
              }
            `}
          >
            View Wallet on Explorer

            <ExternalLink
              size={14}
            />
          </a>
        )}

      </div>

    </main>
  );
}