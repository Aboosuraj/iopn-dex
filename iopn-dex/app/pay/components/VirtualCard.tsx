"use client";

type Props = {
  balance: string;
    token: string;
      address?: string;
        isOpen: boolean;
          onClose: () => void;
          };

          export default function VirtualCard({
            balance,
              token,
                address,
                  isOpen,
                    onClose,
                    }: Props) {
                      if (!isOpen) return null;

                        const shortAddress = address
                            ? `${address.slice(0, 6)}...${address.slice(-4)}`
                                : "Not connected";

                                  return (
                                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

                                            {/* CARD WRAPPER */}
                                                  <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6 shadow-2xl">

                                                          {/* HEADER */}
                                                                  <div className="flex items-center justify-between">
                                                                            <h2 className="text-white font-bold text-lg">
                                                                                        Virtual Card
                                                                                                  </h2>

                                                                                                            <button
                                                                                                                        onClick={onClose}
                                                                                                                                    className="text-white/80 hover:text-white"
                                                                                                                                              >
                                                                                                                                                          ✕
                                                                                                                                                                    </button>
                                                                                                                                                                            </div>

                                                                                                                                                                                    {/* CHIP */}
                                                                                                                                                                                            <div className="mt-6 h-10 w-14 rounded-lg bg-yellow-300/90 shadow-md"></div>

                                                                                                                                                                                                    {/* BALANCE */}
                                                                                                                                                                                                            <div className="mt-6">
                                                                                                                                                                                                                      <p className="text-white/70 text-sm">
                                                                                                                                                                                                                                  Available Balance
                                                                                                                                                                                                                                            </p>

                                                                                                                                                                                                                                                      <h1 className="text-3xl font-bold text-white mt-1">
                                                                                                                                                                                                                                                                  {balance} {token}
                                                                                                                                                                                                                                                                            </h1>
                                                                                                                                                                                                                                                                                    </div>

                                                                                                                                                                                                                                                                                            {/* ADDRESS */}
                                                                                                                                                                                                                                                                                                    <div className="mt-6">
                                                                                                                                                                                                                                                                                                              <p className="text-white/60 text-xs">
                                                                                                                                                                                                                                                                                                                          Wallet Address
                                                                                                                                                                                                                                                                                                                                    </p>

                                                                                                                                                                                                                                                                                                                                              <p className="text-white text-sm break-all">
                                                                                                                                                                                                                                                                                                                                                          {shortAddress}
                                                                                                                                                                                                                                                                                                                                                                    </p>
                                                                                                                                                                                                                                                                                                                                                                            </div>

                                                                                                                                                                                                                                                                                                                                                                                    {/* STATUS */}
                                                                                                                                                                                                                                                                                                                                                                                            <div className="mt-6 flex justify-between text-xs text-white/80">
                                                                                                                                                                                                                                                                                                                                                                                                      <span>STATUS</span>
                                                                                                                                                                                                                                                                                                                                                                                                                <span className="text-green-300 font-bold">ACTIVE</span>
                                                                                                                                                                                                                                                                                                                                                                                                                        </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                {/* CARD NUMBER (FAKE UI ONLY) */}
                                                                                                                                                                                                                                                                                                                                                                                                                                        <div className="mt-4 text-white tracking-widest text-sm">
                                                                                                                                                                                                                                                                                                                                                                                                                                                  **** **** **** 9840
                                                                                                                                                                                                                                                                                                                                                                                                                                                          </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      }