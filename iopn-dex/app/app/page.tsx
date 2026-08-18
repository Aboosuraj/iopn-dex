"use client";

import { useEffect, useState } from "react";

import WalletCard from "@/components/dashboard/WalletCard";
import QuickActions from "@/components/dashboard/QuickActions";
import MarketOverview from "@/components/dashboard/MarketOverview";
import TrendingPreview from "@/components/dashboard/TrendingPreview";

export default function AppDashboard() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const updateTheme = () => {
      setIsDark(media.matches);
    };

    updateTheme();

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDark(event.matches);
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <>
      {/* =====================================================
          THEME OVERRIDES
          Fixes components that still contain hardcoded
          dark-mode colors.
      ===================================================== */}

      <style jsx global>{`
        /* ===================================================
           LIGHT MODE
           Completely remove dark dashboard styling
        =================================================== */

        .iopn-dashboard-light {
          background: #ffffff !important;
          color: #0f172a !important;
        }

        .iopn-dashboard-light
          [class*="bg-[#02050B]"],
        .iopn-dashboard-light
          [class*="bg-[#030712]"],
        .iopn-dashboard-light
          [class*="bg-[#050816]"],
        .iopn-dashboard-light
          [class*="bg-[#070C14]"],
        .iopn-dashboard-light
          [class*="bg-[#080D15]"],
        .iopn-dashboard-light
          [class*="bg-[#080C14]"],
        .iopn-dashboard-light
          [class*="bg-[#0A101A]"],
        .iopn-dashboard-light
          [class*="bg-[#0B1420]"],
        .iopn-dashboard-light
          [class*="bg-[#0C0B17]"],
        .iopn-dashboard-light
          [class*="bg-[#0F172A]"],
        .iopn-dashboard-light
          [class*="bg-[#111827]"],
        .iopn-dashboard-light
          [class*="bg-[#111021]"] {
          background-color: #ffffff !important;
        }

        /* Dark translucent backgrounds */

        .iopn-dashboard-light
          [class*="bg-black/"],
        .iopn-dashboard-light
          [class*="bg-white/["] {
          background-color: #f8fafc !important;
        }

        /* Borders */

        .iopn-dashboard-light
          [class*="border-white/"] {
          border-color: #e2e8f0 !important;
        }

        /* White text becomes dark */

        .iopn-dashboard-light
          [class*="text-white"] {
          color: #0f172a !important;
        }

        /* Muted white text */

        .iopn-dashboard-light
          [class*="text-white/"] {
          color: #64748b !important;
        }

        /* Keep cyan/violet accent colors */

        .iopn-dashboard-light
          [class*="text-cyan-"] {
          color: #0891b2 !important;
        }

        .iopn-dashboard-light
          [class*="text-violet-"] {
          color: #7c3aed !important;
        }

        /* Dark shadows disappear */

        .iopn-dashboard-light
          [class*="shadow-[0_"] {
          box-shadow:
            0 10px 30px rgba(15, 23, 42, 0.08) !important;
        }

        /* Remove dark glows */

        .iopn-dashboard-light
          [class*="blur-"] {
          opacity: 0 !important;
        }

        /* ===================================================
           DARK MODE
        =================================================== */

        .iopn-dashboard-dark {
          background: #02050b !important;
          color: #ffffff !important;
        }

        /* Smooth transition */

        .iopn-dashboard-light,
        .iopn-dashboard-dark {
          transition:
            background-color 300ms ease,
            color 300ms ease;
        }
      `}</style>

      <main
        className={
          isDark
            ? "iopn-dashboard-dark relative min-h-screen overflow-hidden"
            : "iopn-dashboard-light relative min-h-screen overflow-hidden"
        }
      >

        {/* =====================================================
            DARK MODE BACKGROUND
        ===================================================== */}

        {isDark && (
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
        )}


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

            {isDark && (
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
            )}

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
              className={
                isDark
                  ? `
                    relative
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-white/[0.07]
                    bg-[#070C14]/85
                    shadow-[0_15px_45px_rgba(0,0,0,0.22)]
                    backdrop-blur-xl
                  `
                  : `
                    relative
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_15px_45px_rgba(15,23,42,0.07)]
                  `
              }
            >

              {isDark && (
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
              )}

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
              className={
                isDark
                  ? `
                    relative
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-white/[0.07]
                    bg-[#070C14]/85
                    shadow-[0_15px_45px_rgba(0,0,0,0.20)]
                    backdrop-blur-xl
                  `
                  : `
                    relative
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_15px_45px_rgba(15,23,42,0.07)]
                  `
              }
            >

              {isDark && (
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
              )}

              <div className="relative">
                <TrendingPreview />
              </div>

            </div>

          </section>

        </div>

      </main>
    </>
  );
}