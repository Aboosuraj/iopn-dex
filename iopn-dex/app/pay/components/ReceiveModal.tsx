"use client";

import { QRCodeSVG } from "qrcode.react";
import { useMemo } from "react";

export default function ReceiveModal({
  isOpen,
    onClose,
      address,
      }: any) {
        if (!isOpen) return null;

          /* ================= DEEP LINK ================= */
            const deepLink = useMemo(() => {
                if (!address) return "";
                    return `iopn://pay/${address}`;
                      }, [address]);

                        /* ================= COPY ADDRESS ================= */
                          function copyAddress() {
                              if (!address) return;
                                  navigator.clipboard.writeText(address);
                                      alert("Address copied ✅");
                                        }

                                          /* ================= COPY LINK ================= */
                                            function copyLink() {
                                                navigator.clipboard.writeText(deepLink);
                                                    alert("Payment link copied ✅");
                                                      }

                                                        return (
                                                            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

                                                                  <div className="bg-black border border-white/10 p-6 rounded-xl w-full max-w-sm">

                                                                          {/* TITLE */}
                                                                                  <h2 className="text-white mb-4 text-center font-bold">
                                                                                            Receive Payment
                                                                                                    </h2>

                                                                                                            {/* QR CODE */}
                                                                                                                    <div className="bg-white p-3 flex justify-center rounded">
                                                                                                                              <QRCodeSVG value={`iopn://pay/${address}`} size={180} />
                                                                                                                                      </div>

                                                                                                                                              {/* ADDRESS */}
                                                                                                                                                      <p className="text-xs text-white mt-3 break-all text-center">
                                                                                                                                                                {address}
                                                                                                                                                                        </p>

                                                                                                                                                                                {/* DEEP LINK */}
                                                                                                                                                                                        <p className="text-xs text-white/50 mt-2 break-all text-center">
                                                                                                                                                                                                  {deepLink}
                                                                                                                                                                                                          </p>

                                                                                                                                                                                                                  {/* BUTTONS */}
                                                                                                                                                                                                                          <div className="mt-4 space-y-2">

                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                onClick={copyAddress}
                                                                                                                                                                                                                                                            className="bg-white/10 w-full p-2 rounded text-white"
                                                                                                                                                                                                                                                                      >
                                                                                                                                                                                                                                                                                  Copy Address
                                                                                                                                                                                                                                                                                            </button>

                                                                                                                                                                                                                                                                                                      <button
                                                                                                                                                                                                                                                                                                                  onClick={copyLink}
                                                                                                                                                                                                                                                                                                                              className="bg-white/10 w-full p-2 rounded text-white"
                                                                                                                                                                                                                                                                                                                                        >
                                                                                                                                                                                                                                                                                                                                                    Copy Payment Link
                                                                                                                                                                                                                                                                                                                                                              </button>

                                                                                                                                                                                                                                                                                                                                                                        <button
                                                                                                                                                                                                                                                                                                                                                                                    onClick={onClose}
                                                                                                                                                                                                                                                                                                                                                                                                className="bg-green-500 w-full p-2 rounded text-black font-bold"
                                                                                                                                                                                                                                                                                                                                                                                                          >
                                                                                                                                                                                                                                                                                                                                                                                                                      Close
                                                                                                                                                                                                                                                                                                                                                                                                                                </button>

                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                              </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                                                                                                                                                                    }