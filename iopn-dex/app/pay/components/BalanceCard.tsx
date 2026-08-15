"use client";

import {
  ArrowDownToLine,
  ScanLine,
  CreditCard,
  Send,
  Copy,
  Wallet,
} from "lucide-react";

interface BalanceCardProps {
  balance: string;
  token: string;
  address?: string;
  onReceive: () => void;
  onScanner: () => void;
  onVirtualCard: () => void;
  onSend: () => void;
}

export default function BalanceCard({
  balance,
  token,
  address,
  onReceive,
  onScanner,
  onVirtualCard,
  onSend,
}: BalanceCardProps) {

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";


  async function copyAddress() {

    if (!address) return;

    try {

      await navigator.clipboard.writeText(
        address
      );

    } catch (error) {

      console.error(
        "Failed to copy address:",
        error
      );

    }

  }


  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-[26px]
        border
        border-white/[0.10]
        bg-gradient-to-br
        from-[#111827]
        via-[#0B1220]
        to-[#111827]
        p-4
        shadow-[0_18px_50px_rgba(0,0,0,0.35)]
      "
    >

      {/* =====================================================
          CARD GLOW
      ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-cyan-400/[0.10]
          blur-[70px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          -left-16
          h-44
          w-44
          rounded-full
          bg-violet-500/[0.08]
          blur-[70px]
        "
      />


      {/* =====================================================
          TOP
      ===================================================== */}

      <div
        className="
          relative
          flex
          items-center
          justify-between
        "
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
              border
              border-cyan-400/15
              bg-cyan-400/10
            "
          >

            <Wallet
              size={17}
              className="text-cyan-300"
            />

          </div>


          <div>

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white/40
              "
            >
              Available Balance
            </p>

            <p
              className="
                mt-0.5
                text-xs
                font-semibold
                text-white/75
              "
            >
              Your wallet
            </p>

          </div>

        </div>


        {/* TOKEN BADGE */}

        <div
          className="
            rounded-xl
            border
            border-cyan-400/15
            bg-cyan-400/[0.07]
            px-3
            py-2
            text-right
          "
        >

          <p
            className="
              text-[8px]
              font-semibold
              uppercase
              tracking-widest
              text-white/30
            "
          >
            Network
          </p>

          <p
            className="
              mt-0.5
              text-xs
              font-black
              text-cyan-300
            "
          >
            {token}
          </p>

        </div>

      </div>


      {/* =====================================================
          BALANCE
      ===================================================== */}

      <div
        className="
          relative
          mt-4
        "
      >

        <div
          className="
            flex
            items-baseline
            gap-2
          "
        >

          <span
            className="
              text-[40px]
              font-black
              leading-none
              tracking-[-0.04em]
              text-white
            "
          >
            {balance}
          </span>


          <span
            className="
              text-sm
              font-bold
              text-cyan-300
            "
          >
            {token}
          </span>

        </div>


        {/* ADDRESS */}

        <button
          type="button"
          onClick={copyAddress}
          disabled={!address}
          className="
            mt-3
            flex
            max-w-full
            items-center
            gap-2
            rounded-xl
            border
            border-white/[0.07]
            bg-black/20
            px-3
            py-2
            transition
            hover:border-cyan-400/20
            hover:bg-cyan-400/[0.04]
            active:scale-[0.98]
          "
        >

          <span
            className="
              truncate
              font-mono
              text-[10px]
              text-white/40
            "
          >
            {shortAddress}
          </span>

          {address && (
            <Copy
              size={12}
              className="
                shrink-0
                text-white/30
              "
            />
          )}

        </button>

      </div>


      {/* =====================================================
          ACTION BUTTONS
      ===================================================== */}

      <div
        className="
          relative
          mt-4
          grid
          grid-cols-4
          gap-2
        "
      >

        {/* SEND */}

        <button
          type="button"
          onClick={onSend}
          className="
            group
            flex
            min-h-[66px]
            flex-col
            items-center
            justify-center
            gap-1.5
            rounded-2xl
            border
            border-cyan-400/20
            bg-cyan-400/[0.08]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-cyan-300/35
            hover:bg-cyan-400/[0.13]
            active:scale-[0.96]
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              bg-cyan-400/10
              transition
              group-hover:bg-cyan-400/15
            "
          >

            <Send
              size={16}
              className="
                text-cyan-300
              "
            />

          </div>


          <span
            className="
              text-[10px]
              font-bold
              text-white/70
            "
          >
            Send
          </span>

        </button>


        {/* RECEIVE */}

        <button
          type="button"
          onClick={onReceive}
          className="
            group
            flex
            min-h-[66px]
            flex-col
            items-center
            justify-center
            gap-1.5
            rounded-2xl
            border
            border-white/[0.08]
            bg-white/[0.035]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-emerald-400/25
            hover:bg-emerald-400/[0.06]
            active:scale-[0.96]
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              bg-emerald-400/10
            "
          >

            <ArrowDownToLine
              size={16}
              className="
                text-emerald-300
              "
            />

          </div>


          <span
            className="
              text-[10px]
              font-bold
              text-white/70
            "
          >
            Receive
          </span>

        </button>


        {/* SCAN */}

        <button
          type="button"
          onClick={onScanner}
          className="
            group
            flex
            min-h-[66px]
            flex-col
            items-center
            justify-center
            gap-1.5
            rounded-2xl
            border
            border-white/[0.08]
            bg-white/[0.035]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-violet-400/25
            hover:bg-violet-400/[0.06]
            active:scale-[0.96]
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              bg-violet-400/10
            "
          >

            <ScanLine
              size={16}
              className="
                text-violet-300
              "
            />

          </div>


          <span
            className="
              text-[10px]
              font-bold
              text-white/70
            "
          >
            Scan
          </span>

        </button>


        {/* CARD */}

        <button
          type="button"
          onClick={onVirtualCard}
          className="
            group
            flex
            min-h-[66px]
            flex-col
            items-center
            justify-center
            gap-1.5
            rounded-2xl
            border
            border-white/[0.08]
            bg-white/[0.035]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-blue-400/25
            hover:bg-blue-400/[0.06]
            active:scale-[0.96]
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              bg-blue-400/10
            "
          >

            <CreditCard
              size={16}
              className="
                text-blue-300
              "
            />

          </div>


          <span
            className="
              text-[10px]
              font-bold
              text-white/70
            "
          >
            Card
          </span>

        </button>

      </div>


      {/* =====================================================
          BOTTOM STATUS
      ===================================================== */}

      <div
        className="
          relative
          mt-3
          flex
          items-center
          justify-center
          gap-1.5
          text-[9px]
          font-semibold
          text-white/25
        "
      >

        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-emerald-400
            shadow-[0_0_8px_rgba(52,211,153,0.7)]
          "
        />

        Wallet balance • IOPn Testnet

      </div>

    </div>

  );
}