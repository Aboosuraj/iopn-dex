"use client";

import {
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  Globe2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function BridgePage() {
  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#02050B]
        pb-28
        text-white
      "
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        {/* Cyan glow */}

        <div
          className="
            absolute
            left-[-120px]
            top-[-160px]
            h-[340px]
            w-[340px]
            rounded-full
            bg-cyan-500/[0.07]
            blur-[120px]
          "
        />

        {/* Violet glow */}

        <div
          className="
            absolute
            right-[-160px]
            top-[28%]
            h-[380px]
            w-[380px]
            rounded-full
            bg-violet-600/[0.07]
            blur-[140px]
          "
        />

        {/* Blue glow */}

        <div
          className="
            absolute
            bottom-[-180px]
            left-[10%]
            h-[360px]
            w-[360px]
            rounded-full
            bg-blue-600/[0.06]
            blur-[140px]
          "
        />

        {/* Grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.015]
            [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)]
            [background-size:42px_42px]
          "
        />
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-xl
          flex-col
          justify-center
          px-4
          pb-28
          pt-8
          sm:px-6
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-5">

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
                  border
                  border-cyan-400/20
                  bg-cyan-400/10
                  text-cyan-300
                  shadow-[0_0_25px_rgba(34,211,238,0.08)]
                "
              >
                <ArrowLeftRight size={21} />
              </div>

              <div>

                <h1
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  Bridge
                </h1>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-white/40
                  "
                >
                  Move assets across networks
                </p>

              </div>

            </div>

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-white/[0.035]
                text-white/40
              "
            >
              <Globe2 size={18} />
            </div>

          </div>

        </div>

        {/* =================================================
            BRIDGE CARD
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.08]
            bg-[#080D17]
            p-5
            shadow-[0_25px_70px_rgba(0,0,0,0.35)]
            sm:p-6
          "
        >

          {/* Card cyan glow */}

          <div
            className="
              pointer-events-none
              absolute
              right-[-100px]
              top-[-100px]
              h-52
              w-52
              rounded-full
              bg-cyan-400/[0.08]
              blur-[80px]
            "
          />

          {/* Card violet glow */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-[-100px]
              left-[-80px]
              h-48
              w-48
              rounded-full
              bg-violet-500/[0.07]
              blur-[80px]
            "
          />

          {/* =================================================
              STATUS
          ================================================= */}

          <div
            className="
              relative
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-amber-400/10
              bg-amber-400/[0.04]
              px-4
              py-3
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-400/10
                  text-amber-400
                "
              >
                <Clock3 size={17} />
              </div>

              <div>

                <p
                  className="
                    text-xs
                    font-black
                    text-amber-300
                  "
                >
                  Bridge Coming Soon
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-amber-300/45
                  "
                >
                  Cross-chain transfers are being prepared
                </p>

              </div>

            </div>

            <Sparkles
              size={17}
              className="text-amber-500/70"
            />

          </div>

          {/* =================================================
              BRIDGE PREVIEW
          ================================================= */}

          <div className="relative mt-5">

            {/* FROM */}

            <div
              className="
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#0D1420]
                p-4
              "
            >

              <div className="flex items-center justify-between">

                <span
                  className="
                    text-xs
                    font-semibold
                    text-white/40
                  "
                >
                  From
                </span>

                <span
                  className="
                    text-[10px]
                    font-semibold
                    text-white/25
                  "
                >
                  Network
                </span>

              </div>

              <div className="mt-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-cyan-400/10
                      text-sm
                      font-black
                      text-cyan-300
                      ring-1
                      ring-cyan-400/20
                    "
                  >
                    O
                  </div>

                  <div>

                    <p className="font-black">
                      OPN
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-white/35
                      "
                    >
                      OPN Testnet
                    </p>

                  </div>

                </div>

                <span
                  className="
                    rounded-full
                    bg-white/[0.05]
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    text-white/35
                  "
                >
                  Source
                </span>

              </div>

            </div>

            {/* BRIDGE ICON */}

            <div className="relative z-10 -my-3 flex justify-center">

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-cyan-400/30
                  bg-[#0B1220]
                  text-cyan-300
                  shadow-[0_5px_25px_rgba(34,211,238,0.12)]
                "
              >
                <ArrowLeftRight size={18} />
              </div>

            </div>

            {/* TO */}

            <div
              className="
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#0D1420]
                p-4
              "
            >

              <div className="flex items-center justify-between">

                <span
                  className="
                    text-xs
                    font-semibold
                    text-white/40
                  "
                >
                  To
                </span>

                <span
                  className="
                    text-[10px]
                    font-semibold
                    text-white/25
                  "
                >
                  Destination
                </span>

              </div>

              <div className="mt-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-violet-400/10
                      text-sm
                      font-black
                      text-violet-300
                      ring-1
                      ring-violet-400/20
                    "
                  >
                    ?
                  </div>

                  <div>

                    <p className="font-black">
                      Select Network
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-white/35
                      "
                    >
                      Coming soon
                    </p>

                  </div>

                </div>

                <span
                  className="
                    rounded-full
                    bg-violet-400/10
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    text-violet-300
                  "
                >
                  Soon
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              FEATURES
          ================================================= */}

          <div className="relative mt-5 grid grid-cols-3 gap-2">

            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                p-3
              "
            >

              <ShieldCheck
                size={17}
                className="text-cyan-300"
              />

              <p
                className="
                  mt-2
                  text-[10px]
                  font-bold
                  text-white/55
                "
              >
                Secure
              </p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                p-3
              "
            >

              <Zap
                size={17}
                className="text-violet-300"
              />

              <p
                className="
                  mt-2
                  text-[10px]
                  font-bold
                  text-white/55
                "
              >
                Fast
              </p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                p-3
              "
            >

              <Globe2
                size={17}
                className="text-blue-300"
              />

              <p
                className="
                  mt-2
                  text-[10px]
                  font-bold
                  text-white/55
                "
              >
                Multi-chain
              </p>

            </div>

          </div>

          {/* =================================================
              CTA
          ================================================= */}

          <button
            type="button"
            disabled
            className="
              relative
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-cyan-400
              py-4
              text-sm
              font-black
              text-black
              opacity-60
              shadow-[0_10px_30px_rgba(6,182,212,0.12)]
            "
          >
            <CheckCircle2 size={18} />
            Bridge Coming Soon
          </button>

          {/* =================================================
              FOOTER NOTE
          ================================================= */}

          <p
            className="
              relative
              mt-4
              text-center
              text-[10px]
              leading-5
              text-white/30
            "
          >
            IOPn DEX is preparing secure cross-chain
            transfers for the IOPn ecosystem.
          </p>

        </section>

      </div>
    </main>
  );
}