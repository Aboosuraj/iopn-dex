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
            onClick={openConnectModal}
            disabled={!mounted}
            className="
              mt-8
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-2xl
              bg-cyan-500
              py-4
              text-lg
              font-black
              text-black
              transition
              hover:bg-cyan-400
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
      onClick={onSwap}
      disabled={loading}
      className="
        mt-8
        flex
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        bg-cyan-500
        py-4
        text-lg
        font-black
        text-black
        transition
        hover:bg-cyan-400
        disabled:opacity-50
      "
    >
      <ArrowRightLeft size={22} />

      {loading ? "Processing..." : buttonText}
    </button>
  );
}