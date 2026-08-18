"use client";

import {
  ExternalLink,
  History,
  CheckCircle2,
} from "lucide-react";

import { getSwapHistory } from "@/lib/history";
import { useTheme } from "@/components/ThemeProvider";

export default function SwapHistory() {
  const history = getSwapHistory();

  const { darkMode } = useTheme();

  return (
    <div
      className={`
        mt-6
        rounded-3xl
        border
        p-5
        backdrop-blur-xl
        transition-colors
        duration-300
        ${
          darkMode
            ? `
              border-white/10
              bg-white/[0.04]
            `
            : `
              border-slate-200
              bg-white
              shadow-[0_10px_40px_rgba(15,23,42,0.06)]
            `
        }
      `}
    >

      {/* HEADER */}

      <div className="mb-5 flex items-center gap-3">

        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${
              darkMode
                ? "bg-cyan-400/10 text-cyan-400"
                : "bg-cyan-50 text-cyan-600"
            }
          `}
        >
          <History size={19} />
        </div>

        <div>

          <h2
            className={`
              font-black
              ${
                darkMode
                  ? "text-white"
                  : "text-slate-900"
              }
            `}
          >
            Swap History
          </h2>

          <p
            className={`
              text-xs
              ${
                darkMode
                  ? "text-white/35"
                  : "text-slate-500"
              }
            `}
          >
            Your recent transactions
          </p>

        </div>

      </div>


      {/* EMPTY */}

      {history.length === 0 ? (

        <div
          className={`
            rounded-2xl
            border
            border-dashed
            px-5
            py-8
            text-center
            ${
              darkMode
                ? `
                  border-white/10
                  bg-black/20
                `
                : `
                  border-slate-200
                  bg-slate-50
                `
            }
          `}
        >

          <History
            size={25}
            className={
              darkMode
                ? "mx-auto text-white/20"
                : "mx-auto text-slate-300"
            }
          />

          <p
            className={`
              mt-3
              text-sm
              font-semibold
              ${
                darkMode
                  ? "text-white/50"
                  : "text-slate-600"
              }
            `}
          >
            No swaps yet
          </p>

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
            Your completed swaps will appear here.
          </p>

        </div>

      ) : (

        <div className="space-y-3">

          {history.map((tx) => (

            <div
              key={tx.hash}
              className={`
                rounded-2xl
                border
                p-4
                transition
                ${
                  darkMode
                    ? `
                      border-white/10
                      bg-black/20
                      hover:border-cyan-400/20
                    `
                    : `
                      border-slate-200
                      bg-slate-50
                      hover:border-cyan-300
                    `
                }
              `}
            >

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      font-black
                      ${
                        darkMode
                          ? `
                            bg-cyan-400/10
                            text-cyan-400
                          `
                          : `
                            bg-cyan-50
                            text-cyan-600
                          `
                      }
                    `}
                  >
                    ⇄
                  </div>

                  <div>

                    <div
                      className={`
                        font-bold
                        ${
                          darkMode
                            ? "text-white"
                            : "text-slate-900"
                        }
                      `}
                    >
                      {tx.tokenIn}

                      <span
                        className={`
                          mx-2
                          ${
                            darkMode
                              ? "text-white/30"
                              : "text-slate-300"
                          }
                        `}
                      >
                        →
                      </span>

                      {tx.tokenOut}
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
                      {tx.amountIn} {tx.tokenIn}
                      {" → "}
                      {tx.amountOut} {tx.tokenOut}
                    </p>

                  </div>

                </div>


                {/* STATUS */}

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1
                    rounded-full
                    bg-emerald-400/10
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    text-emerald-500
                  "
                >
                  <CheckCircle2 size={12} />
                  Success
                </div>

              </div>


              {/* HASH */}

              <div
                className={`
                  mt-4
                  flex
                  items-center
                  justify-between
                  border-t
                  pt-3
                  ${
                    darkMode
                      ? "border-white/5"
                      : "border-slate-200"
                  }
                `}
              >

                <span
                  className={`
                    font-mono
                    text-[10px]
                    ${
                      darkMode
                        ? "text-white/25"
                        : "text-slate-400"
                    }
                  `}
                >
                  {tx.hash.slice(0, 10)}...
                  {tx.hash.slice(-6)}
                </span>

                <a
                  href={`https://testnet.iopn.tech/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex
                    items-center
                    gap-1
                    text-xs
                    font-bold
                    text-cyan-500
                    transition
                    hover:text-cyan-400
                  "
                >
                  Explorer
                  <ExternalLink size={12} />
                </a>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}