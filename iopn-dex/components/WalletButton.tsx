"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
      const { disconnect } = useDisconnect();

        if (isConnected) {
            return (
                  <button
                          onClick={() => disconnect()}
                                  className="rounded-xl bg-green-500 px-4 py-2 text-black font-bold"
                                        >
                                                {address?.slice(0, 6)}...{address?.slice(-4)}
                                                      </button>
                                                          );
                                                            }

                                                              return (
                                                                  <button
                                                                        onClick={() => connect({ connector: connectors[0] })}
                                                                              className="rounded-xl bg-purple-500 px-4 py-2 text-white font-bold"
                                                                                  >
                                                                                        Connect Wallet
                                                                                            </button>
                                                                                              );
                                                                                              }