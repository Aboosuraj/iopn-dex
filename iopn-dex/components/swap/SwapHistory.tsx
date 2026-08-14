"use client";

import { ExternalLink, History, CheckCircle2 } from "lucide-react";
import { getSwapHistory } from "@/lib/history";

export default function SwapHistory() {
  const history = getSwapHistory();

  return (
    <div
      className="
        mt-6
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-5
        backdrop-blur-xl
      "
    >

      {/* HEADER */}

      <div className="mb-5 flex items-center gap-3">

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-cyan-400/10
            text-cyan-400
          "
        >
          <History size={19} />
        </div>

        <div>

          <h2 className="font-black">
            Swap History
          </h2>

          <p className="text-xs text-white/35">
            Your recent transactions
          </p>

        </div>

      </div>


      {/* EMPTY */}

      {history.length === 0 ? (

        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-white/10
            bg-black/20
            px-5
            py-8
            text-center
          "
        >

          <History
            size={25}
            className="mx-auto text-white/20"
          />

          <p className="mt-3 text-sm font-semibold text-white/50">
            No swaps yet
          </p>

          <p className="mt-1 text-xs text-white/30">
            Your completed swaps will appear here.
          </p>

        </div>

      ) : (

        <div className="space-y-3">

          {history.map((tx) => (

            <div
              key={tx.hash}
              className="
                rounded-2xl
                border
                border-white/10
                bg-black/20
                p-4
                transition
                hover:border-cyan-400/20
              "
            >

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-cyan-400/10
                      font-black
                      text-cyan-400
                    "
                  >
                    ⇄
                  </div>

                  <div>

                    <div className="font-bold">
                      {tx.tokenIn}
                      <span className="mx-2 text-white/30">
                        →
                      </span>
                      {tx.tokenOut}
                    </div>

                    <p className="mt-1 text-xs text-white/40">
                      {tx.amountIn} {tx.tokenIn}
                      {" → "}
                      {tx.amountOut} {tx.tokenOut}
                    </p>

                  </div>

                </div>


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
                    text-emerald-400
                  "
                >
                  <CheckCircle2 size={12} />
                  Success
                </div>

              </div>


              {/* HASH */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  border-t
                  border-white/5
                  pt-3
                "
              >

                <span className="font-mono text-[10px] text-white/25">
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
                    text-cyan-400
                    transition
                    hover:text-cyan-300
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