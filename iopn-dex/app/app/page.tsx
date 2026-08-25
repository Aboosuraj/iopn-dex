import WalletCard from "@/components/dashboard/WalletCard";
import QuickActions from "@/components/dashboard/QuickActions";
import MarketOverview from "@/components/dashboard/MarketOverview";
import TrendingPreview from "@/components/dashboard/TrendingPreview";

export default function AppDashboard() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* =====================================================
          PREMIUM WEB3 BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        {/* Cyan glow */}

        <div
          className="
            absolute
            left-[10%]
            top-[-180px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-cyan-500/[0.09]
            blur-[130px]
          "
        />

        {/* Violet glow */}

        <div
          className="
            absolute
            right-[-160px]
            top-[25%]
            h-[380px]
            w-[380px]
            rounded-full
            bg-violet-600/[0.08]
            blur-[140px]
          "
        />

        {/* Blue bottom glow */}

        <div
          className="
            absolute
            bottom-[-180px]
            left-[-120px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-blue-600/[0.07]
            blur-[140px]
          "
        />

        {/* Subtle grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.018]
            [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)]
            [background-size:40px_40px]
          "
        />

      </div>


      {/* =====================================================
          DASHBOARD CONTAINER
      ===================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          pb-28
          pt-4
          sm:px-6
          lg:px-8
        "
      >


        {/* =================================================
            WALLET / PORTFOLIO
        ================================================= */}

        <section
          className="
            relative
            mx-auto
            max-w-2xl
          "
        >

          {/* Soft glow behind wallet */}

          <div
            className="
              pointer-events-none
              absolute
              -inset-3
              rounded-[32px]
              bg-gradient-to-r
              from-cyan-400/[0.07]
              via-blue-500/[0.05]
              to-violet-500/[0.07]
              blur-2xl
            "
          />


          {/* =================================================
              REDUCED WALLET CARD
          ================================================= */}

          <div
            className="
              relative
              flex
              justify-center
              overflow-visible
            "
          >

            <div
              className="
                origin-top
                scale-[0.60]
              "
            >
              <WalletCard />
            </div>

          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section
          className="
            mx-auto
            mt-[-18rem]
            max-w-2xl
          "
        >

          <QuickActions />

        </section>


        {/* =================================================
            MARKET OVERVIEW
        ================================================= */}

        <section
          className="
            mx-auto
            mt-6
            max-w-2xl
          "
        >

          <div
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-white/[0.07]
              bg-white/[0.025]
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              backdrop-blur-xl
            "
          >

            {/* subtle accent */}

            <div
              className="
                pointer-events-none
                absolute
                right-[-80px]
                top-[-80px]
                h-40
                w-40
                rounded-full
                bg-cyan-400/[0.05]
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

        <section
          className="
            mx-auto
            mt-5
            max-w-2xl
          "
        >

          <div
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-white/[0.07]
              bg-white/[0.025]
              shadow-[0_20px_60px_rgba(0,0,0,0.22)]
              backdrop-blur-xl
            "
          >

            {/* violet accent */}

            <div
              className="
                pointer-events-none
                absolute
                bottom-[-80px]
                left-[-50px]
                h-40
                w-40
                rounded-full
                bg-violet-500/[0.05]
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