"use client";

import { QRCodeSVG } from "qrcode.react";

export default function ReceiveModal({
  isOpen,
    onClose,
      address,
      }: any) {
        if (!isOpen) return null;

          return (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

                    <div className="bg-black border p-6 rounded-xl">

                            <h2 className="text-white mb-4">Receive</h2>

                                    <div className="bg-white p-3">
                                              <QRCodeSVG value={address || ""} size={180} />
                                                      </div>

                                                              <p className="text-xs text-white mt-3 break-all">
                                                                        {address}
                                                                                </p>

                                                                                        <button
                                                                                                  onClick={onClose}
                                                                                                            className="mt-4 bg-green-500 w-full p-2"
                                                                                                                    >
                                                                                                                              Close
                                                                                                                                      </button>

                                                                                                                                            </div>

                                                                                                                                                </div>
                                                                                                                                                  );
                                                                                                                                                  }