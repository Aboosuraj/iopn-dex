"use client";

import { useState } from "react";
import { Coins, X, ShieldCheck } from "lucide-react";

type Token = {
  symbol: string;
  address: string;
  decimals: number;
  native: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onImport: (token: Token) => void;
};

export default function TokenImport({
  open,
  onClose,
  onImport,
}: Props) {
  const [address, setAddress] = useState("");

  if (!open) {
    return null;
  }

  function submit() {
    if (!address.startsWith("0x")) {
      return;
    }

    onImport({
      symbol: "CUSTOM",
      address,
      decimals: 18,
      native: false,
    });

    setAddress("");
    onClose();
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[110]
        flex
        items-end
        justify-center
        bg-black/70
        backdrop-blur-md
        sm:items-center
        sm:px-4
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-t-[2rem]
          border
          border-white/10
          bg-[#080d1d]
          p-6
          text-white
          shadow-[0_0_70px_rgba(6,182,212,0.12)]
          sm:rounded-[2rem]
        "
      >

        <div className="flex items-center justify-between">

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
                text-cyan-400
              "
            >
              <Coins size={21} />
            </div>

            <div>
              <h2 className="text-xl font-black">
                Import Token
              </h2>

              <p className="mt-1 text-xs text-white/40">
                Add a custom token contract
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/[0.04]
              text-white/50
              transition
              hover:border-cyan-400/30
              hover:text-cyan-400
            "
          >
            <X size={18} />
          </button>

        </div>


        <div className="mt-6">

          <label
            htmlFor="token-address"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-white/60
            "
          >
            Contract Address
          </label>

          <input
            id="token-address"
            value={address}
            onChange={(event) =>
              setAddress(event.target.value)
            }
            placeholder="0x..."
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-4
              py-4
              font-mono
              text-sm
              text-white
              outline-none
              placeholder:text-white/25
              transition
              focus:border-cyan-400/50
              focus:bg-white/[0.06]
            "
          />

        </div>


        <div
          className="
            mt-5
            flex
            gap-3
            rounded-2xl
            border
            border-amber-400/10
            bg-amber-400/[0.04]
            p-4
          "
        >
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-amber-400"
          />

          <p className="text-xs leading-5 text-white/45">
            Only import tokens from contracts you trust.
            Always verify the contract address before swapping.
          </p>
        </div>


        <button
          type="button"
          onClick={submit}
          disabled={!address.startsWith("0x")}
          className="
            mt-6
            w-full
            rounded-2xl
            bg-cyan-400
            py-4
            font-black
            text-black
            transition
            hover:bg-cyan-300
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Import Token
        </button>


        <button
          type="button"
          onClick={onClose}
          className="
            mt-3
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]
            py-4
            font-bold
            text-white/70
            transition
            hover:bg-white/[0.06]
            hover:text-white
          "
        >
          Cancel
        </button>

      </div>
    </div>
  );
}