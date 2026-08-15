"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const questions = [
  {
    question: "What is IOPn DEX?",
    answer:
      "IOPn DEX is a decentralized trading platform designed for the IOPn ecosystem. It provides token discovery, wallet connectivity and swapping through supported liquidity sources.",
  },
  {
    question: "Is IOPn DEX currently on Testnet?",
    answer:
      "Yes. The initial version is being developed and tested on the IOPn Testnet before the production Mainnet launch.",
  },
  {
    question: "Can I search for a token by contract address?",
    answer:
      "Yes. The DEX is designed to let users search supported tokens by name, symbol or contract address.",
  },
  {
    question: "How does the DEX find the best swap price?",
    answer:
      "The planned aggregation system will compare available liquidity and routes across supported IOPn DEXs to help users find competitive swap execution.",
  },
  {
    question: "Do IOPn DEX take custody of my tokens?",
    answer:
      "No. Users connect their own compatible wallet and approve transactions themselves. Never share your private key or seed phrase with anyone.",
  },
  {
    question: "Will IOPn DEX support Mainnet?",
    answer:
      "Yes. Testnet is the first stage. After testing and validation, the application will be prepared for IOPn Mainnet.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16"
    >
      {/* HEADER */}
      <div className="text-center">

        <div className="mb-3 flex items-center justify-center gap-2">

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              border
              border-cyan-400/15
              bg-cyan-400/[0.07]
              shadow-[0_0_20px_rgba(34,211,238,0.05)]
            "
          >
            <HelpCircle
              size={16}
              className="text-cyan-400"
              strokeWidth={2}
            />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400">
            FAQ
          </span>

        </div>

        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Frequently Asked Questions
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-white/40 sm:text-sm">
          Everything you need to know about IOPn DEX.
        </p>

      </div>


      {/* QUESTIONS */}
      <div className="mt-8 space-y-2.5">

        {questions.map((item, index) => {

          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className={`
                group
                overflow-hidden
                rounded-2xl
                border
                transition-all
                duration-200
                ${
                  isOpen
                    ? "border-cyan-400/15 bg-[#0b1220] shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
                    : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.035]"
                }
              `}
            >

              {/* QUESTION */}
              <button
                type="button"
                onClick={() =>
                  setOpenIndex(isOpen ? null : index)
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  gap-4
                  px-4
                  py-3.5
                  text-left
                  sm:px-5
                "
                aria-expanded={isOpen}
              >

                <div className="flex min-w-0 items-center gap-3">

                  {/* NUMBER */}
                  <span
                    className={`
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-[9px]
                      font-black
                      ${
                        isOpen
                          ? "bg-cyan-400/[0.1] text-cyan-400"
                          : "bg-white/[0.04] text-white/25"
                      }
                    `}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`
                      text-xs
                      font-bold
                      leading-5
                      transition-colors
                      sm:text-sm
                      ${
                        isOpen
                          ? "text-white"
                          : "text-white/75 group-hover:text-white"
                      }
                    `}
                  >
                    {item.question}
                  </span>

                </div>


                {/* ARROW */}
                <span
                  className={`
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    transition-all
                    duration-200
                    ${
                      isOpen
                        ? "rotate-180 border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-400"
                        : "border-white/[0.06] bg-white/[0.025] text-white/30"
                    }
                  `}
                >
                  <ChevronDown size={14} />
                </span>

              </button>


              {/* ANSWER */}
              <div
                className={`
                  grid
                  transition-all
                  duration-200
                  ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }
                `}
              >

                <div className="overflow-hidden">

                  <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 pl-14 sm:px-5 sm:pl-16">

                    <p className="text-[11px] leading-5 text-white/45 sm:text-xs sm:leading-6">
                      {item.answer}
                    </p>

                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>


      {/* BOTTOM STATUS */}
      <div className="mt-6 flex items-center justify-center gap-2">

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

        <span className="text-[9px] font-medium text-white/25">
          IOPn DEX Testnet
        </span>

      </div>

    </section>
  );
}