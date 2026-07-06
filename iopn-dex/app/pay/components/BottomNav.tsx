"use client";

type Props = {
  active?: string;
    onChange: (tab: string) => void;
    };

    export default function BottomNav({ active = "pay", onChange }: Props) {
      const items = [
          { id: "home", label: "Home", icon: "🏠" },
              { id: "pay", label: "Pay", icon: "💸" },
                  { id: "trade", label: "Trade", icon: "📈" },
                      { id: "portfolio", label: "Portfolio", icon: "💼" },
                          { id: "wallet", label: "Wallet", icon: "👛" },
                            ];

                              return (
                                  <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl">

                                        <div className="mx-auto grid max-w-md grid-cols-5 py-2">

                                                {items.map((item) => (
                                                          <button
                                                                      key={item.id}
                                                                                  onClick={() => onChange(item.id)}
                                                                                              className={`flex flex-col items-center justify-center gap-1 text-xs transition ${
                                                                                                            active === item.id
                                                                                                                            ? "text-green-400"
                                                                                                                                            : "text-white/60"
                                                                                                                                                        }`}
                                                                                                                                                                  >
                                                                                                                                                                              <span className="text-lg">{item.icon}</span>
                                                                                                                                                                                          {item.label}
                                                                                                                                                                                                    </button>
                                                                                                                                                                                                            ))}

                                                                                                                                                                                                                  </div>

                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                        );
                                                                                                                                                                                                                        }