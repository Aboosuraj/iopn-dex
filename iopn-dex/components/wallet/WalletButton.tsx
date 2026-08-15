"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, ChevronDown, LogOut } from "lucide-react";

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready =
          mounted &&
          authenticationStatus !== "loading";

        const connected =
          ready &&
          account &&
          chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {!connected ? (
              /* =====================================================
                 CONNECT WALLET
              ===================================================== */
              <button
                type="button"
                onClick={openConnectModal}
                className="
                  group
                  relative
                  flex
                  h-10
                  items-center
                  gap-2
                  overflow-hidden
                  rounded-xl
                  border
                  border-cyan-400/30
                  bg-gradient-to-r
                  from-cyan-400/10
                  via-blue-500/10
                  to-violet-500/10
                  px-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_0_20px_rgba(34,211,238,0.08)]
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-cyan-300/50
                  hover:shadow-[0_0_28px_rgba(34,211,238,0.18)]
                  active:scale-[0.97]
                "
              >
                {/* Glow */}

                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-cyan-400/10
                    via-transparent
                    to-violet-500/10
                    opacity-0
                    transition
                    group-hover:opacity-100
                  "
                />

                {/* Icon */}

                <span
                  className="
                    relative
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    bg-cyan-400/10
                    text-cyan-300
                  "
                >
                  <Wallet size={15} />
                </span>

                <span className="relative">
                  Connect Wallet
                </span>
              </button>
            ) : chain.unsupported ? (
              /* =====================================================
                 WRONG NETWORK
              ===================================================== */
              <button
                type="button"
                onClick={openChainModal}
                className="
                  group
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-red-400/30
                  bg-red-400/10
                  px-3.5
                  text-sm
                  font-bold
                  text-red-300
                  shadow-[0_0_20px_rgba(248,113,113,0.08)]
                  backdrop-blur-xl
                  transition
                  hover:border-red-300/50
                  hover:bg-red-400/15
                  active:scale-[0.97]
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    animate-pulse
                    rounded-full
                    bg-red-400
                    shadow-[0_0_10px_rgba(248,113,113,0.9)]
                  "
                />

                Wrong Network
              </button>
            ) : (
              /* =====================================================
                 CONNECTED WALLET
              ===================================================== */
              <button
                type="button"
                onClick={openAccountModal}
                className="
                  group
                  relative
                  flex
                  h-10
                  items-center
                  gap-2
                  overflow-hidden
                  rounded-xl
                  border
                  border-cyan-400/25
                  bg-gradient-to-r
                  from-cyan-400/[0.08]
                  via-white/[0.035]
                  to-violet-500/[0.08]
                  px-2
                  shadow-[0_0_22px_rgba(34,211,238,0.08)]
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-cyan-300/45
                  hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]
                  active:scale-[0.97]
                "
              >
                {/* Animated glow */}

                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-cyan-400/10
                    via-transparent
                    to-violet-500/10
                    opacity-0
                    transition
                    duration-300
                    group-hover:opacity-100
                  "
                />

                {/* Network indicator */}

                <span
                  className="
                    relative
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-emerald-400/20
                    bg-emerald-400/10
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      animate-pulse
                      rounded-full
                      bg-emerald-400
                      shadow-[0_0_10px_rgba(52,211,153,0.9)]
                    "
                  />
                </span>

                {/* Address */}

                <span
                  className="
                    relative
                    max-w-[92px]
                    truncate
                    text-xs
                    font-bold
                    text-white/85
                    sm:max-w-[120px]
                  "
                >
                  {account.displayName}
                </span>

                {/* Chevron */}

                <ChevronDown
                  size={14}
                  className="
                    relative
                    shrink-0
                    text-white/40
                    transition
                    group-hover:text-cyan-300
                  "
                />
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}