"use client";

import WalletCard from "@/components/dashboard/WalletCard";
import QuickActions from "@/components/dashboard/QuickActions";
import MarketOverview from "@/components/dashboard/MarketOverview";
import TrendingPreview from "@/components/dashboard/TrendingPreview";

export default function AppDashboard() {
  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-white
        text-slate-900

        dark:bg-[#02050B]
        dark:text-white
      "
    >

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          -z-10
          overflow-hidden
        "
      >

        {/* Cyan */}

        <div
          className="
            absolute
            left-[-120px]
            top-[-160px]
            h-[320px]
            w-[320px]
            rounded-full
            bg-cyan-400/[0.055]
            blur-[120px]

            dark:bg-cyan-400/[0.055]
          "
        />

        {/* Violet */}

        <div
          className="
            absolute
            right-[-160px]
            top-[30%]
            h-[340px]
            w-[340px]
            rounded-full
            bg-violet-500/[0.045]
            blur-[130px]

            dark:bg-violet-500/[0.055]
          "
        />

        {/* Blue */}

        <div
          className="
            absolute
            bottom-[-180px]
            left-[15%]
            h-[320px]
            w-[320px]
            rounded-full
            bg-blue-500/[0.035]
            blur-[130px]

            dark:bg-blue-500/[0.045]
          "
        />

        {/* Grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.012]

            [background-image:linear-gradient(rgba(15,23,42,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.25)_1px,transparent_1px)]
            [background-size:44px_44px]

            dark:[background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)]
          "
        />

      </div>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-2xl
          px-3
          pb-28
          pt-3
          sm:px-5
          sm:pt-5
        "
      >

        {/* =================================================
            WALLET
        ================================================= */}

        <section className="relative">

          <div
            className="
              pointer-events-none
              absolute
              -inset-2
              rounded-[30px]
              bg-cyan-400/[0.025]
              blur-2xl

              dark:bg-cyan-400/[0.035]
            "
          />

          <div className="relative">
            <WalletCard />
          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="mt-3">

          <QuickActions />

        </section>


        {/* =================================================
            MARKET OVERVIEW
        ================================================= */}

        <section className="mt-4">

          <div
            className="
              relative
              overflow-hidden
              rounded-[22px]

              border
              border-slate-200

              bg-white

              shadow-[0_15px_45px_rgba(15,23,42,0.08)]

              backdrop-blur-xl

              dark:border-white/[0.07]
              dark:bg-[#070C14]/85
              dark:shadow-[0_15px_45px_rgba(0,0,0,0.22)]
            "
          >

            {/* Cyan accent */}

            <div
              className="
                pointer-events-none
                absolute
                right-[-90px]
                top-[-90px]
                h-44
                w-44
                rounded-full
                bg-cyan-400/[0.035]
                blur-3xl

                dark:bg-cyan-400/[0.045]
              "
            />

            <div className="relative">
              <MarketOverview />
            </div>

          </div>

        </section>


        {/* =================================================
            TRENDING
        ================================================= */}

        <section className="mt-3">

          <div
            className="
              relative
              overflow-hidden
              rounded-[22px]

              border
              border-slate-200

              bg-white

              shadow-[0_15px_45px_rgba(15,23,42,0.07)]

              backdrop-blur-xl

              dark:border-white/[0.07]
              dark:bg-[#070C14]/85
              dark:shadow-[0_15px_45px_rgba(0,0,0,0.20)]
            "
          >

            {/* Violet accent */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-[-90px]
                left-[-70px]
                h-44
                w-44
                rounded-full
                bg-violet-500/[0.035]
                blur-3xl

                dark:bg-violet-500/[0.045]
              "
            />

            <div className="relative">
              <TrendingPreview />
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}