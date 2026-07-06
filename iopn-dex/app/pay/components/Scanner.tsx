"use client";

import { QrReader } from "react-qr-reader";

export default function Scanner({ isOpen, onClose, onScan }: any) {
  if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black z-50">

              <div className="p-3 text-white flex justify-between">
                      <span>Scan QR</span>
                              <button onClick={onClose}>Close</button>
                                    </div>

                                          <QrReader
                                                  constraints={{ facingMode: "environment" }}
                                                          onResult={(result: any) => {
                                                                    if (result?.text?.startsWith("0x")) {
                                                                                onScan(result.text);
                                                                                            onClose();
                                                                                                      }
                                                                                                              }}
                                                                                                                    />

                                                                                                                        </div>
                                                                                                                          );
                                                                                                                          }