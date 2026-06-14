export default function TopPairs() {
      const pairs = [
          { pair: "IDEX/OPN", volume: "$0" },
              { pair: "DIO/OPN", volume: "$0" },
                  { pair: "DAA/OPN", volume: "$0" },
                    ];

                      return (
                          <div className="border rounded-xl p-5 mt-6">
                                <h2 className="text-xl font-bold mb-4">
                                        Top Trading Pairs
                                              </h2>

                                                    {pairs.map((pair) => (
                                                            <div
                                                                      key={pair.pair}
                                                                                className="flex justify-between py-2 border-b"
                                                                                        >
                                                                                                  <span>{pair.pair}</span>
                                                                                                            <span>{pair.volume}</span>
                                                                                                                    </div>
                                                                                                                          ))}
                                                                                                                              </div>
                                                                                                                                );
                                                                                                                                }