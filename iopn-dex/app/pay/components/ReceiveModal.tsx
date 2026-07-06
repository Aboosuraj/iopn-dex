"use client";

import { useEffect } from "react";

type Props = {
  isOpen: boolean;
    onClose: () => void;
      address?: string;
      };

      export default function ReceiveModal({
        isOpen,
          onClose,
            address,
            }: Props) {
              if (!isOpen) return null;

                function copyAddress() {
                    if (!address) return;
                        navigator.clipboard.writeText(address);
                            alert("Address copied 📋");
                              }

                                return (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

                                          {/* MODAL BOX */}
                                                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">

                                                        {/* HEADER */}
                                                                <div className="mb-4 flex items-center justify-between">
                                                                          <h2 className="text-lg font-bold text-white">
                                                                                      Receive Funds
                                                                                                </h2>

                                                                                                          <button
                                                                                                                      onClick={onClose}
                                                                                                                                  className="text-white/60 hover:text-white"
                                                                                                                                            >
                                                                                                                                                        ✕
                                                                                                                                                                  </button>
                                                                                                                                                                          </div>

                                                                                                                                                                                  {/* QR BOX */}
                                                                                                                                                                                          <div className="flex flex-col items-center justify-center">

                                                                                                                                                                                                    <div className="mb-4 h-40 w-40 rounded-2xl bg-white p-2 flex items-center justify-center">
                                                                                                                                                                                                                {/* QR PLACEHOLDER (we'll upgrade later) */}
                                                                                                                                                                                                                            <span className="text-xs text-black text-center">
                                                                                                                                                                                                                                          QR CODE
                                                                                                                                                                                                                                                        <br />
                                                                                                                                                                                                                                                                      (wallet address)
                                                                                                                                                                                                                                                                                  </span>
                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                      {/* ADDRESS */}
                                                                                                                                                                                                                                                                                                                <p className="mb-4 break-all text-center text-sm text-white/70">
                                                                                                                                                                                                                                                                                                                            {address || "Wallet not connected"}
                                                                                                                                                                                                                                                                                                                                      </p>

                                                                                                                                                                                                                                                                                                                                              </div>

                                                                                                                                                                                                                                                                                                                                                      {/* ACTIONS */}
                                                                                                                                                                                                                                                                                                                                                              <div className="flex gap-3">

                                                                                                                                                                                                                                                                                                                                                                        <button
                                                                                                                                                                                                                                                                                                                                                                                    onClick={copyAddress}
                                                                                                                                                                                                                                                                                                                                                                                                className="flex-1 rounded-2xl bg-green-500 py-3 font-bold text-black"
                                                                                                                                                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                                                                                                                                                      Copy
                                                                                                                                                                                                                                                                                                                                                                                                                                </button>

                                                                                                                                                                                                                                                                                                                                                                                                                                          <button
                                                                                                                                                                                                                                                                                                                                                                                                                                                      onClick={onClose}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  className="flex-1 rounded-2xl bg-white/10 py-3 text-white"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        Close
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </button>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }