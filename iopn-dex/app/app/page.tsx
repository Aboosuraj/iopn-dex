"use client";

import WalletCard from "@/components/dashboard/WalletCard";
import QuickActions from "@/components/dashboard/QuickActions";
import MarketOverview from "@/components/dashboard/MarketOverview";
import TrendingPreview from "@/components/dashboard/TrendingPreview";

export default function AppDashboard() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02050B] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

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
            bg-violet-500/[0.055]
            blur-[130px]
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
            bg-blue-500/[0.045]
            blur-[130px]
          "
        />

        {/* Grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.012]
            [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)]
            [background-size:44px_44px]
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
              bg-cyan-400/[0.035]
              blur-2xl
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
              border-white/[0.07]
              bg-[#070C14]/85
              shadow-[0_15px_45px_rgba(0,0,0,0.22)]
              backdrop-blur-xl
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
                bg-cyan-400/[0.045]
                blur-3xl
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
              border-white/[0.07]
              bg-[#070C14]/85
              shadow-[0_15px_45px_rgba(0,0,0,0.20)]
              backdrop-blur-xl
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
                bg-violet-500/[0.045]
                blur-3xl
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