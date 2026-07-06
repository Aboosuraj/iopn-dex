"use client";

import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Scanner({ isOpen, onClose, onScan }: any) {
  useEffect(() => {
      if (!isOpen) return;

          const scanner = new Html5QrcodeScanner(
                "reader",
                      {
                              fps: 10,
                                      qrbox: 250,
                                            },
                                                  false
                                                      );

                                                          scanner.render(
                                                                (decodedText) => {
                                                                        onScan(decodedText);
                                                                                scanner.clear();
                                                                                        onClose();
                                                                                              },
                                                                                                    (error) => {
                                                                                                            // ignore scan errors
                                                                                                                  }
                                                                                                                      );

                                                                                                                          return () => {
                                                                                                                                scanner.clear().catch(() => {});
                                                                                                                                    };
                                                                                                                                      }, [isOpen]);

                                                                                                                                        if (!isOpen) return null;

                                                                                                                                          return (
                                                                                                                                              <div className="fixed inset-0 bg-black z-50 flex flex-col">

                                                                                                                                                    {/* HEADER */}
                                                                                                                                                          <div className="p-4 flex justify-between text-white">
                                                                                                                                                                  <h2 className="font-bold">Scan QR</h2>

                                                                                                                                                                          <button onClick={onClose}>Close</button>
                                                                                                                                                                                </div>

                                                                                                                                                                                      {/* SCANNER */}
                                                                                                                                                                                            <div className="flex-1 flex items-center justify-center">
                                                                                                                                                                                                    <div id="reader" className="w-full max-w-md" />
                                                                                                                                                                                                          </div>

                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                );
                                                                                                                                                                                                                }