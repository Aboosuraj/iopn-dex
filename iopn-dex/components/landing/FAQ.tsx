"use client";

import { useState } from "react";

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
      className="mx-auto max-w-4xl px-6 py-24"
    >
      <div className="text-center">

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
          FAQ
        </p>

        <h2 className="mt-4 text-4xl font-black md:text-5xl">
          Frequently Asked Questions
        </h2>

        <p className="mt-5 text-white/60">
          Everything you need to know about IOPn DEX.
        </p>

      </div>

      <div className="mt-12 space-y-4">

        {questions.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenIndex(isOpen ? null : index)
                }
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-bold">
                  {item.question}
                </span>

                <span className="text-xl text-cyan-400">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-7 text-white/60">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </section>
  );
}