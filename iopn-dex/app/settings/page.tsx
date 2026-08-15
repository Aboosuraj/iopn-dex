"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [darkMode, setDarkMode] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("iopn-theme");

    if (savedTheme === "light") {
      setDarkMode(false);
    } else {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !darkMode);
    localStorage.setItem("iopn-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const resetSettings = () => {
    localStorage.removeItem("iopn-theme");
    setDarkMode(true);
  };

  return (
    <main
      className={`min-h-screen px-5 py-10 transition-colors duration-300 ${
        darkMode
          ? "bg-black text-white"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      <div className="mx-auto w-full max-w-md">

        {/* Header */}
        <div className="mb-8">
          <p
            className={`text-sm ${
              darkMode ? "text-white/50" : "text-slate-500"
            }`}
          >
            OG Swap
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Settings
          </h1>

          <p
            className={`mt-2 text-sm ${
              darkMode ? "text-white/50" : "text-slate-500"
            }`}
          >
            Manage your DEX preferences
          </p>
        </div>

        {/* Appearance */}
        <section className="mb-6">
          <h2
            className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
              darkMode ? "text-white/40" : "text-slate-500"
            }`}
          >
            Appearance
          </h2>

          <div
            className={`rounded-2xl border p-4 ${
              darkMode
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Dark Mode
                </p>

                <p
                  className={`mt-1 text-sm ${
                    darkMode
                      ? "text-white/50"
                      : "text-slate-500"
                  }`}
                >
                  {darkMode
                    ? "Dark theme is enabled"
                    : "Light theme is enabled"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                aria-label="Toggle dark mode"
                className={`relative h-7 w-12 rounded-full transition ${
                  darkMode
                    ? "bg-purple-500"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    darkMode
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Network */}
        <section className="mb-6">
          <h2
            className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
              darkMode ? "text-white/40" : "text-slate-500"
            }`}
          >
            Network
          </h2>

          <div
            className={`rounded-2xl border p-4 ${
              darkMode
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  OPN Testnet
                </p>

                <p
                  className={`mt-1 text-sm ${
                    darkMode
                      ? "text-white/50"
                      : "text-slate-500"
                  }`}
                >
                  Chain ID: 984
                </p>
              </div>

              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
                TESTNET
              </span>
            </div>
          </div>
        </section>

        {/* Wallet */}
        <section className="mb-6">
          <h2
            className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
              darkMode ? "text-white/40" : "text-slate-500"
            }`}
          >
            Wallet
          </h2>

          <div
            className={`rounded-2xl border p-4 ${
              darkMode
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white"
            }`}
          >
            {isConnected && address ? (
              <>
                <p className="text-sm font-semibold">
                  Connected Wallet
                </p>

                <p
                  className={`mt-2 break-all rounded-xl p-3 font-mono text-xs ${
                    darkMode
                      ? "bg-black/40 text-white/60"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {address}
                </p>

                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="mt-3 w-full rounded-xl bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                >
                  Disconnect Wallet
                </button>
              </>
            ) : (
              <p
                className={`text-sm ${
                  darkMode
                    ? "text-white/50"
                    : "text-slate-500"
                }`}
              >
                No wallet connected.
              </p>
            )}
          </div>
        </section>

        {/* Information */}
        <section className="mb-6">
          <h2
            className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
              darkMode ? "text-white/40" : "text-slate-500"
            }`}
          >
            Information
          </h2>

          <div className="space-y-3">

            <button
              type="button"
              onClick={() => setShowAbout(true)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                darkMode
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="font-semibold">
                About IOPn DEX
              </p>

              <p
                className={`mt-1 text-sm ${
                  darkMode
                    ? "text-white/50"
                    : "text-slate-500"
                }`}
              >
                Learn more about the decentralized exchange
              </p>
            </button>

            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                darkMode
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="font-semibold">
                Privacy Policy
              </p>

              <p
                className={`mt-1 text-sm ${
                  darkMode
                    ? "text-white/50"
                    : "text-slate-500"
                }`}
              >
                How your wallet and app data are handled
              </p>
            </button>

          </div>
        </section>

        {/* Reset */}
        <button
          type="button"
          onClick={resetSettings}
          className={`mb-10 w-full rounded-2xl border py-3 text-sm font-semibold transition ${
            darkMode
              ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Reset Settings
        </button>

        {/* About Modal */}
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div
              className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
                darkMode
                  ? "border-white/10 bg-[#111111]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold">
                About IOPn DEX
              </h2>

              <p
                className={`mt-4 text-sm leading-6 ${
                  darkMode
                    ? "text-white/60"
                    : "text-slate-600"
                }`}
              >
                IOPn DEX is a decentralized exchange interface
                built for the IOPn ecosystem. The application
                connects directly to blockchain contracts through
                your wallet.
              </p>

              <p
                className={`mt-3 text-sm ${
                  darkMode
                    ? "text-white/40"
                    : "text-slate-500"
                }`}
              >
                Network: OPN Testnet
                <br />
                Chain ID: 984
              </p>

              <button
                type="button"
                onClick={() => setShowAbout(false)}
                className="mt-6 w-full rounded-2xl bg-purple-500 py-3 font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Privacy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div
              className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
                darkMode
                  ? "border-white/10 bg-[#111111]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h2 className="text-2xl font-bold">
                Privacy Policy
              </h2>

              <div
                className={`mt-4 space-y-3 text-sm leading-6 ${
                  darkMode
                    ? "text-white/60"
                    : "text-slate-600"
                }`}
              >
                <p>
                  IOPn DEX does not require users to create an
                  account to connect a wallet.
                </p>

                <p>
                  Blockchain transactions are initiated by the
                  connected wallet and require user approval.
                </p>

                <p>
                  Wallet addresses and blockchain transactions
                  are publicly visible on the network.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="mt-6 w-full rounded-2xl bg-purple-500 py-3 font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}