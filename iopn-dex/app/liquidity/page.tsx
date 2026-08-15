"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Droplets,
  Gem,
  Layers3,
  LockKeyhole,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
  Waves,
  X,
} from "lucide-react";

import AddLiquidityModal from "@/components/liquidity/AddLiquidityModal";
import RemoveLiquidityModal from "@/components/liquidity/RemoveLiquidityModal";

import { useTokens } from "@/hooks/useTokens";
import { usePools } from "@/hooks/usePools";
import { usePoolDetails } from "@/hooks/usePoolDetails";
import { useLiquidity } from "@/hooks/useLiquidity";
import { useMyLiquidity } from "@/hooks/useMyLiquidity";
import { useRemoveLiquidity } from "@/hooks/useRemoveLiquidity";

export default function LiquidityPage() {
  const {
    isConnected,
  } = useAccount();

  const {
    addLiquidity,
    isPending,
  } = useLiquidity();

  const {
    removeLiquidity,
    isPending: removing,
  } = useRemoveLiquidity();

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    selectedPool,
    setSelectedPool,
  ] = useState<any>(null);

  const [
    showRemoveModal,
    setShowRemoveModal,
  ] = useState(false);

  const [
    selectedPosition,
    setSelectedPosition,
  ] = useState<any>(null);

  /* =========================================================
     UI STATE
  ========================================================= */

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "pools" | "liquidity" | "stake"
  >("pools");

  const [
    search,
    setSearch,
  ] = useState("");

  /* =========================================================
     DATA
  ========================================================= */

  const {
    tokens,
  } = useTokens();

  const {
    pairs,
    loading: poolsLoading,
  } = usePools();

  const {
    pools,
    loading: detailsLoading,
  } = usePoolDetails(
    pairs
  );

  const {
    positions,
    loading: positionsLoading,
  } = useMyLiquidity(
    pools
  );

  const loadingPools =
    poolsLoading ||
    detailsLoading;

  /* =========================================================
     FILTER POOLS
  ========================================================= */

  const filteredPools =
    pools?.filter((pool) => {
      const name =
        `${pool.symbol0} ${pool.symbol1}`
          .toLowerCase();

      return name.includes(
        search.toLowerCase()
      );
    }) ?? [];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#03050B]
        pb-28
        text-white
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
        <div
          className="
            absolute
            left-1/2
            top-[-220px]
            h-[480px]
            w-[480px]
            -translate-x-1/2
            rounded-full
            bg-cyan-500/[0.10]
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            right-[-180px]
            top-[30%]
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-600/[0.10]
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            bottom-[-180px]
            left-[-180px]
            h-[420px]
            w-[420px]
            rounded-full
            bg-blue-600/[0.08]
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px)]
            [background-size:42px_42px]
          "
        />
      </div>

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-2xl
          px-4
          pt-6
          sm:px-6
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            flex
            items-start
            justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  relative
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-cyan-400/20
                  bg-gradient-to-br
                  from-cyan-400/15
                  to-violet-500/15
                  shadow-[0_0_30px_rgba(34,211,238,0.08)]
                "
              >
                <div
                  className="
                    absolute
                    inset-0
                    bg-cyan-400/10
                    blur-xl
                  "
                />

                <Droplets
                  size={21}
                  className="
                    relative
                    text-cyan-300
                  "
                />
              </div>

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <h1
                    className="
                      text-2xl
                      font-black
                      tracking-tight
                    "
                  >
                    Liquidity
                  </h1>

                  <Sparkles
                    size={15}
                    className="text-cyan-300"
                  />
                </div>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-white/35
                  "
                >
                  Provide liquidity and power the IOPn ecosystem
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-2xl
              border
              border-white/[0.08]
              bg-white/[0.035]
              text-white/40
              backdrop-blur-xl
            "
          >
            <Activity size={18} />
          </div>
        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative
            mt-6
            overflow-hidden
            rounded-[28px]
            border
            border-cyan-400/[0.12]
            bg-gradient-to-br
            from-cyan-400/[0.10]
            via-white/[0.035]
            to-violet-500/[0.08]
            p-5
            shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
            backdrop-blur-2xl
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              right-[-70px]
              top-[-70px]
              h-48
              w-48
              rounded-full
              bg-cyan-400/[0.10]
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              bottom-[-80px]
              left-[35%]
              h-40
              w-40
              rounded-full
              bg-violet-500/[0.08]
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div>
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-cyan-400/15
                  bg-cyan-400/[0.06]
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-cyan-300
                "
              >
                <Waves size={12} />
                IOPn DeFi
              </div>

              <h2
                className="
                  mt-4
                  max-w-sm
                  text-2xl
                  font-black
                  leading-tight
                  tracking-tight
                "
              >
                Power the market.
                <span className="block text-cyan-300">
                  Earn from liquidity.
                </span>
              </h2>

              <p
                className="
                  mt-3
                  max-w-md
                  text-xs
                  leading-5
                  text-white/45
                "
              >
                Add liquidity to IOPn pools and help
                keep decentralized trading liquid and efficient.
              </p>
            </div>

            <div
              className="
                hidden
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-white/[0.08]
                bg-black/20
                sm:flex
              "
            >
              <Gem
                size={28}
                className="text-cyan-300"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-3
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-white/[0.08]
              bg-white/[0.035]
              p-4
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-white/35
                "
              >
                Total TVL
              </span>

              <CircleDollarSign
                size={16}
                className="text-cyan-300"
              />
            </div>

            <p
              className="
                mt-3
                text-lg
                font-black
              "
            >
              Coming Soon
            </p>
          </div>

          <div
            className="
              rounded-2xl
              border
              border-white/[0.08]
              bg-white/[0.035]
              p-4
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-white/35
                "
              >
                Pools
              </span>

              <Layers3
                size={16}
                className="text-violet-300"
              />
            </div>

            <p
              className="
                mt-3
                text-2xl
                font-black
              "
            >
              {pools?.length ?? 0}
            </p>
          </div>
        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-white/[0.08]
            bg-white/[0.025]
            p-1.5
            backdrop-blur-xl
          "
        >
          <div
            className="
              grid
              grid-cols-3
              gap-1
            "
          >
            {/* POOLS */}

            <button
              type="button"
              onClick={() =>
                setActiveTab("pools")
              }
              className={`
                relative
                flex
                min-h-[58px]
                flex-col
                items-center
                justify-center
                gap-1
                rounded-xl
                px-2
                text-[10px]
                font-bold
                transition-all
                ${
                  activeTab === "pools"
                    ? `
                      bg-gradient-to-br
                      from-cyan-400
                      to-blue-500
                      text-black
                      shadow-[0_8px_25px_rgba(34,211,238,0.15)]
                    `
                    : `
                      text-white/40
                      hover:bg-white/[0.04]
                      hover:text-white/70
                    `
                }
              `}
            >
              <Layers3 size={17} />

              <span>
                Pools
              </span>
            </button>

            {/* MY LIQUIDITY */}

            <button
              type="button"
              onClick={() =>
                setActiveTab("liquidity")
              }
              className={`
                flex
                min-h-[58px]
                flex-col
                items-center
                justify-center
                gap-1
                rounded-xl
                px-2
                text-[10px]
                font-bold
                transition-all
                ${
                  activeTab === "liquidity"
                    ? `
                      bg-gradient-to-br
                      from-cyan-400
                      to-blue-500
                      text-black
                      shadow-[0_8px_25px_rgba(34,211,238,0.15)]
                    `
                    : `
                      text-white/40
                      hover:bg-white/[0.04]
                      hover:text-white/70
                    `
                }
              `}
            >
              <Wallet size={17} />

              <span>
                My Liquidity
              </span>
            </button>

            {/* STAKE */}

            <button
              type="button"
              onClick={() =>
                setActiveTab("stake")
              }
              className={`
                flex
                min-h-[58px]
                flex-col
                items-center
                justify-center
                gap-1
                rounded-xl
                px-2
                text-[10px]
                font-bold
                transition-all
                ${
                  activeTab === "stake"
                    ? `
                      bg-gradient-to-br
                      from-cyan-400
                      to-blue-500
                      text-black
                      shadow-[0_8px_25px_rgba(34,211,238,0.15)]
                    `
                    : `
                      text-white/40
                      hover:bg-white/[0.04]
                      hover:text-white/70
                    `
                }
              `}
            >
              <TrendingUp size={17} />

              <span>
                Stake
              </span>
            </button>
          </div>
        </div>

        {/* =================================================
            POOLS TAB
        ================================================= */}

        {activeTab === "pools" && (
          <section className="mt-6">
            {/* SEARCH */}

            <div
              className="
                relative
              "
            >
              <Search
                size={17}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-white/25
                "
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search pools..."
                className="
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.035]
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  backdrop-blur-xl
                  transition
                  placeholder:text-white/25
                  focus:border-cyan-400/30
                  focus:bg-cyan-400/[0.025]
                "
              />
            </div>

            {/* SECTION HEADER */}

            <div
              className="
                mt-6
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-black
                  "
                >
                  Liquidity Pools
                </h2>

                <p
                  className="
                    mt-1
                    text-[11px]
                    text-white/30
                  "
                >
                  Available trading pools
                </p>
              </div>

              <span
                className="
                  rounded-full
                  border
                  border-white/[0.08]
                  bg-white/[0.035]
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  text-white/40
                "
              >
                {pools?.length ?? 0} pools
              </span>
            </div>

            {/* LOADING */}

            {loadingPools && (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.025]
                  p-4
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      h-7
                      w-7
                      animate-spin
                      rounded-full
                      border-2
                      border-cyan-300
                      border-t-transparent
                    "
                  />

                  <div>
                    <p
                      className="
                        text-xs
                        font-bold
                        text-cyan-300
                      "
                    >
                      Loading liquidity pools
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-white/30
                      "
                    >
                      Fetching pool data from IOPn...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SKELETON */}

            {loadingPools && (
              <div
                className="
                  mt-4
                  space-y-3
                "
              >
                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="
                        animate-pulse
                        rounded-3xl
                        border
                        border-white/[0.06]
                        bg-white/[0.025]
                        p-5
                      "
                    >
                      <div
                        className="
                          h-5
                          w-40
                          rounded
                          bg-white/[0.07]
                        "
                      />

                      <div
                        className="
                          mt-5
                          h-16
                          rounded-2xl
                          bg-white/[0.05]
                        "
                      />

                      <div
                        className="
                          mt-4
                          h-11
                          rounded-xl
                          bg-white/[0.06]
                        "
                      />
                    </div>
                  )
                )}
              </div>
            )}

            {/* POOL LIST */}

            {!loadingPools && (
              <div
                className="
                  mt-4
                  space-y-3
                "
              >
                {filteredPools.map(
                  (pool) => (
                    <div
                      key={pool.address}
                      className="
                        group
                        relative
                        overflow-hidden
                        rounded-[26px]
                        border
                        border-white/[0.08]
                        bg-white/[0.035]
                        p-4
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]
                        backdrop-blur-xl
                        transition
                        duration-200
                        hover:border-cyan-400/20
                        hover:bg-white/[0.045]
                      "
                    >
                      {/* GLOW */}

                      <div
                        className="
                          pointer-events-none
                          absolute
                          right-[-50px]
                          top-[-50px]
                          h-32
                          w-32
                          rounded-full
                          bg-cyan-400/[0.06]
                          blur-3xl
                        "
                      />

                      {/* TOP */}

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
                            gap-3
                          "
                        >
                          <div
                            className="
                              flex
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-2xl
                              border
                              border-cyan-400/10
                              bg-gradient-to-br
                              from-cyan-400/10
                              to-violet-500/10
                            "
                          >
                            <Droplets
                              size={20}
                              className="text-cyan-300"
                            />
                          </div>

                          <div>
                            <h3
                              className="
                                text-base
                                font-black
                              "
                            >
                              {pool.symbol0}
                              <span className="mx-1.5 text-white/20">
                                /
                              </span>
                              {pool.symbol1}
                            </h3>

                            <p
                              className="
                                mt-1
                                font-mono
                                text-[9px]
                                text-white/25
                              "
                            >
                              {pool.address.slice(
                                0,
                                8
                              )}
                              ...
                              {pool.address.slice(
                                -6
                              )}
                            </p>
                          </div>
                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-emerald-400/10
                            bg-emerald-400/[0.06]
                            px-2.5
                            py-1
                            text-[9px]
                            font-black
                            text-emerald-300
                          "
                        >
                          <span
                            className="
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-emerald-400
                            "
                          />

                          LIVE
                        </div>
                      </div>

                      {/* RESERVES */}

                      <div
                        className="
                          relative
                          mt-4
                          grid
                          grid-cols-2
                          gap-2
                        "
                      >
                        <div
                          className="
                            rounded-2xl
                            border
                            border-white/[0.05]
                            bg-black/20
                            p-3
                          "
                        >
                          <p
                            className="
                              text-[9px]
                              uppercase
                              tracking-wider
                              text-white/25
                            "
                          >
                            Reserve {pool.symbol0}
                          </p>

                          <p
                            className="
                              mt-1.5
                              truncate
                              text-sm
                              font-bold
                              text-white/80
                            "
                          >
                            {pool.reserve0}
                          </p>
                        </div>

                        <div
                          className="
                            rounded-2xl
                            border
                            border-white/[0.05]
                            bg-black/20
                            p-3
                          "
                        >
                          <p
                            className="
                              text-[9px]
                              uppercase
                              tracking-wider
                              text-white/25
                            "
                          >
                            Reserve {pool.symbol1}
                          </p>

                          <p
                            className="
                              mt-1.5
                              truncate
                              text-sm
                              font-bold
                              text-white/80
                            "
                          >
                            {pool.reserve1}
                          </p>
                        </div>
                      </div>

                      {/* ACTION */}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPool(
                            pool
                          );

                          setShowModal(
                            true
                          );
                        }}
                        className="
                          group/button
                          relative
                          mt-3
                          flex
                          h-11
                          w-full
                          items-center
                          justify-center
                          gap-2
                          overflow-hidden
                          rounded-xl
                          bg-gradient-to-r
                          from-cyan-400
                          to-blue-500
                          text-xs
                          font-black
                          text-black
                          shadow-[0_8px_25px_rgba(34,211,238,0.10)]
                          transition
                          hover:brightness-110
                          active:scale-[0.98]
                        "
                      >
                        <Plus size={16} />

                        Add Liquidity

                        <ArrowUpRight
                          size={14}
                          className="
                            opacity-50
                            transition
                            group-hover/button:translate-x-0.5
                            group-hover/button:-translate-y-0.5
                          "
                        />
                      </button>
                    </div>
                  )
                )}

                {filteredPools.length === 0 && (
                  <div
                    className="
                      rounded-3xl
                      border
                      border-white/[0.08]
                      bg-white/[0.025]
                      p-8
                      text-center
                    "
                  >
                    <div
                      className="
                        mx-auto
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-white/[0.04]
                      "
                    >
                      <Search
                        size={20}
                        className="text-white/25"
                      />
                    </div>

                    <p
                      className="
                        mt-4
                        text-sm
                        font-bold
                      "
                    >
                      No pools found
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-white/30
                      "
                    >
                      Try another pool name.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* =================================================
            MY LIQUIDITY
        ================================================= */}

        {activeTab === "liquidity" && (
          <section className="mt-6">
            <div
              className="
                rounded-[28px]
                border
                border-white/[0.08]
                bg-white/[0.035]
                p-5
                backdrop-blur-xl
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <h2
                    className="
                      text-lg
                      font-black
                    "
                  >
                    My Liquidity
                  </h2>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      text-white/30
                    "
                  >
                    Manage your LP positions
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-400/[0.08]
                  "
                >
                  <Wallet
                    size={18}
                    className="text-cyan-300"
                  />
                </div>
              </div>

              {!isConnected ? (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-black/20
                    p-5
                  "
                >
                  <LockKeyhole
                    size={20}
                    className="text-cyan-300"
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      font-bold
                    "
                  >
                    Wallet not connected
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-white/35
                    "
                  >
                    Connect your wallet to view
                    your liquidity positions.
                  </p>
                </div>
              ) : positionsLoading ? (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-cyan-400/10
                    bg-cyan-400/[0.025]
                    p-5
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        h-6
                        w-6
                        animate-spin
                        rounded-full
                        border-2
                        border-cyan-300
                        border-t-transparent
                      "
                    />

                    <span
                      className="
                        text-xs
                        font-bold
                        text-white/60
                      "
                    >
                      Loading your liquidity...
                    </span>
                  </div>
                </div>
              ) : positions.length === 0 ? (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-dashed
                    border-white/[0.10]
                    bg-black/20
                    p-6
                    text-center
                  "
                >
                  <Droplets
                    size={24}
                    className="
                      mx-auto
                      text-white/20
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      font-bold
                    "
                  >
                    No liquidity positions
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-white/30
                    "
                  >
                    Add liquidity to an available
                    pool to start your position.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        "pools"
                      )
                    }
                    className="
                      mt-4
                      rounded-xl
                      bg-cyan-400
                      px-4
                      py-2.5
                      text-xs
                      font-black
                      text-black
                    "
                  >
                    Explore Pools
                  </button>
                </div>
              ) : (
                <div
                  className="
                    mt-5
                    space-y-3
                  "
                >
                  {positions.map(
                    (position) => (
                      <div
                        key={
                          position.pair
                        }
                        className="
                          rounded-3xl
                          border
                          border-white/[0.08]
                          bg-black/20
                          p-4
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >
                            <div
                              className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-violet-400/[0.08]
                              "
                            >
                              <Droplets
                                size={18}
                                className="text-violet-300"
                              />
                            </div>

                            <div>
                              <h3
                                className="
                                  text-sm
                                  font-black
                                "
                              >
                                {
                                  position.pair
                                }
                              </h3>

                              <p
                                className="
                                  mt-1
                                  text-[9px]
                                  uppercase
                                  tracking-wider
                                  text-white/25
                                "
                              >
                                Liquidity Position
                              </p>
                            </div>
                          </div>

                          <span
                            className="
                              rounded-full
                              border
                              border-violet-400/10
                              bg-violet-400/[0.08]
                              px-2.5
                              py-1
                              text-[9px]
                              font-bold
                              text-violet-300
                            "
                          >
                            LP
                          </span>
                        </div>

                        <div
                          className="
                            mt-4
                            grid
                            grid-cols-2
                            gap-2
                          "
                        >
                          <div
                            className="
                              rounded-2xl
                              bg-white/[0.025]
                              p-3
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                text-white/25
                              "
                            >
                              LP Balance
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                font-bold
                              "
                            >
                              {
                                position.lpBalance
                              }
                            </p>
                          </div>

                          <div
                            className="
                              rounded-2xl
                              bg-white/[0.025]
                              p-3
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                text-white/25
                              "
                            >
                              Pool Share
                            </p>

                            <p
                              className="
                                mt-1
                                text-xs
                                font-bold
                                text-cyan-300
                              "
                            >
                              {
                                position.poolShare
                              }
                            </p>
                          </div>

                          <div
                            className="
                              rounded-2xl
                              bg-white/[0.025]
                              p-3
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                text-white/25
                              "
                            >
                              Token 0
                            </p>

                            <p
                              className="
                                mt-1
                                truncate
                                text-xs
                                font-bold
                              "
                            >
                              {
                                position.token0Amount
                              }
                            </p>
                          </div>

                          <div
                            className="
                              rounded-2xl
                              bg-white/[0.025]
                              p-3
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                text-white/25
                              "
                            >
                              Token 1
                            </p>

                            <p
                              className="
                                mt-1
                                truncate
                                text-xs
                                font-bold
                              "
                            >
                              {
                                position.token1Amount
                              }
                            </p>
                          </div>
                        </div>

                        <div
                          className="
                            mt-3
                            grid
                            grid-cols-2
                            gap-2
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setShowModal(
                                true
                              )
                            }
                            className="
                              flex
                              h-11
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              bg-gradient-to-r
                              from-cyan-400
                              to-blue-500
                              text-xs
                              font-black
                              text-black
                              transition
                              hover:brightness-110
                            "
                          >
                            <Plus
                              size={15}
                            />

                            Add More
                          </button>

                          <button
                            type="button"
                            disabled={
                              removing
                            }
                            onClick={() => {
                              setSelectedPosition(
                                position
                              );

                              setShowRemoveModal(
                                true
                              );
                            }}
                            className="
                              flex
                              h-11
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              border
                              border-red-400/10
                              bg-red-400/[0.06]
                              text-xs
                              font-black
                              text-red-300
                              transition
                              hover:bg-red-400/[0.10]
                              disabled:opacity-50
                            "
                          >
                            <X
                              size={15}
                            />

                            {removing
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            STAKE
        ================================================= */}

        {activeTab === "stake" && (
          <section className="mt-6 space-y-4">
            {/* STAKE HERO */}

            <div
              className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-violet-400/10
                bg-gradient-to-br
                from-violet-500/[0.10]
                via-white/[0.025]
                to-cyan-400/[0.06]
                p-5
              "
            >
              <div
                className="
                  absolute
                  right-[-50px]
                  top-[-50px]
                  h-36
                  w-36
                  rounded-full
                  bg-violet-500/[0.10]
                  blur-3xl
                "
              />

              <div
                className="
                  relative
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-violet-400/[0.08]
                    "
                  >
                    <TrendingUp
                      size={21}
                      className="text-violet-300"
                    />
                  </div>

                  <h2
                    className="
                      mt-4
                      text-xl
                      font-black
                    "
                  >
                    Stake Liquid Tokens
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-sm
                      text-xs
                      leading-5
                      text-white/35
                    "
                  >
                    Put your liquid assets to work
                    and earn rewards in OPN.
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-violet-400/10
                    bg-violet-400/[0.08]
                    px-3
                    py-1.5
                    text-[9px]
                    font-black
                    text-violet-300
                  "
                >
                  COMING SOON
                </span>
              </div>
            </div>

            {/* STAKE POSITION */}

            <div
              className="
                rounded-[26px]
                border
                border-white/[0.08]
                bg-white/[0.035]
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <h3
                    className="
                      text-base
                      font-black
                    "
                  >
                    Stake Position
                  </h3>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-white/30
                    "
                  >
                    Select an eligible liquid asset
                  </p>
                </div>

                <Gem
                  size={18}
                  className="text-cyan-300"
                />
              </div>

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-black/20
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-wider
                        text-white/25
                      "
                    >
                      Stake Token
                    </p>

                    <h4
                      className="
                        mt-1
                        text-base
                        font-black
                      "
                    >
                      USDT / OPNT
                    </h4>
                  </div>

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-cyan-400/[0.08]
                    "
                  >
                    <LockKeyhole
                      size={15}
                      className="text-cyan-300"
                    />
                  </div>
                </div>

                <div
                  className="
                    mt-5
                    space-y-3
                  "
                >
                  <div
                    className="
                      flex
                      justify-between
                      text-xs
                    "
                  >
                    <span className="text-white/35">
                      Stake Balance
                    </span>

                    <span className="font-bold">
                      --
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      text-xs
                    "
                  >
                    <span className="text-white/35">
                      APR
                    </span>

                    <span
                      className="
                        font-bold
                        text-emerald-300
                      "
                    >
                      --
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      text-xs
                    "
                  >
                    <span className="text-white/35">
                      Pending Rewards
                    </span>

                    <span className="font-bold">
                      0 OPN
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="
                    mt-5
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-cyan-400
                    to-violet-500
                    text-xs
                    font-black
                    text-black
                    opacity-80
                  "
                >
                  <LockKeyhole
                    size={14}
                  />

                  Stake
                </button>
              </div>
            </div>

            {/* REWARDS */}

            <div
              className="
                rounded-[26px]
                border
                border-emerald-400/10
                bg-emerald-400/[0.025]
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-400/[0.08]
                  "
                >
                  <CircleDollarSign
                    size={18}
                    className="text-emerald-300"
                  />
                </div>

                <div>
                  <h3
                    className="
                      text-base
                      font-black
                    "
                  >
                    Rewards
                  </h3>

                  <p
                    className="
                      text-[10px]
                      text-white/30
                    "
                  >
                    Track your staking rewards
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-5
                  space-y-3
                  text-xs
                "
              >
                <div
                  className="
                    flex
                    justify-between
                  "
                >
                  <span className="text-white/35">
                    Staked asset
                  </span>

                  <span className="font-bold">
                    --
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                  "
                >
                  <span className="text-white/35">
                    Earned OPN
                  </span>

                  <span
                    className="
                      font-bold
                      text-emerald-300
                    "
                  >
                    0.00 OPN
                  </span>
                </div>
              </div>

              <div
                className="
                  mt-5
                  grid
                  grid-cols-2
                  gap-2
                "
              >
                <button
                  type="button"
                  className="
                    h-11
                    rounded-xl
                    bg-emerald-400
                    text-xs
                    font-black
                    text-black
                    opacity-80
                  "
                >
                  Claim
                </button>

                <button
                  type="button"
                  className="
                    h-11
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.04]
                    text-xs
                    font-black
                    text-white/70
                  "
                >
                  Unstake
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            BOTTOM SECURITY INFO
        ================================================= */}

        <div
          className="
            mt-6
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.02]
            p-4
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-cyan-400/[0.07]
            "
          >
            <CheckCircle2
              size={16}
              className="text-cyan-300"
            />
          </div>

          <div>
            <p
              className="
                text-[11px]
                font-bold
                text-white/60
              "
            >
              Powered by IOPn
            </p>

            <p
              className="
                mt-1
                text-[10px]
                leading-5
                text-white/25
              "
            >
              Liquidity actions are executed through
              your connected wallet on the IOPn network.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          ADD LIQUIDITY MODAL
      ===================================================== */}

      <AddLiquidityModal
        open={showModal}
        selectedPool={selectedPool}
        onClose={() =>
          setShowModal(false)
        }
        tokens={tokens}
        pools={pools}
        loading={isPending}
        onSupply={async (
          tokenA,
          tokenB,
          amountA,
          amountB
        ) => {
          await addLiquidity(
            tokenA,
            tokenB,
            amountA,
            amountB
          );

          setShowModal(false);
        }}
      />

      {/* =====================================================
          REMOVE LIQUIDITY MODAL
      ===================================================== */}

      <RemoveLiquidityModal
        open={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
        }}
        position={selectedPosition}
        loading={removing}
        onRemove={async (
          percent
        ) => {
          console.log(
            "Remove percentage:",
            percent,
            selectedPosition
          );
        }}
      />
    </main>
  );
}