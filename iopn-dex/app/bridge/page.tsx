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
        bg-slate-50
        text-slate-900
        transition-colors
        dark:bg-[#02050B]
        dark:text-white
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
            bg-cyan-400/[0.06]
            blur-[120px]
            dark:bg-cyan-500/[0.07]
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
            bg-violet-400/[0.05]
            blur-[140px]
            dark:bg-violet-600/[0.07]
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
            bg-blue-400/[0.04]
            blur-[140px]
            dark:bg-blue-600/[0.06]
          "
        />

        {/* Grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            dark:opacity-[0.015]
            [background-image:linear-gradient(rgba(100,116,139,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,.5)_1px,transparent_1px)]
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
                  text-cyan-600
                  shadow-[0_0_25px_rgba(34,211,238,0.08)]
                  dark:text-cyan-300
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
                    text-slate-500
                    dark:text-white/40
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
                border-slate-200
                bg-white
                text-slate-400
                shadow-sm
                dark:border-white/10
                dark:bg-white/[0.035]
                dark:text-white/40
                dark:shadow-none
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
            border-slate-200
            bg-white
            p-5
            shadow-[0_25px_70px_rgba(15,23,42,0.08)]
            dark:border-white/[0.08]
            dark:bg-[#080D17]
            dark:shadow-[0_25px_70px_rgba(0,0,0,0.35)]
            sm:p-6
          "
        >

          {/* Card glow */}

          <div
            className="
              pointer-events-none
              absolute
              right-[-100px]
              top-[-100px]
              h-52
              w-52
              rounded-full
              bg-cyan-400/[0.06]
              blur-[80px]
              dark:bg-cyan-400/[0.08]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              bottom-[-100px]
              left-[-80px]
              h-48
              w-48
              rounded-full
              bg-violet-400/[0.05]
              blur-[80px]
              dark:bg-violet-500/[0.07]
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
              border-amber-200
              bg-amber-50
              px-4
              py-3
              dark:border-amber-400/10
              dark:bg-amber-400/[0.04]
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
                  bg-amber-100
                  text-amber-600
                  dark:bg-amber-400/10
                  dark:text-amber-400
                "
              >
                <Clock3 size={17} />
              </div>

              <div>

                <p
                  className="
                    text-xs
                    font-black
                    text-amber-700
                    dark:text-amber-300
                  "
                >
                  Bridge Coming Soon
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-amber-700/60
                    dark:text-amber-300/45
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
                border-slate-200
                bg-slate-50
                p-4
                dark:border-white/[0.07]
                dark:bg-[#0D1420]
              "
            >

              <div className="flex items-center justify-between">

                <span
                  className="
                    text-xs
                    font-semibold
                    text-slate-500
                    dark:text-white/40
                  "
                >
                  From
                </span>

                <span
                  className="
                    text-[10px]
                    font-semibold
                    text-slate-400
                    dark:text-white/25
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
                      bg-cyan-100
                      text-sm
                      font-black
                      text-cyan-700
                      ring-1
                      ring-cyan-200
                      dark:bg-cyan-400/10
                      dark:text-cyan-300
                      dark:ring-cyan-400/20
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
                        text-slate-400
                        dark:text-white/35
                      "
                    >
                      OPN Testnet
                    </p>

                  </div>

                </div>

                <span
                  className="
                    rounded-full
                    bg-slate-200
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    text-slate-500
                    dark:bg-white/[0.05]
                    dark:text-white/35
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
                  border-cyan-300
                  bg-white
                  text-cyan-600
                  shadow-[0_5px_25px_rgba(34,211,238,0.12)]
                  dark:border-cyan-400/30
                  dark:bg-[#0B1220]
                  dark:text-cyan-300
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
                border-slate-200
                bg-slate-50
                p-4
                dark:border-white/[0.07]
                dark:bg-[#0D1420]
              "
            >

              <div className="flex items-center justify-between">

                <span
                  className="
                    text-xs
                    font-semibold
                    text-slate-500
                    dark:text-white/40
                  "
                >
                  To
                </span>

                <span
                  className="
                    text-[10px]
                    font-semibold
                    text-slate-400
                    dark:text-white/25
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
                      bg-violet-100
                      text-sm
                      font-black
                      text-violet-700
                      ring-1
                      ring-violet-200
                      dark:bg-violet-400/10
                      dark:text-violet-300
                      dark:ring-violet-400/20
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
                        text-slate-400
                        dark:text-white/35
                      "
                    >
                      Coming soon
                    </p>

                  </div>

                </div>

                <span
                  className="
                    rounded-full
                    bg-violet-100
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    text-violet-600
                    dark:bg-violet-400/10
                    dark:text-violet-300
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
                border-slate-200
                bg-slate-50
                p-3
                dark:border-white/[0.06]
                dark:bg-white/[0.025]
              "
            >

              <ShieldCheck
                size={17}
                className="text-cyan-500 dark:text-cyan-300"
              />

              <p
                className="
                  mt-2
                  text-[10px]
                  font-bold
                  text-slate-600
                  dark:text-white/55
                "
              >
                Secure
              </p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-3
                dark:border-white/[0.06]
                dark:bg-white/[0.025]
              "
            >

              <Zap
                size={17}
                className="text-violet-500 dark:text-violet-300"
              />

              <p
                className="
                  mt-2
                  text-[10px]
                  font-bold
                  text-slate-600
                  dark:text-white/55
                "
              >
                Fast
              </p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-3
                dark:border-white/[0.06]
                dark:bg-white/[0.025]
              "
            >

              <Globe2
                size={17}
                className="text-blue-500 dark:text-blue-300"
              />

              <p
                className="
                  mt-2
                  text-[10px]
                  font-bold
                  text-slate-600
                  dark:text-white/55
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
              bg-cyan-500
              py-4
              text-sm
              font-black
              text-black
              opacity-60
              shadow-[0_10px_30px_rgba(6,182,212,0.12)]
              dark:bg-cyan-400
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
              text-slate-400
              dark:text-white/30
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