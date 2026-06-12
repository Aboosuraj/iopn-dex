export default function AnalyticsCards() {
      const stats = [
          { title: "Total Volume", value: "$0" },
              { title: "Total Liquidity", value: "$0" },
                  { title: "Active Traders", value: "0" },
                      { title: "Total Pairs", value: "0" },
                        ];

                          return (
                              <div className="p-6">
                                    <h1 className="text-3xl font-bold mb-6">
                                            Analytics
                                                  </h1>

                                                        <div className="grid grid-cols-2 gap-4">
                                                                {stats.map((stat) => (
                                                                          <div
                                                                                      key={stat.title}
                                                                                                  className="border rounded-xl p-5 shadow-sm"
                                                                                                            >
                                                                                                                        <div className="text-sm opacity-70">
                                                                                                                                      {stat.title}
                                                                                                                                                  </div>

                                                                                                                                                              <div className="text-2xl font-bold mt-2">
                                                                                                                                                                            {stat.value}
                                                                                                                                                                                        </div>
                                                                                                                                                                                                  </div>
                                                                                                                                                                                                          ))}
                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                      );
                                                                                                                                                                                                                      }