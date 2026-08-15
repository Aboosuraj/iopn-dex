"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRightLeft } from "lucide-react";

interface Props {
  buttonText: string;
  loading: boolean;
  onSwap: () => void;
}

export default function SwapActionButton({
  buttonText,
  loading,
  onSwap,
}: Props) {
  if (buttonText === "Connect Wallet") {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal, mounted }) => (
          <button
            type="button"
            onClick={openConnectModal}
            disabled={!mounted}
            className="
              mt-4
              flex
              min-h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-cyan-500
              px-4
              py-3
              text-base
              font-black
              text-black
              shadow-[0_8px_24px_rgba(6,182,212,.12)]
              transition-all
              duration-200
              hover:bg-cyan-400
              hover:shadow-[0_8px_28px_rgba(6,182,212,.2)]
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Connect Wallet
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  return (
    <button
      type="button"
      onClick={onSwap}
      disabled={loading}
      className="
        mt-4
        flex
        min-h-12
        w-full
        items-center
        justify-center
        gap-2
        rounded-2xl
        bg-cyan-500
        px-4
        py-3
        text-base
        font-black
        text-black
        shadow-[0_8px_24px_rgba(6,182,212,.12)]
        transition-all
        duration-200
        hover:bg-cyan-400
        hover:shadow-[0_8px_28px_rgba(6,182,212,.2)]
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      <ArrowRightLeft size={19} />

      {loading ? "Processing..." : buttonText}
    </button>
  );
}