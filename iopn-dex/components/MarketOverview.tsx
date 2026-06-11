export default function MarketOverview() {
      return (
          <div className="p-8">
                <h2 className="text-2xl font-bold">
                        Market Overview
                              </h2>

                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div className="border p-4 rounded">
                                                      Total Market Cap
                                                              </div>

                                                                      <div className="border p-4 rounded">
                                                                                24h Volume
                                                                                        </div>

                                                                                                <div className="border p-4 rounded">
                                                                                                          Top Gainer
                                                                                                                  </div>

                                                                                                                          <div className="border p-4 rounded">
                                                                                                                                    Top Loser
                                                                                                                                            </div>
                                                                                                                                                  </div>
                                                                                                                                                      </div>
                                                                                                                                                        );
                                                                                                                                                        }